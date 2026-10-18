import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, getMyDistributor, rpcError } from '@/lib/voucher-auth'

// GET: the signed-in distributor's vouchers + balance summary
export async function GET(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dist = await getMyDistributor(session.userId)
  if (!dist) return NextResponse.json({ error: 'Not a distributor' }, { status: 403 })

  const { data: vouchers, error } = await supabaseAdmin
    .from('vouchers')
    .select('id, code, denomination, status, created_at, redeemed_at')
    .eq('holder_id', dist.id)
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return NextResponse.json({ error: 'Failed to load vouchers' }, { status: 500 })

  const { data: issued } = await supabaseAdmin
    .from('vouchers').select('denomination').eq('issuer_id', dist.id).neq('status', 'void')
  const used = (issued ?? []).reduce((s, v) => s + v.denomination, 0)

  const { data: priceRows } = await supabaseAdmin
    .from('voucher_pricing').select('denomination, distributor_price').eq('is_active', true).order('denomination')

  const { data: dicoAccount } = await supabaseAdmin
    .from('dico_bank_account').select('bank_name, account_number, account_name').maybeSingle()

  return NextResponse.json({
    dico_account: dicoAccount ?? null,
    prices: priceRows ?? [],
    distributor: {
      level: dist.level, state: dist.state, vgi_active: dist.vgi_active,
      voucher_credit: dist.voucher_credit, voucher_used: used,
      voucher_remaining: dist.voucher_credit - used, sms_units: dist.sms_units,
      balance_naira: dist.balance_naira ?? 0,
    },
    vouchers,
  })
}

const createSchema = z.object({
  denomination: z.number().int().positive(),
  quantity: z.number().int().min(1).max(500),
})

// POST: generate vouchers (cap enforced inside Postgres)
export async function POST(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dist = await getMyDistributor(session.userId)
  if (!dist) return NextResponse.json({ error: 'Not a distributor' }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid denomination or quantity' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('create_vouchers', {
    p_distributor_id: dist.id,
    p_denomination: parsed.data.denomination,
    p_qty: parsed.data.quantity,
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, vouchers: data })
}
