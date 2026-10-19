import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, getMyDistributor } from '@/lib/voucher-auth'

// The signed-in Sole Distributor's orders: open ones (to confirm) plus the latest paid.
export async function GET(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dist = await getMyDistributor(session.userId)
  if (!dist) return NextResponse.json({ error: 'Not a distributor' }, { status: 403 })

  await supabaseAdmin.rpc('release_expired_orders')
  const cols = 'id, ref, denomination, amount_naira, buyer_phone, buyer_name, status, created_at, expires_at, paid_claimed_at, confirmed_at'
  const week = new Date(Date.now() - 7 * 86400_000).toISOString()
  const [open, paid] = await Promise.all([
    supabaseAdmin.from('voucher_orders').select(cols).eq('distributor_id', dist.id)
      .in('status', ['awaiting_confirmation', 'pending', 'expired']).gte('created_at', week)
      .order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('voucher_orders').select(cols).eq('distributor_id', dist.id).eq('status', 'paid')
      .order('confirmed_at', { ascending: false }).limit(15),
  ])
  if (open.error || paid.error) return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  return NextResponse.json({ open: open.data ?? [], paid: paid.data ?? [] })
}
