// src/app/api/auth/me/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken, getAuthUser } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const user = await getAuthUser(payload.userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 })

  return NextResponse.json({ user })
}
