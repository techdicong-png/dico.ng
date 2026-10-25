import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'
import { getSupervisionScope, pickState } from '@/lib/supervision'

const PAGE = 50

export async function GET(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const scope = await getSupervisionScope(session.userId, session.role)
  if (!scope) return NextResponse.json({ error: 'You do not have a supervision role' }, { status: 403 })

  const sp = new URL(req.url).searchParams
  const state = pickState(scope, sp.get('state'))
  const level = ['sole', 'major', 'area'].includes(sp.get('level') || '') ? sp.get('level') : null
  const offset = Math.max(0, parseInt(sp.get('offset') || '0', 10) || 0)
  const base = { p_states: scope.states, p_ids: scope.ids }

  const [totals, rows] = await Promise.all([
    supabaseAdmin.rpc('supervision_totals', { ...base }),
    supabaseAdmin.rpc('supervision_distributors', { ...base, p_state: state, p_level: level, p_limit: PAGE + 1, p_offset: offset }),
  ])
  if (totals.error || rows.error) return NextResponse.json({ error: 'Failed to load supervision data' }, { status: 500 })

  // which states the viewer can narrow to
  let states: string[] = scope.states ?? []
  if (scope.kind === 'all') {
    const { data } = await supabaseAdmin.from('distributors').select('state')
    states = [...new Set((data ?? []).map(d => d.state))].sort()
  }

  const list = rows.data ?? []
  return NextResponse.json({
    scope: { kind: scope.kind, label: scope.label },
    states: scope.kind === 'ward' || scope.kind === 'lga' ? [] : states,
    totals: totals.data?.[0] ?? null,
    distributors: list.slice(0, PAGE),
    hasMore: list.length > PAGE,
  })
}
