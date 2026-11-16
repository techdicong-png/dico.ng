import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'

const schema = z.object({ action: z.enum(['confirm', 'preparing', 'dispatched', 'delivered', 'reject']) })

// confirm = the contractor's payment reached the merchant; preparing / dispatched / delivered = delivery steps; reject = no payment found.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await getSession(req)
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { data, error } = parsed.data.action === 'confirm'
    ? await supabaseAdmin.rpc('confirm_contract_order', { p_order_id: id, p_admin: s.userId })
    : parsed.data.action === 'reject'
      ? await supabaseAdmin.rpc('reject_contract_order', { p_order_id: id })
      : await supabaseAdmin.rpc('set_delivery_status', { p_order_id: id, p_status: parsed.data.action })
  if (error) return NextResponse.json({ error: rpcError(error.message) === 'Request failed' ? error.message : rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, status: data.status })
}
