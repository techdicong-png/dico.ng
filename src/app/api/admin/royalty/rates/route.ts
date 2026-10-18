import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

const amount = z.number().min(0).max(100000)
const schema = z.object({ ward: amount, lga: amount, state: amount, zonal: amount, national: amount })

// Changes apply to FUTURE transactions only; entries already recorded keep the amount they had.
export async function POST(req: Request) {
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid naira amount for each level' }, { status: 400 })

  const rows = Object.entries(parsed.data).map(([role, amount_naira]) => ({ role, amount_naira }))
  const { error } = await supabaseAdmin.from('royalty_rates').upsert(rows)
  if (error) return NextResponse.json({ error: 'Failed to save rates' }, { status: 500 })
  return NextResponse.json({ success: true })
}
