import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rpcError } from '@/lib/voucher-auth'

// Public: a buyer starts an order. A code is reserved for them until the order is paid, cancelled or expires.
const hits = new Map<string, { n: number; reset: number }>()
function throttled(ip: string) {
  const now = Date.now(); const a = hits.get(ip)
  if (!a || a.reset < now) { hits.set(ip, { n: 1, reset: now + 10 * 60_000 }); return false }
  a.n += 1
  return a.n > 6
}

const schema = z.object({
  state: z.string().min(2).max(40),
  denomination: z.number().int().positive(),
  phone: z.string().min(10).max(20),
  name: z.string().trim().max(80).optional(),
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Choose your state and a voucher, and enter your phone number' }, { status: 400 })

  let phone = parsed.data.phone.replace(/\D/g, '')
  if (phone.startsWith('234')) phone = '0' + phone.slice(3)
  if (!/^0\d{10}$/.test(phone)) return NextResponse.json({ error: 'Enter a valid Nigerian phone number' }, { status: 400 })

  const { data: o, error } = await supabaseAdmin.rpc('create_voucher_order', {
    p_state: parsed.data.state, p_denomination: parsed.data.denomination, p_phone: phone, p_name: parsed.data.name ?? null,
  })
  if (error || !o) return NextResponse.json({ error: rpcError(error?.message ?? '') }, { status: 400 })

  const { data: dist } = await supabaseAdmin
    .from('distributors')
    .select('bank_name, account_number, account_name, users:user_id(phone)')
    .eq('id', o.distributor_id).single()
  const u: any = Array.isArray(dist?.users) ? dist?.users[0] : dist?.users

  return NextResponse.json({
    ref: o.ref, token: o.access_token, status: o.status, denomination: o.denomination, amount: o.amount_naira,
    expires_at: o.expires_at,
    pay_to: { bank_name: dist?.bank_name, account_number: dist?.account_number, account_name: dist?.account_name, phone: u?.phone ?? null },
  })
}
