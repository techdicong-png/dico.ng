import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, getMyDistributor, rpcError } from '@/lib/voucher-auth'

const schema = z.object({ action: z.enum(['confirm', 'reject']) })

// The Sole Distributor confirms the money reached their bank (the buyer then sees the code), or rejects the order.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dist = await getMyDistributor(session.userId)
  if (!dist) return NextResponse.json({ error: 'Not a distributor' }, { status: 403 })
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { data, error } = parsed.data.action === 'confirm'
    ? await supabaseAdmin.rpc('confirm_voucher_order', { p_order_id: id, p_distributor_id: dist.id, p_user_id: session.userId })
    : await supabaseAdmin.rpc('reject_voucher_order', { p_order_id: id, p_distributor_id: dist.id })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, status: data.status })
}
