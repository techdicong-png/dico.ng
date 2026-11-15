import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rpcError } from '@/lib/voucher-auth'
import { housingGate, housingToken } from '@/lib/housing'

const schema = z.object({ action: z.enum(['claim', 'cancel']) })

// The contractor tells us they have paid ("claim") or cancels before paying.
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const blocked = await housingGate(req); if (blocked) return blocked
  const token = await housingToken()
  if (!token) return NextResponse.json({ error: 'Redeem a voucher first.', locked: true }, { status: 402 })
  const { ref } = await params
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { data, error } = await supabaseAdmin.rpc(parsed.data.action === 'claim' ? 'claim_contract_order' : 'cancel_contract_order', { p_token: token, p_ref: ref })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, status: data.status })
}
