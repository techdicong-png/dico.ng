import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { data: existing } = await supabaseAdmin.from('post_likes')
    .select('id').eq('post_id', id).eq('user_id', payload.userId).maybeSingle()

  if (existing) {
    await supabaseAdmin.from('post_likes').delete().eq('id', existing.id)
    await supabaseAdmin.rpc('decrement_post_like', { p_id: id })
    return NextResponse.json({ liked: false })
  }

  await supabaseAdmin.from('post_likes').insert({ post_id: id, user_id: payload.userId })
  await supabaseAdmin.rpc('increment_post_like', { p_id: id })
  return NextResponse.json({ liked: true })
}
