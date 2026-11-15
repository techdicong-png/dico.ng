import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rpcError } from '@/lib/voucher-auth'
import { housingGate } from '@/lib/housing'

const schema = z.object({ code: z.string().min(3).max(40), merchantId: z.string().uuid() })

// The cart: materials + logistics + delivery, the contract value, expected gross profit and the due date.
export async function POST(req: Request) {
  const blocked = await housingGate(req); if (blocked) return blocked
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a contract code and choose a merchant' }, { status: 400 })
  const { data, error } = await supabaseAdmin.rpc('housing_quote', { p_code: parsed.data.code, p_merchant: parsed.data.merchantId })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ quote: data })
}
