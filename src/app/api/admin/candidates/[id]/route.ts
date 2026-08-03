import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // YOU MUST AWAIT PARAMS HERE:
    const { id } = await params

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { status, notes } = body

    const { data: reg, error: fetchErr } = await supabaseServer
      .from('candidate_registrations')
      .select('*')
      .eq('id', id) // Use the unwrapped 'id' here
      .single()

    if (fetchErr || !reg) throw new Error('Registration not found')

    const { error: updateErr } = await supabaseServer
      .from('candidate_registrations')
      .update({ status, notes, reviewed_at: new Date().toISOString(), reviewed_by: payload.userId })
      .eq('id', id)

    if (updateErr) throw updateErr

    if (status === 'verified') {
      const { data: existingCand } = await supabaseServer
        .from('candidates')
        .select('id')
        .eq('user_id', reg.user_id)
        .maybeSingle()

      if (!existingCand) {
        const { error: candInsertErr } = await supabaseServer
          .from('candidates')
          .insert({
            user_id: reg.user_id,
            full_name: reg.full_name,
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
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}