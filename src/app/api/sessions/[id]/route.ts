// src/app/api/sessions/[id]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const [session, questions, policies] = await Promise.all([
    supabaseAdmin.from('live_sessions')
      .select('*, candidates(id, full_name, party, office, state, avatar_url, bio)')
      .eq('id', (await params).id).single(),
    supabaseAdmin.from('questions')
      .select('id, question_text, upvote_count, civict_value, users(full_name, ward)')
      .eq('session_id', (await params).id).order('upvote_count', { ascending: false }).limit(20),
    supabaseAdmin.from('policy_auction_totals')
      .select('policy, total_civict').eq('session_id', (await params).id)
      .order('total_civict', { ascending: false }),
  ])

  if (session.error || !session.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    session: session.data,
    questions: questions.data || [],
    policy_auction: policies.data || [],
  })
}
