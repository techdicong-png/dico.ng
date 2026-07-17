// src/app/api/otp/send-verification/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { data: user } = await supabaseAdmin.from('users').select('email, full_name').eq('id', payload.userId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const otp_hash = await bcrypt.hash(otp, 10)
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await supabaseAdmin.from('email_otp').update({ used: true }).eq('user_id', payload.userId).eq('purpose', 'verify_email').eq('used', false)
  await supabaseAdmin.from('email_otp').insert({ user_id: payload.userId, email: user.email, otp_hash, purpose: 'verify_email', expires_at })

  console.log(`[OTP] ${otp} for ${user.email}`) // In dev, logs to terminal

  return NextResponse.json({ message: 'Code sent' })
}
