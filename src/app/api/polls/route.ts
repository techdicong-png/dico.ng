// src/app/api/polls/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope')
  const active = searchParams.get('active')
  const limit = parseInt(searchParams.get('limit') ?? '30')

  let query = supabaseAdmin.from('polls')
    .select('*, candidates(full_name, party), poll_options(id, option_text, vote_count)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (scope) query = query.eq('scope', scope)
  if (active === 'true') query = query.eq('is_active', true).gte('closes_at', new Date().toISOString())

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  // Attach user's vote if logged in
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const userVotes: Record<string, string> = {}

  if (token) {
    const payload = await verifyToken(token)
    if (payload && data) {
      const pollIds = data.map(p => p.id)
      const { data: votes } = await supabaseAdmin
        .from('poll_votes').select('poll_id, option_id')
        .eq('user_id', payload.userId).in('poll_id', pollIds)
      ;(votes || []).forEach(v => { userVotes[v.poll_id] = v.option_id })
    }
  }

  const polls = (data || []).map(p => ({ ...p, user_vote: userVotes[p.id] || null }))
  return NextResponse.json({ polls })
}
