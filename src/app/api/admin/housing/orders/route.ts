import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

export async function GET(req: Request) {
  const s = await getSession(req)
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await supabaseAdmin.rpc('release_expired_contract_orders')
  const { data, error } = await supabaseAdmin
    .from('contract_orders')
    .select('id, ref, status, materials_cost, logistics_fee, delivery_fee, total_cost, contract_value, expected_profit, due_date, created_at, paid_claimed_at, confirmed_at, supplied_at, service_access:access_id(phone), housing_contracts(code, title), merchants(name, phone)')
    .order('created_at', { ascending: false }).limit(200)
  if (error) return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  const one = (x: any) => (Array.isArray(x) ? x[0] : x)
  return NextResponse.json({
    orders: (data ?? []).map((o: any) => ({ ...o, contractor_phone: one(o.service_access)?.phone ?? null, contract: one(o.housing_contracts) ?? null, merchant: one(o.merchants) ?? null })),
  })
}
