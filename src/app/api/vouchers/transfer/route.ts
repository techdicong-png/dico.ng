import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, getMyDistributor, rpcError } from '@/lib/voucher-auth'

const schema = z.object({
  toDistributorId: z.string().uuid(),
  denomination: z.number().int().positive(),
  quantity: z.number().int().min(1).max(500),
})

// Send unused vouchers to one of your own direct distributors (stock only, no money moves).
export async function POST(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = await getMyDistributor(session.userId)
  if (!me) return NextResponse.json({ error: 'Not a distributor' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Choose who to send to, a voucher value and a quantity' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('transfer_vouchers', {
    p_from: me.id, p_to: parsed.data.toDistributorId, p_denomination: parsed.data.denomination,
    p_qty: parsed.data.quantity, p_user: session.userId,
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, moved: data })
}
