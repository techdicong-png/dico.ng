import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'

async function requireAdmin(req: Request) {
  const s = await getSession(req)
  return s && s.role === 'admin' ? s : null
}

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const [rates, totals, leaders] = await Promise.all([
    supabaseAdmin.from('royalty_rates').select('role, amount_naira'),
    supabaseAdmin.from('royalty_role_totals').select('*'),
    supabaseAdmin.from('leaders').select('*, users:user_id(full_name, email)').eq('is_active', true).order('created_at'),
  ])
  return NextResponse.json({ rates: rates.data ?? [], totals: totals.data ?? [], leaders: leaders.data ?? [] })
}

const schema = z.object({
  ref: z.string().trim().min(1).max(100),
  state: z.string().min(2),
  lga: z.string().min(1),
  ward: z.string().min(1),
})

// Record the royalty for one transaction (also the hook the marketplace will call later).
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Reference, state, LGA and ward are required' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('record_royalty', {
    p_ref: parsed.data.ref, p_state: parsed.data.state, p_lga: parsed.data.lga, p_ward: parsed.data.ward,
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, entries: data })
}
