import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'

async function admin(req: Request) { const s = await getSession(req); return s && s.role === 'admin' ? s : null }

export async function GET(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await supabaseAdmin
    .from('merchants')
    .select('id, name, state, phone, bank_name, account_number, account_name, logistics_fee, delivery_percent, is_active, merchant_prices(unit_price, materials(name))')
    .order('name')
  if (error) return NextResponse.json({ error: 'Failed to load merchants' }, { status: 500 })
  return NextResponse.json({ merchants: data ?? [] })
}

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  state: z.string().min(2).max(40),
  phone: z.string().max(30).optional(),
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits').optional().or(z.literal('')),
  accountName: z.string().max(120).optional(),
  logisticsFee: z.number().int().min(0).max(1_000_000_000),
  deliveryPercent: z.number().min(0).max(100),
  isActive: z.boolean().optional(),
  pricesText: z.string().max(20000),
})

// One price per line:  material, unit price     e.g.  Cement, 9000
function parsePrices(text: string) {
  const out: { name: string; unit_price: number }[] = []
  for (const [i, raw] of text.split('\n').entries()) {
    const line = raw.trim(); if (!line) continue
    const idx = line.lastIndexOf(',')
    const name = line.slice(0, idx).trim(); const price = Number(line.slice(idx + 1).replace(/[^\d.]/g, ''))
    if (idx < 1 || !name || !(price > 0)) throw new Error(`Prices, line ${i + 1}: use  material, price  (for example: Cement, 9000)`)
    out.push({ name, unit_price: Math.round(price) })
  }
  return out
}

export async function POST(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message || 'Check the merchant details' }, { status: 400 })
  const d = parsed.data
  let prices
  try { prices = parsePrices(d.pricesText) } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }) }

  const { data, error } = await supabaseAdmin.rpc('save_merchant', {
    p: {
      id: d.id ?? '', name: d.name, state: d.state, phone: d.phone ?? '', bank_name: d.bankName ?? '', account_number: d.accountNumber ?? '',
      account_name: d.accountName ?? '', logistics_fee: d.logisticsFee, delivery_percent: d.deliveryPercent, is_active: d.isActive ?? true,
      replace_prices: true, prices,
    },
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) === 'Request failed' ? error.message : rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, id: data })
}
