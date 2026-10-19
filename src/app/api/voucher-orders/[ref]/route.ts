import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rpcError } from '@/lib/voucher-auth'

async function view(ref: string, token: string) {
  await supabaseAdmin.rpc('release_expired_orders')
  const { data: o } = await supabaseAdmin.from('voucher_orders').select('*').eq('ref', ref).eq('access_token', token).maybeSingle()
  if (!o) return null

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('bank_name, account_number, account_name, users:user_id(phone)')
    .eq('id', o.distributor_id).single()
  const u: any = Array.isArray(dist?.users) ? dist?.users[0] : dist?.users

  // the code is only ever revealed once the distributor has confirmed payment
  let code: string | null = null
  if (o.status === 'paid' && o.voucher_id) {
    const { data: v } = await supabaseAdmin.from('vouchers').select('code').eq('id', o.voucher_id).maybeSingle()
    code = v?.code ?? null
  }
  return {
    ref: o.ref, status: o.status, denomination: o.denomination, amount: o.amount_naira, expires_at: o.expires_at, code,
    pay_to: { bank_name: dist?.bank_name, account_number: dist?.account_number, account_name: dist?.account_name, phone: u?.phone ?? null },
  }
}

// GET /api/voucher-orders/ORD-XXXX?t=<token>
export async function GET(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const token = new URL(req.url).searchParams.get('t') || ''
  const data = token ? await view(ref, token) : null
  if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(data)
}

const schema = z.object({ token: z.string().min(8).max(64), action: z.enum(['claim', 'cancel']) })

// POST { token, action: 'claim' (I have paid) | 'cancel' }
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { error } = await supabaseAdmin.rpc(parsed.data.action === 'claim' ? 'claim_voucher_order' : 'cancel_voucher_order',
    { p_ref: ref, p_token: parsed.data.token })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  const data = await view(ref, parsed.data.token)
  return NextResponse.json(data ?? { status: 'unknown' })
}
