// src/app/api/otp/verify-email/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { otp } = await request.json()

  const { data: records } = await supabaseAdmin.from('email_otp')
    .select('id, otp_hash, expires_at').eq('user_id', payload.userId)
    .eq('purpose', 'verify_email').eq('used', false).order('created_at', { ascending: false }).limit(1)

  const record = records?.[0]
  if (!record) return NextResponse.json({ error: 'No OTP found' }, { status: 400 })
  if (new Date(record.expires_at) < new Date()) return NextResponse.json({ error: 'OTP expired' }, { status: 400 })

  const match = await bcrypt.compare(otp, record.otp_hash)
  if (!match) return NextResponse.json({ error: 'Incorrect code' }, { status: 400 })

  await supabaseAdmin.from('email_otp').update({ used: true }).eq('id', record.id)
  await supabaseAdmin.from('users').update({ email_verified: true }).eq('id', payload.userId)

  // Award CIVICT
  const { data: existing } = await supabaseAdmin.from('civict_transactions')
    .select('id').eq('user_id', payload.userId).eq('type', 'email_verify_bonus').maybeSingle()

  if (!existing) {
    await supabaseAdmin.from('civict_transactions').insert({
      user_id: payload.userId, type: 'email_verify_bonus', amount: 50,
      description: 'Email verified — bonus CIVICT',
    })
    await supabaseAdmin.rpc('add_civict', { uid: payload.userId, amount: 50 })
  }

  return NextResponse.json({ message: 'Email verified', civict_earned: 50 })
}
