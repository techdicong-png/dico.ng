import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { housingGate } from '@/lib/housing'

// One contract with its bill of materials, and the merchants a contractor can buy through.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const blocked = await housingGate(req); if (blocked) return blocked
  const { code } = await params
  const { data: c } = await supabaseAdmin
    .from('housing_contracts')
    .select('code, title, design, size, category, volume, requirements, duration_days, contract_value, payment_days_after_completion, payment_terms, slots, housing_projects(name, state, lga, description), contract_materials(quantity, materials(name, unit))')
    .eq('code', code.toUpperCase().trim()).eq('is_published', true).maybeSingle()
  if (!c) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })

  const { data: merchants } = await supabaseAdmin
    .from('merchants').select('id, name, state, logistics_fee, delivery_percent').eq('is_active', true).order('name')
  const p: any = Array.isArray((c as any).housing_projects) ? (c as any).housing_projects[0] : (c as any).housing_projects
  const mats = ((c as any).contract_materials ?? []).map((m: any) => {
    const x = Array.isArray(m.materials) ? m.materials[0] : m.materials
    return { name: x?.name, unit: x?.unit, quantity: Number(m.quantity) }
  }).sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))

  return NextResponse.json({
    contract: { code: c.code, title: c.title, design: c.design, size: c.size, category: c.category, volume: c.volume, requirements: c.requirements, duration_days: c.duration_days, contract_value: c.contract_value,
                payment_days_after_completion: c.payment_days_after_completion, payment_terms: c.payment_terms, project: p ?? null },
    materials: mats, merchants: merchants ?? [],
  })
}
