import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get('candidate_id')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  let query = supabaseAdmin.from('posts')
    .select('*, candidates(full_name, party, office, state, avatar_url), post_likes(count), post_comments(count)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (candidateId) query = query.eq('candidate_id', candidateId)

  const { data } = await query

  // Check if current user liked each post
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  let userLikes: string[] = []
  if (token) {
    const payload = await verifyToken(token)
    if (payload && data) {
      const postIds = data.map(p => p.id)
      const { data: likes } = await supabaseAdmin.from('post_likes')
        .select('post_id').eq('user_id', payload.userId).in('post_id', postIds)
      userLikes = (likes || []).map(l => l.post_id)
    }
  }

  const posts = (data || []).map(p => ({
    ...p,
    liked_by_me: userLikes.includes(p.id),
  }))

  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { candidate_id, title, content, image_url } = await request.json()
  if (!candidate_id || !title || !content) return NextResponse.json({ error: 'All fields required' }, { status: 400 })

  // Verify user owns this candidate
  const { data: cand } = await supabaseAdmin.from('candidates')
    .select('id').eq('id', candidate_id).eq('user_id', payload.userId).single()
  if (!cand) return NextResponse.json({ error: 'Not your candidate profile' }, { status: 403 })

  const { data, error } = await supabaseAdmin.from('posts').insert({
    candidate_id, title, content, image_url: image_url || null,
  }).select('*, candidates(full_name, party, office, avatar_url)').single()

  if (error) return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  return NextResponse.json({ post: data }, { status: 201 })
}
