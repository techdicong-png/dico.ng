import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendOTPEmail } from '@/lib/mail'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json())

    // 1. Find user by email
    const { data: user, error: userErr } = await supabaseServer
      .from('users')
      .select('id, full_name')
      .eq('email', email)
      .single()

    if (userErr || !user) {
      // For security, don't reveal if the email exists or not. Just return success.
      return NextResponse.json({ success: true })
    }

    // 2. Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 mins expiry

    const otpHash = await bcrypt.hash(otp, 10)

    // 3. Insert OTP record with purpose 'reset_password'
    const { error: otpInsertErr } = await supabaseServer.from('email_otp').insert({
      user_id: user.id,
      email,
      otp_hash: otpHash,
      purpose: 'reset_password',
      expires_at: expiresAt.toISOString(),
      used: false
    })

    if (otpInsertErr) {
      console.error('Failed to save reset OTP:', otpInsertErr)
      return NextResponse.json({ error: 'Failed to generate code.' }, { status: 500 })
    }

    // 4. Send email via Brevo
    await sendOTPEmail(email, otp, user.full_name)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}