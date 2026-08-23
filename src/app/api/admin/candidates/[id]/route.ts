import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendUserAlert } from '@/lib/mail' // 🔴 Import the email function

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { status, notes } = body

    // 1. Get the registration data
    const { data: reg, error: fetchErr } = await supabaseServer
      .from('candidate_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !reg) throw new Error('Registration not found')

    // 2. Update registration status
    const { error: updateErr } = await supabaseServer
      .from('candidate_registrations')
      .update({ status, notes, reviewed_at: new Date().toISOString(), reviewed_by: payload.userId })
      .eq('id', id)

    if (updateErr) throw updateErr

    // 3. If Approved, create their public profiles!
    if (status === 'verified') {
      // A. Check if they exist in public.users table
      const { data: existingUser } = await supabaseServer
        .from('users')
        .select('id')
        .eq('id', reg.user_id)
        .maybeSingle()

      // B. If not, create their public.users profile first
      if (!existingUser) {
        const { error: userInsertErr } = await supabaseServer
          .from('users')
          .insert({
            id: reg.user_id, 
            email: reg.email,
            full_name: reg.full_name,
            avatar_url: reg.avatar_url,
            role: 'candidate',
            password_hash: 'managed_by_supabase_auth',
            is_active: true,
            civict_balance: 0,
            state: reg.state_constituency,
            lga: reg.lga_constituency,
            ward: reg.ward
          })

        if (userInsertErr) throw userInsertErr
      }

      // C. Check if they already exist in candidates table
      const { data: existingCand } = await supabaseServer
        .from('candidates')
        .select('id')
        .eq('user_id', reg.user_id)
        .maybeSingle()

      // D. If not, create their candidates profile
      if (!existingCand) {
        const { error: candInsertErr } = await supabaseServer
          .from('candidates')
          .insert({
            user_id: reg.user_id,
            full_name: reg.full_name,
            avatar_url: reg.avatar_url,
            party: reg.party,
            office: reg.position,
            state: reg.state_constituency,
            lga: reg.lga_constituency,
            ward: reg.ward,
            manifesto: reg.manifesto_summary,
            is_verified: true,
            is_active: true,
            subscription_plan: 'basic'
          })

        if (candInsertErr) throw candInsertErr
      }

      // 🔴 NEW: Send the Candidate Approval Email!
      await sendUserAlert(
        reg.email,
        'Your DICO Candidate Profile is Verified! 🎉',
        `Congratulations ${reg.full_name}! <br/><br/>Your candidate profile has been reviewed and approved by our admin team. You can now log in to the DICO platform, post updates, and start engaging with verified voters in your constituency.`
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}