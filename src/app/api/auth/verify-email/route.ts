import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
})

export async function POST(req: Request) {
  try {
    const { email, otp } = schema.parse(await req.json())
    console.log(`Verifying OTP for ${email}...`)
    
    // 1. Fetch the OTP record
    const { data: otpRecord, error } = await supabaseServer
      .from('email_otp')
      .select('*')
      .eq('email', email)
      .eq('purpose', 'verify_email')
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('DB Error fetching OTP:', error)
      return NextResponse.json({ error: 'Database error.' }, { status: 500 })
    }

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
    }

    // 2. Verify the hash
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 400 })
    }

    // 3. Mark OTP as used
    await supabaseServer.from('email_otp').update({ used: true }).eq('id', otpRecord.id)

    // 4. REMOVED: The Supabase Admin call that was causing the "User not found" crash.
    // Since "Confirm email" is OFF in Supabase, the user is already verified and can log in.

    return NextResponse.json({ success: true, message: 'Email verified successfully! You can now log in.' })

  } catch (err: any) {
    console.error('Server error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}