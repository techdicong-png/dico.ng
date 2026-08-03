import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { signToken } from '@/lib/auth'

// Initialize clients inline (No @/lib/supabase import)
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

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

  // ──────────────────────────────────────────────────────────────
  // PATH 1: Supabase Auth (For Candidates)
  // ──────────────────────────────────────────────────────────────
  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  })

  // If Supabase Auth succeeds, log them in
  if (!authError && authData.user) {
    // Check if they already have a profile in our custom users table
    let { data: dbUser } = await supabaseServer
      .from('users')
      .select('id, email, password_hash, role, full_name, ward, lga, state, is_active, civict_balance')
      .eq('email', email)
      .single()

    // If they don't exist in custom users table (first time logging in), create them
    if (!dbUser) {
      const { data: newUser, error: insertErr } = await supabaseServer
        .from('users')
        .insert({
          id: authData.user.id, // Link to Supabase Auth UID
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || 'New Candidate',
          role: authData.user.user_metadata?.role || 'candidate',
          password_hash: 'managed_by_supabase_auth',
          is_active: true,
          civict_balance: 0
        })
        .select('id, email, password_hash, role, full_name, ward, lga, state, is_active, civict_balance')
        .single()

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
      dbUser = newUser
    }

    if (!dbUser.is_active) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // Update last_seen
    await supabaseServer.from('users').update({ last_seen: new Date().toISOString() }).eq('id', dbUser.id)

    const token = await signToken(dbUser.id, dbUser.role)
    const { password_hash, ...safeUser } = dbUser

    const response = NextResponse.json({ token, user: safeUser })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  }

  // ──────────────────────────────────────────────────────────────
  // PATH 2: Custom Auth Fallback (For Voters)
  // ──────────────────────────────────────────────────────────────
  const { data: user, error } = await supabaseServer
    .from('users')
    .select('id, email, password_hash, role, full_name, ward, lga, state, is_active, civict_balance')
    .eq('email', email)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Prevent fallback from trying to validate a Supabase-managed account
  if (user.password_hash === 'managed_by_supabase_auth') {
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
  await supabaseServer.from('users').update({ last_seen: new Date().toISOString() }).eq('id', user.id)

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