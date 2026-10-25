import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, getMyDistributor } from '@/lib/voucher-auth'

// The signed-in distributor's downline and recent stock movements (counts only, never voucher codes).
//   Sole Distributor: every LGA and ward distributor in the state
//   LGA distributor:  their ward distributors
//   Ward distributor: nobody below
export async function GET(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = await getMyDistributor(session.userId)
  if (!me) return NextResponse.json({ error: 'Not a distributor' }, { status: 403 })

  const person = (u: any) => { const x = Array.isArray(u) ? u[0] : u; return { name: x?.full_name ?? 'Unknown', phone: x?.phone ?? null } }

  let parent: { name: string; phone: string | null } | null = null
  if (me.parent_id) {
    const { data: p } = await supabaseAdmin.from('distributors').select('users:user_id(full_name, phone)').eq('id', me.parent_id).maybeSingle()
    if (p) parent = person(p.users)
  }

  const cols = 'id, level, parent_id, state, lga, ward, is_active, users:user_id(full_name, phone)'
  let rows: any[] = []
  if (me.level === 'sole') {
    const { data } = await supabaseAdmin.from('distributors').select(cols).eq('state', me.state).in('level', ['major', 'area'])
    rows = data ?? []
  } else if (me.level === 'major') {
    const { data } = await supabaseAdmin.from('distributors').select(cols).eq('parent_id', me.id)
    rows = data ?? []
  }

  const stock: Record<string, { unused: number; redeemed: number; unused_value: number }> = {}
  if (rows.length) {
    const { data: s } = await supabaseAdmin.rpc('voucher_stock_summary', { p_ids: rows.map(r => r.id) })
    for (const x of s ?? []) stock[x.holder_id] = { unused: x.unused, redeemed: x.redeemed, unused_value: x.unused_value }
  }

  const children = rows.map(r => ({
    id: r.id, level: r.level, parent_id: r.parent_id, direct: r.parent_id === me.id, state: r.state, lga: r.lga, ward: r.ward,
    is_active: r.is_active, ...person(r.users), stock: stock[r.id] ?? { unused: 0, redeemed: 0, unused_value: 0 },
  })).sort((a, b) => (a.lga ?? '').localeCompare(b.lga ?? '') || (a.level === 'major' ? -1 : 1) - (b.level === 'major' ? -1 : 1) || (a.ward ?? '').localeCompare(b.ward ?? ''))

  const { data: t } = await supabaseAdmin
    .from('voucher_transfers').select('id, from_id, to_id, kind, denomination, qty, created_at')
    .or(`from_id.eq.${me.id},to_id.eq.${me.id}`).order('created_at', { ascending: false }).limit(20)
  const ids = [...new Set((t ?? []).flatMap(x => [x.from_id, x.to_id]))]
  const names: Record<string, string> = {}
  if (ids.length) {
    const { data: d } = await supabaseAdmin.from('distributors').select('id, users:user_id(full_name)').in('id', ids)
    for (const x of d ?? []) names[x.id] = person(x.users).name
  }
  const transfers = (t ?? []).map(x => ({
    id: x.id, kind: x.kind, denomination: x.denomination, qty: x.qty, created_at: x.created_at,
    from_name: names[x.from_id] ?? '', to_name: names[x.to_id] ?? '', direction: x.from_id === me.id ? 'out' : 'in',
  }))

  return NextResponse.json({ level: me.level, parent, children, transfers })
}
