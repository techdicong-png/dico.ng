import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { sendOTPEmail } from '@/lib/mail'

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  state: z.string().optional(),
  lga: z.string().optional(),
  ward: z.string().optional(),
  role: z.string(),
  ref: z.string().uuid().nullable().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { full_name, email, password, state, lga, ward, role, ref } = parsed.data

    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: { data: { full_name, role: role || 'voter' } }
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json({ error: 'Email already registered. Please log in or request a new code.' }, { status: 409 })
      }
      return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Failed to create auth account.' }, { status: 500 })

    const { data: newUser, error: dbError } = await supabaseServer
      .from('users')
      .insert({
        id: userId, email, full_name, role: role || 'voter', state: state || null, lga: lga || null, ward: ward || null,
        is_active: true, civict_balance: 100, password_hash: 'managed_by_supabase_auth', referred_by: ref || null
      })
      .select('id, full_name, email, role, civict_balance')
      .single()

    if (dbError) {
      if (dbError.code === '23505') return NextResponse.json({ success: true, message: 'Account already exists. Please check your email for the 6-digit code.' })
      throw dbError
    }

    await supabaseServer.from('civict_transactions').insert({ user_id: userId, type: 'earn', amount: 100, description: 'Sign-Up Bonus' })

    if (ref) {
      const { data: referrer } = await supabaseServer.from('users').select('id, civict_balance, full_name').eq('id', ref).single()
      if (referrer) {
        await supabaseServer.from('users').update({ civict_balance: 150 }).eq('id', userId)
        await supabaseServer.from('civict_transactions').insert({ user_id: userId, type: 'earn', amount: 50, description: `Referral Bonus from ${referrer.full_name}` })
        await supabaseServer.from('users').update({ civict_balance: referrer.civict_balance + 50 }).eq('id', referrer.id)
        await supabaseServer.from('civict_transactions').insert({ user_id: referrer.id, type: 'earn', amount: 50, description: `Referral Bonus for inviting ${full_name}` })
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)
    const otpHash = await bcrypt.hash(otp, 10)

    const { error: otpInsertErr } = await supabaseServer.from('email_otp').insert({
      user_id: userId, email, otp_hash: otpHash, purpose: 'verify_email', expires_at: expiresAt.toISOString(), used: false
    })

    if (otpInsertErr) return NextResponse.json({ error: 'Failed to generate verification code.' }, { status: 500 })

    await sendOTPEmail(email, otp, full_name)

    return NextResponse.json({ success: true, message: 'Account created! Check your email.', email })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}