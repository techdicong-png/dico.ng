import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { signToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, password_hash, role, full_name, ward, lga, state, is_active, civict_balance')
    .eq('email', email)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  if (!user.is_active) {
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Update last_seen
  await supabaseAdmin.from('users').update({ last_seen: new Date().toISOString() }).eq('id', user.id)

  const token = await signToken(user.id, user.role)

  const { password_hash, ...safeUser } = user

  const response = NextResponse.json({ token, user: safeUser })

  // Set httpOnly cookie so middleware can read it
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}
