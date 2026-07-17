// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { signToken } from '@/lib/auth'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role: z.enum(['voter', 'candidate']),
  phone: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  ward: z.string().optional(),
  vin: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }

  const { email, password, full_name, role, phone, state, lga, ward, vin } = parsed.data

  // Require VIN for voters
  if (role === 'voter' && !vin) {
    return NextResponse.json({ error: 'VIN is required for voter registration' }, { status: 400 })
  }

  // Check duplicate email
  const { data: existing } = await supabaseAdmin
    .from('users').select('id').eq('email', email).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { data: user, error } = await supabaseAdmin.from('users').insert({
    email,
    password_hash,
    full_name,
    role,
    phone: phone || null,
    state: state || null,
    lga: lga || null,
    ward: ward || null,
    vin: role === 'voter' ? vin : null,
    is_active: true,
    civict_balance: role === 'voter' ? 100 : 0,
  }).select('id, email, role, full_name, ward, lga, state, civict_balance').single()

  if (error) {
    console.error('REGISTER ERROR:', error)  // ← Check your terminal
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // if (error) {
  //   return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  // }

  // Seed CIVICT bonus for voters
  if (role === 'voter') {
    await supabaseAdmin.from('civict_transactions').insert({
      user_id: user.id,
      type: 'signup_bonus',
      amount: 100,
      description: 'Welcome bonus — you joined the People\'s Exchange',
    })
  }

  const token = await signToken(user.id, user.role)

  const response = NextResponse.json({ token, user }, { status: 201 })
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}
