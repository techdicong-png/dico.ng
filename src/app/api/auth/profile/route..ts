// src/app/api/auth/profile/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const body = await request.json()
  const allowed = ['full_name', 'phone', 'ward', 'lga', 'state', 'bio']
  const updates: Record<string, string> = {}
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k] })

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from('users').update(updates).eq('id', payload.userId)
    .select('id, email, role, full_name, ward, lga, state, civict_balance').single()
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({ user: data })
}
