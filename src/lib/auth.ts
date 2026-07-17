import { SignJWT, jwtVerify } from 'jose'
import { supabaseAdmin } from './supabase'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signToken(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; role: string }
  } catch {
    return null
  }
}

export async function getAuthUser(userId: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, email, role, full_name, is_active, ward, lga, state')
    .eq('id', userId)
    .single()
  return data
}
