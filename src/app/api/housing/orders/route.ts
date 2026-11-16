import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rpcError } from '@/lib/voucher-auth'
import { housingGate, housingToken, contractorId } from '@/lib/housing'

const COLS = 'ref, status, delivery_status, materials_cost, logistics_fee, delivery_fee, total_cost, contract_value, expected_profit, completion_days, payment_due_days, due_date, created_at, expires_at, housing_contracts(code, title), merchants(name, phone, bank_name, account_number, account_name)'

const shape = (o: any) => {
  const c = Array.isArray(o.housing_contracts) ? o.housing_contracts[0] : o.housing_contracts
  const m = Array.isArray(o.merchants) ? o.merchants[0] : o.merchants
  const { housing_contracts, merchants, ...rest } = o
  return { ...rest, contract: c ?? null, pay_to: m ?? null }
}

// My orders.
export async function GET(req: Request) {
  const blocked = await housingGate(req); if (blocked) return blocked
  const token = await housingToken()
  const aid = token ? await contractorId(token) : null
  if (!aid) return NextResponse.json({ orders: [] })
  await supabaseAdmin.rpc('release_expired_contract_orders')
  const { data } = await supabaseAdmin.from('contract_orders').select(COLS).eq('access_id', aid).order('created_at', { ascending: false }).limit(50)
  return NextResponse.json({ orders: (data ?? []).map(shape) })
}

const schema = z.object({ code: z.string().min(3).max(40), merchantId: z.string().uuid() })

// Proceed: reserve the contract and record the figures. Payment then goes to the merchant.
export async function POST(req: Request) {
  const blocked = await housingGate(req); if (blocked) return blocked
  const token = await housingToken()
  if (!token) return NextResponse.json({ error: 'Redeem a voucher to place an order.', locked: true }, { status: 402 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a contract code and choose a merchant' }, { status: 400 })

  const { data: o, error } = await supabaseAdmin.rpc('create_contract_order', { p_token: token, p_code: parsed.data.code, p_merchant: parsed.data.merchantId })
  if (error || !o) return NextResponse.json({ error: rpcError(error?.message ?? '') }, { status: 400 })
  const { data: full } = await supabaseAdmin.from('contract_orders').select(COLS).eq('ref', o.ref).single()
  return NextResponse.json({ order: full ? shape(full) : o })
}
