import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { signToken } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect(new URL('/login?error=no_code', request.url))

  // Exchange code for session
  const { data: { user: supabaseUser } } = await supabaseAdmin.auth.exchangeCodeForSession(code)

  if (!supabaseUser?.email) return NextResponse.redirect(new URL('/login?error=no_user', request.url))

  // Find or create user in our users table
  const { data: existing } = await supabaseAdmin.from('users')
    .select('id, role').eq('email', supabaseUser.email).maybeSingle()

  let userId = existing?.id
  if (!existing) {
    const { data: newUser } = await supabaseAdmin.from('users').insert({
      email: supabaseUser.email,
      full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
      role: 'voter',
      is_active: true,
      civict_balance: 100,
    }).select('id, role').single()
    userId = newUser?.id
  }

  const token = await signToken(userId, existing?.role || 'voter')
  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.set('token', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800 })
  return response
}
