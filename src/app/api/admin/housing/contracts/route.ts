import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'

async function admin(req: Request) { const s = await getSession(req); return s && s.role === 'admin' ? s : null }

export async function GET(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await supabaseAdmin
    .from('housing_contracts')
    .select('id, project_id, code, title, design, size, category, volume, requirements, duration_days, contract_value, payment_days_after_completion, payment_terms, slots, is_published, housing_projects(name, state, lga), contract_materials(quantity, materials(name, unit))')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to load contracts' }, { status: 500 })
  return NextResponse.json({ contracts: data ?? [] })
}

const schema = z.object({
  code: z.string().trim().min(3).max(40),
  title: z.string().trim().min(3).max(150),
  design: z.string().max(200).optional(),
  size: z.string().max(100).optional(),
  category: z.string().max(120).optional(),
  volume: z.string().max(120).optional(),
  requirements: z.string().max(2000).optional(),
  projectId: z.string().uuid().optional().or(z.literal('')),
  projectName: z.string().max(150).optional(),
  state: z.string().max(40).optional(),
  lga: z.string().max(80).optional(),
  durationDays: z.number().int().min(1).max(3650),
  contractValue: z.number().int().min(1).max(100_000_000_000),
  paymentDaysAfterCompletion: z.number().int().min(0).max(3650).optional(),
  paymentTerms: z.string().max(2000).optional(),
  slots: z.number().int().min(1).max(10000).optional(),
  isPublished: z.boolean().optional(),
  materialsText: z.string().max(20000),
})

// One material per line:  name, unit, quantity     e.g.  Cement, bag, 300
function parseMaterials(text: string) {
  const out: { name: string; unit: string; quantity: number }[] = []
  for (const [i, raw] of text.split('\n').entries()) {
    const line = raw.trim(); if (!line) continue
    const [name, unit, qty] = line.split(',').map(x => x.trim())
    const quantity = Number(qty)
    if (!name || !unit || !(quantity > 0)) throw new Error(`Materials, line ${i + 1}: use  name, unit, quantity  (for example: Cement, bag, 300)`)
    out.push({ name, unit, quantity })
  }
  return out
}

export async function POST(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the contract details: ' + parsed.error.issues[0].path.join('.') + ' ' + parsed.error.issues[0].message }, { status: 400 })
  const d = parsed.data
  let materials
  try { materials = parseMaterials(d.materialsText) } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }) }
  if (materials.length === 0) return NextResponse.json({ error: 'List at least one material' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('save_housing_contract', {
    p: {
      code: d.code, title: d.title, design: d.design ?? '', size: d.size ?? '', category: d.category ?? '', volume: d.volume ?? '', requirements: d.requirements ?? '', project_id: d.projectId ?? '', project_name: d.projectName ?? '', state: d.state ?? '', lga: d.lga ?? '',
      duration_days: d.durationDays, contract_value: d.contractValue, payment_days_after_completion: d.paymentDaysAfterCompletion,
      payment_terms: d.paymentTerms ?? '', slots: d.slots, is_published: d.isPublished, materials,
    },
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) === 'Request failed' ? error.message : rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, id: data })
}
