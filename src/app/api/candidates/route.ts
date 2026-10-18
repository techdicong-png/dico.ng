// src/app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { getSession } from '@/lib/voucher-auth'
import { getVoterScope, getVisibleCandidateIds } from '@/lib/candidate-visibility'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const party = searchParams.get('party')
  const office = searchParams.get('office')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const from = (page - 1) * limit

  let query = supabaseAdmin.from('candidates')
    .select('*, users!inner(email)', { count: 'exact' })
    .eq('is_active', true)
    .range(from, from + limit - 1)
    .order('reputation_score', { ascending: false })

  if (searchParams.get('scope') !== 'all') {
    // signed-in voters only see candidates for their own area
    const session = await getSession(request)
    if (session) {
      const { restrict, voter } = await getVoterScope(session.userId)
      if (restrict) {
        const ids = await getVisibleCandidateIds(voter)
        if (ids.length === 0) return NextResponse.json({ candidates: [], total: 0, page, limit })
        query = query.in('id', ids)
      }
    }
  }

  if (state) query = query.eq('state', state)
  if (party) query = query.eq('party', party)
  if (office) query = query.ilike('office', `%${office}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  return NextResponse.json({ candidates: data ?? [], total: count, page, limit })
}
