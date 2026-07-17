// src/app/api/notifications/read-all/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  await supabaseAdmin.from('notifications').update({ is_read: true })
    .eq('user_id', payload.userId).eq('is_read', false)

  return NextResponse.json({ message: 'All marked as read' })
}
