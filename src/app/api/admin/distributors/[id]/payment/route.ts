import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'

const schema = z.object({
  kind: z.enum(['voucher_credit', 'vgi_fee']),
  amount: z.number().int().positive().max(100_000_000),
  note: z.string().max(200).optional(),
})

// Admin records a payment already confirmed in DICO's bank account.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid amount in naira' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('record_payment', {
    p_distributor_id: id, p_admin_id: session.userId,
    p_kind: parsed.data.kind, p_amount: parsed.data.amount, p_note: parsed.data.note ?? null,
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, balance_naira: data })
}
