import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'
import { getSupervisionScope, pickState } from '@/lib/supervision'

const PAGE = 30

// Recent activity of everyone in the viewer's scope. Buyer phones and voucher codes are masked.
export async function GET(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const scope = await getSupervisionScope(session.userId, session.role)
  if (!scope) return NextResponse.json({ error: 'You do not have a supervision role' }, { status: 403 })

  const sp = new URL(req.url).searchParams
  const before = sp.get('before')
  const beforeDate = before && !isNaN(Date.parse(before)) ? new Date(before).toISOString() : new Date(Date.now() + 60_000).toISOString()

  const { data, error } = await supabaseAdmin.rpc('supervision_feed', {
    p_states: scope.states, p_ids: scope.ids, p_state: pickState(scope, sp.get('state')), p_limit: PAGE + 1, p_before: beforeDate,
  })
  if (error) return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 })
  const list = data ?? []
  return NextResponse.json({ events: list.slice(0, PAGE), hasMore: list.length > PAGE })
}
