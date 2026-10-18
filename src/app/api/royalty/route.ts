import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

// The signed-in user's own royalty earnings.
export async function GET(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: all, error } = await supabaseAdmin
    .from('royalty_entries').select('role, amount_naira').eq('recipient_user_id', session.userId)
  if (error) return NextResponse.json({ error: 'Failed to load royalty' }, { status: 500 })

  const byRole: Record<string, number> = {}
  let total = 0
  for (const e of all ?? []) { byRole[e.role] = (byRole[e.role] ?? 0) + Number(e.amount_naira); total += Number(e.amount_naira) }

  const { data: recent } = await supabaseAdmin
    .from('royalty_entries').select('id, txn_ref, role, amount_naira, state, lga, ward, created_at')
    .eq('recipient_user_id', session.userId).order('created_at', { ascending: false }).limit(50)

  return NextResponse.json({ total, byRole, transactions: (all ?? []).length, recent: recent ?? [] })
}
