// src/app/api/auth/change-password/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { current_password, new_password } = await request.json()
  if (!current_password || !new_password || new_password.length < 6) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin.from('users').select('password_hash').eq('id', payload.userId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const valid = await bcrypt.compare(current_password, user.password_hash)
  if (!valid) return NextResponse.json({ error: 'Current password incorrect' }, { status: 401 })

  const password_hash = await bcrypt.hash(new_password, 12)
  await supabaseAdmin.from('users').update({ password_hash }).eq('id', payload.userId)

  return NextResponse.json({ message: 'Password changed' })
}
