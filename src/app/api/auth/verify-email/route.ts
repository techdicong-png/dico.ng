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
    console.log(`[VERIFY] Attempting to verify OTP for ${email}...`)
    
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
      console.error('[VERIFY] DB Error fetching OTP:', error)
      return NextResponse.json({ error: 'Database error.' }, { status: 500 })
    }

    if (!otpRecord) {
      console.log('[VERIFY] No valid OTP found for this email.')
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      console.log('[VERIFY] OTP has expired.')
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
    }

    // 2. Verify the hash
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash)
    if (!isValid) {
      console.log('[VERIFY] Invalid OTP entered.')
      return NextResponse.json({ error: 'Invalid code.' }, { status: 400 })
    }

    console.log('[VERIFY] OTP is valid! Marking as used...')

    // 3. Mark OTP as used
    await supabaseServer.from('email_otp').update({ used: true }).eq('id', otpRecord.id)

    // 4. Mark the user as email_verified
    console.log(`[VERIFY] Updating email_verified=true for user ${otpRecord.user_id}...`)
    const { data: updatedUser, error: userUpdateError } = await supabaseServer
      .from('users')
      .update({ email_verified: true })
      .eq('id', otpRecord.user_id)
      .select('id, email, email_verified')
      .single()

    if (userUpdateError) {
      console.error('[VERIFY] Failed to update email_verified:', userUpdateError)
      return NextResponse.json({ error: 'Failed to verify user.' }, { status: 500 })
    }

    console.log('[VERIFY] User successfully updated:', updatedUser)

    return NextResponse.json({ success: true, message: 'Email verified successfully! You can now log in.' })

  } catch (err: any) {
    console.error('[VERIFY] Server error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}