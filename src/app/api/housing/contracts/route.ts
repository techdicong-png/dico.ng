import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { housingGate, LIVE } from '@/lib/housing'

// Published contracts, with how many slots are still free.
export async function GET(req: Request) {
  const blocked = await housingGate(req); if (blocked) return blocked
  const { data: contracts, error } = await supabaseAdmin
    .from('housing_contracts')
    .select('id, code, title, design, size, duration_days, contract_value, payment_days_after_completion, slots, housing_projects(name, state, lga)')
    .eq('is_published', true).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to load contracts' }, { status: 500 })

  const { data: live } = await supabaseAdmin.from('contract_orders').select('contract_id').in('status', LIVE)
  const taken: Record<string, number> = {}
  for (const o of live ?? []) taken[o.contract_id] = (taken[o.contract_id] ?? 0) + 1

  return NextResponse.json({
    contracts: (contracts ?? []).map((c: any) => {
      const p = Array.isArray(c.housing_projects) ? c.housing_projects[0] : c.housing_projects
      return { code: c.code, title: c.title, design: c.design, size: c.size, duration_days: c.duration_days, contract_value: c.contract_value,
               payment_days_after_completion: c.payment_days_after_completion, slots_left: Math.max(0, c.slots - (taken[c.id] ?? 0)),
               project: p ? { name: p.name, state: p.state, lga: p.lga } : null }
    }),
  })
}
