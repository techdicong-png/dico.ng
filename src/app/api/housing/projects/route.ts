import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public: the announced housing development projects (no voucher needed to read the announcements).
export async function GET() {
  const { data: projects, error } = await supabaseAdmin
    .from('housing_projects')
    .select('id, name, state, lga, description, status, land_size, design_summary, buildings_count, construction_size, purpose, start_date, completion_date, drawings_url')
    .eq('is_published', true).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
  const { data: contracts } = await supabaseAdmin.from('housing_contracts').select('project_id, category').eq('is_published', true)
  const cats: Record<string, Set<string>> = {}; const count: Record<string, number> = {}
  for (const c of contracts ?? []) {
    if (!c.project_id) continue
    count[c.project_id] = (count[c.project_id] ?? 0) + 1
    if (c.category) (cats[c.project_id] = cats[c.project_id] ?? new Set()).add(c.category)
  }
  return NextResponse.json({ projects: (projects ?? []).map(p => ({ ...p, contracts: count[p.id] ?? 0, categories: [...(cats[p.id] ?? [])] })) })
}
