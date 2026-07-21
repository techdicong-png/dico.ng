import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await supabaseAdmin.from('post_comments')
    .select('*, users(full_name, avatar_url)')
    .eq('post_id', id).order('created_at', { ascending: true })
  return NextResponse.json({ comments: data || [] })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { comment } = await request.json()
  if (!comment?.trim()) return NextResponse.json({ error: 'Comment required' }, { status: 400 })

  const { data } = await supabaseAdmin.from('post_comments').insert({
    post_id: id, user_id: payload.userId, comment: comment.trim(),
  }).select('*, users(full_name, avatar_url)').single()

  await supabaseAdmin.rpc('increment_post_comment', { p_id: id })

  return NextResponse.json({ comment: data }, { status: 201 })
}
