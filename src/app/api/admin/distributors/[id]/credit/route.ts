import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'

const schema = z.object({ amount: z.number().int().positive() })

// Subsequent funding, on the Sole Distributor's request.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Amount must be a positive whole number' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('add_voucher_credit', { p_distributor_id: id, p_amount: parsed.data.amount })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, voucher_credit: data })
}
