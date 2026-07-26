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
  state: z.string().optional(),
  lga: z.string().optional(),
  ward: z.string().optional(),
  party: z.string().optional(),
  office_level: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }

  const { email, password, full_name, role, state, lga, ward, party, office_level } = parsed.data

  const { data: existing } = await supabaseAdmin
    .from('users').select('id').eq('email', email).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const password_hash = await bcrypt.hash(password, 12)

  const { data: user, error } = await supabaseAdmin.from('users').insert({
    email, password_hash, full_name, role,
    state: state || null, lga: lga || null, ward: ward || null,
    is_active: true,
    civict_balance: role === 'voter' ? 100 : 0,
  }).select('id, email, role, full_name, ward, lga, state, civict_balance').single()

  if (error) return NextResponse.json({ error: 'Registration failed' }, { status: 500 })

  if (role === 'voter') {
    await supabaseAdmin.from('civict_transactions').insert({
      user_id: user.id, type: 'signup_bonus', amount: 100,
      description: 'Welcome bonus — you joined the People\'s Exchange',
    })
  }

  if (role === 'candidate') {
    await supabaseAdmin.from('candidates').insert({
      user_id: user.id, full_name, party: party || '', office: office_level || '',
      state: state || '', lga: lga || '', ward: ward || '',
      is_active: true,
    })
  }

  const token = await signToken(user.id, user.role)

  const response = NextResponse.json({ token, user }, { status: 201 })
  response.cookies.set('token', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 604800,
  })

  return response
}
