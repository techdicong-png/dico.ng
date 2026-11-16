import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 300

const fmt = (s: string | null) => (s ? new Date(s + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null)

export default async function HousingProjectsPage() {
  const { data: projects } = await supabaseAdmin
    .from('housing_projects')
    .select('id, name, state, lga, description, status, land_size, design_summary, buildings_count, construction_size, purpose, start_date, completion_date, drawings_url')
    .eq('is_published', true).order('created_at', { ascending: false })
  const { data: contracts } = await supabaseAdmin.from('housing_contracts').select('project_id, category').eq('is_published', true)
  const cats: Record<string, Set<string>> = {}; const count: Record<string, number> = {}
  for (const c of contracts ?? []) {
    if (!c.project_id) continue
    count[c.project_id] = (count[c.project_id] ?? 0) + 1
    if (c.category) (cats[c.project_id] = cats[c.project_id] ?? new Set()).add(c.category)
  }

  return (
    <div className="min-h-screen bg-sand pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4"><Building2 className="h-6 w-6 text-gold" /></div>
          <h1 className="font-serif text-3xl md:text-4xl font-black text-ink mb-2">DICO Housing Projects</h1>
          <p className="text-muted text-sm max-w-lg mx-auto">Development projects on land DICO has announced. Contractors take part through housing contracts of different categories and sizes.</p>
        </div>

        {(projects ?? []).length === 0 && <p className="text-center text-sm text-muted py-10">No projects have been announced yet. Please check back soon.</p>}
        <div className="space-y-5">
          {(projects ?? []).map(p => (
            <section key={p.id} className="bg-white border border-mint-line rounded-xl p-6 space-y-3">
              <div>
                <p className="text-xs text-muted">{[p.lga, p.state].filter(Boolean).join(', ')} · {p.status}</p>
                <h2 className="font-serif text-xl font-black text-ink">{p.name}</h2>
              </div>
              {p.description && <p className="text-sm text-muted">{p.description}</p>}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[['Land', p.land_size], ['Design', p.design_summary], ['Buildings', p.buildings_count], ['Size of each', p.construction_size], ['Purpose', p.purpose],
                  ['Starts', fmt(p.start_date)], ['Expected completion', fmt(p.completion_date)]]
                  .filter(([, v]) => v !== null && v !== '' && v !== undefined).map(([k, v]) => (
                  <div key={String(k)}><dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt><dd className="text-ink">{String(v)}</dd></div>
                ))}
              </dl>
              {(cats[p.id]?.size ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Contract categories open ({count[p.id]} contracts)</p>
                  <div className="flex flex-wrap gap-1.5">{[...cats[p.id]].map(c => <span key={c} className="text-xs rounded-full bg-mint px-2.5 py-1 text-ink">{c}</span>)}</div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                {p.drawings_url && <a href={p.drawings_url} target="_blank" rel="noopener noreferrer" className="text-sm underline text-ink">View plans and drawings</a>}
                <Link href="/housing" className="text-sm font-semibold text-forest underline">See the contracts</Link>
              </div>
            </section>
          ))}
        </div>

        <p className="text-[11px] text-muted text-center mt-8">Becoming a DICO Contractor with a voucher gives access to the contract list. It does not confer professional qualifications or guarantee the award of a contract.</p>
      </div>
    </div>
  )
}
