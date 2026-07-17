// src/app/api/notifications/broadcast/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, body, link, role } = await request.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  let query = supabaseAdmin.from('users').select('id').eq('is_active', true)
  if (role) query = query.eq('role', role)
  const { data: users } = await query

  if (!users?.length) return NextResponse.json({ message: 'No users to notify' })

  const rows = users.map(u => ({
    user_id: u.id, type: 'system', title, body: body || null,
    link: link || null, is_read: false, created_at: new Date().toISOString(),
  }))

  // Batch insert in chunks
  for (let i = 0; i < rows.length; i += 500) {
    await supabaseAdmin.from('notifications').insert(rows.slice(i, i + 500))
  }

  return NextResponse.json({ message: `Broadcast sent to ${rows.length} users` })
}
