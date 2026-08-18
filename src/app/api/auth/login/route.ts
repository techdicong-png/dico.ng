import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { signToken } from '@/lib/auth'

// Initialize clients inline
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
  // PATH 1: Supabase Auth (For Candidates & New Voters)
  // ──────────────────────────────────────────────────────────────
  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  })

  if (!authError && authData.user) {
    let { data: dbUser } = await supabaseServer
      .from('users')
      .select('id, email, password_hash, role, full_name, ward, lga, state, is_active, civict_balance, email_verified')
      .eq('email', email)
      .single()

    // If they don't exist in custom users table (first time logging in), create them
    if (!dbUser) {
      const { data: newUser, error: insertErr } = await supabaseServer
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || 'New User',
          role: authData.user.user_metadata?.role || 'voter',
          password_hash: 'managed_by_supabase_auth',
          is_active: true,
          civict_balance: 0,
          email_verified: false // New users start as unverified
        })
        .select('id, email, password_hash, role, full_name, ward, lga, state, is_active, civict_balance, email_verified')
        .single()

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
      dbUser = newUser
    }

    if (!dbUser.is_active) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // 🔒 NEW: Check if they verified their email via our OTP system
    if (!dbUser.email_verified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in.' 
      }, { status: 403 })
    }

    // Update last_seen
    await supabaseServer.from('users').update({ last_seen: new Date().toISOString() }).eq('id', dbUser.id)

    const token = await signToken(dbUser.id, dbUser.role)
    const { password_hash, email_verified, ...safeUser } = dbUser

    const response = NextResponse.json({ token, user: safeUser })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  }

  // ──────────────────────────────────────────────────────────────
  // PATH 2: Custom Auth Fallback (For Old Voters)
  // ──────────────────────────────────────────────────────────────
  const { data: user, error } = await supabaseServer
    .from('users')
    .select('id, email, password_hash, role, full_name, ward, lga, state, is_active, civict_balance, email_verified')
    .eq('email', email)
    .single()

  if (user && user.password_hash !== 'managed_by_supabase_auth') {
    if (!user.is_active) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // 🔒 NEW: Check email verification for legacy users too
    if (!user.email_verified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in.' 
      }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (valid) {
      await supabaseServer.from('users').update({ last_seen: new Date().toISOString() }).eq('id', user.id)

      const token = await signToken(user.id, user.role)
      const { password_hash, email_verified, ...safeUser } = user

      const response = NextResponse.json({ token, user: safeUser })
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return response
    }
  }

  // If both paths fail
  return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
}