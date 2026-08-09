import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: candidateId } = await params
    
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // 1. Check if already following
    const { data: existing } = await supabaseServer
      .from('candidate_follows')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('candidate_id', candidateId)
      .maybeSingle()

    // 2. Get current follower count
    const { data: candidate } = await supabaseServer
      .from('candidates')
      .select('follower_count')
      .eq('id', candidateId)
      .single()

    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    
    let newCount = candidate.follower_count || 0
    let isFollowing = false

    if (existing) {
      // UNFOLLOW
      await supabaseServer.from('candidate_follows').delete().eq('id', existing.id)
      newCount = Math.max(0, newCount - 1)
      isFollowing = false
    } else {
      // FOLLOW
      await supabaseServer.from('candidate_follows').insert({
        user_id: payload.userId,
        candidate_id: candidateId
      })
      newCount = newCount + 1
      isFollowing = true
    }

    // 3. Update candidate's follower count
    await supabaseServer.from('candidates').update({ follower_count: newCount }).eq('id', candidateId)

    return NextResponse.json({ success: true, isFollowing, followerCount: newCount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}