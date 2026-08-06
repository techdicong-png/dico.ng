import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase' // Or however you initialize it inline
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

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
  role: z.string()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { full_name, email, password, state, lga, ward, role } = parsed.data

    // 1. Hash the password
    const password_hash = await bcrypt.hash(password, 10)

    // 2. Insert into users table WITH THE 100 CIVICT BONUS
    const { data: user, error } = await supabaseServer
      .from('users')
      .insert({
        full_name,
        email,
        password_hash,
        role: role || 'voter',
        state: state || null,
        lga: lga || null,
        ward: ward || null,
        is_active: true,
        civict_balance: 100 // <--- THE FIX IS HERE
      })
      .select('id, full_name, email, role, state, lga, ward, civict_balance')
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      throw error
    }

    // 3. Record the sign-up bonus transaction
    await supabaseServer.from('civict_transactions').insert({
      user_id: user.id,
      type: 'earn',
      amount: 100,
      description: 'Sign-Up Bonus'
    })

    // 4. Generate JWT
    const token = await signToken(user.id, user.role)

    const response = NextResponse.json({ token, user })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err: any) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}