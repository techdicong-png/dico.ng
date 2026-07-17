// src/app/api/questions/ask/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { candidate_id, question_text, session_id } = await request.json()
  if (!candidate_id || !question_text || question_text.length < 10) {
    return NextResponse.json({ error: 'Question too short' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.from('questions').insert({
    user_id: payload.userId, candidate_id, question_text,
    session_id: session_id || null, upvote_count: 0, civict_value: 20, status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })

  // Award CIVICT
  await supabaseAdmin.from('civict_transactions').insert({
    user_id: payload.userId, type: 'question_asked', amount: 20,
    description: 'Asked a verified voter question',
  })
  await supabaseAdmin.rpc('add_civict', { uid: payload.userId, amount: 20 })

  return NextResponse.json({ question: data, civict_earned: 20 }, { status: 201 })
}
