// src/app/api/polls/[id]/vote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

const voteSchema = z.object({ option_id: z.string().uuid() })

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const body = await request.json()
  const parsed = voteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid option' }, { status: 400 })

  const pollId = (await params).id

  // Check poll exists and is open
  const { data: poll } = await supabaseAdmin
    .from('polls').select('id, closes_at, is_active').eq('id', pollId).single()
  if (!poll || !poll.is_active) return NextResponse.json({ error: 'Poll is not active' }, { status: 400 })
  if (new Date(poll.closes_at) < new Date()) return NextResponse.json({ error: 'Poll has closed' }, { status: 400 })

  // Check if already voted
  const { data: existing } = await supabaseAdmin
    .from('poll_votes').select('id').eq('poll_id', pollId).eq('user_id', payload.userId).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Already voted' }, { status: 409 })

  // Record vote
  await supabaseAdmin.from('poll_votes').insert({
    poll_id: pollId, option_id: parsed.data.option_id, user_id: payload.userId,
  })
  await supabaseAdmin.rpc('increment_vote', { opt_id: parsed.data.option_id, p_id: pollId })

  // Award CIVICT
  await supabaseAdmin.from('civict_transactions').insert({
    user_id: payload.userId, type: 'poll_vote', amount: 10,
    description: 'Voted in a civic poll',
  })
  await supabaseAdmin.rpc('add_civict', { uid: payload.userId, amount: 10 })

  return NextResponse.json({ message: 'Vote recorded', civict_earned: 10 })
}
