import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// GET user's notifications
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '30')
  const unreadOnly = searchParams.get('unread_only') === 'true'
  const from = (page - 1) * limit

  let query = supabaseServer.from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', payload.userId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (unreadOnly) query = query.eq('is_read', false)

  const { data, error, count } = await query
  const { count: unreadCount } = await supabaseServer
    .from('notifications').select('id', { count: 'exact', head: true })
    .eq('user_id', payload.userId).eq('is_read', false)

  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })

  return NextResponse.json({ notifications: data || [], total: count, unread: unreadCount || 0 })
}

// PATCH to mark all as read
export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { error } = await supabaseServer
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', payload.userId)
    .eq('is_read', false)

  if (error) return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })

  return NextResponse.json({ success: true })
}