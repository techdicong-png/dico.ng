'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { NIGERIA_DATA } from '@/data/nigeria'

const field = 'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'
const area = `${field} h-28 py-2 font-mono`
const box = 'dark:bg-[#11241b] dark:border-[#1f3a2c]'
const naira = (n: number) => (n < 0 ? '-₦' : '₦') + Math.abs(n).toLocaleString()
const one = (x: any) => (Array.isArray(x) ? x[0] : x)

const EMPTY_P = { name: '', state: '', lga: '', description: '', status: 'planned', landSize: '', designSummary: '', buildingsCount: '', constructionSize: '', purpose: '', startDate: '', completionDate: '', drawingsUrl: '', isPublished: false }
const EMPTY_C = { code: '', title: '', design: '', size: '', category: '', volume: '', requirements: '', projectId: '', projectName: '', state: '', lga: '', durationDays: '', contractValue: '', paymentDays: '30', slots: '1', paymentTerms: '', isPublished: false, materialsText: '' }
const EMPTY_M = { id: '', name: '', state: '', phone: '', bankName: '', accountNumber: '', accountName: '', logisticsFee: '0', deliveryPercent: '0', isActive: true, pricesText: '' }

export function HousingAdmin() {
  const [tab, setTab] = useState<'orders' | 'projects' | 'contracts' | 'merchants'>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [p, setP] = useState({ ...EMPTY_P })
  const [c, setC] = useState({ ...EMPTY_C })
  const [m, setM] = useState({ ...EMPTY_M })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [o, k, mm, pj] = await Promise.all([fetch('/api/admin/housing/orders'), fetch('/api/admin/housing/contracts'), fetch('/api/admin/housing/merchants'), fetch('/api/admin/housing/projects')])
    if (pj.ok) setProjects((await pj.json()).projects)
    if (o.ok) setOrders((await o.json()).orders)
    if (k.ok) setContracts((await k.json()).contracts)
    if (mm.ok) setMerchants((await mm.json()).merchants)
  }, [])
  useEffect(() => { load() }, [load])

  async function post(url: string, body: object, ok: string) {
    setBusy(true)
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Request failed')
      toast.success(ok); await load(); return true
    } catch (e: any) { toast.error(e.message); return false } finally { setBusy(false) }
  }

  const saveContract = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await post('/api/admin/housing/contracts', {
      code: c.code, title: c.title, design: c.design, size: c.size, category: c.category, volume: c.volume, requirements: c.requirements, projectId: c.projectId, projectName: c.projectName, state: c.state, lga: c.lga,
      durationDays: parseInt(c.durationDays, 10), contractValue: parseInt(c.contractValue, 10),
      paymentDaysAfterCompletion: parseInt(c.paymentDays, 10), paymentTerms: c.paymentTerms, slots: parseInt(c.slots, 10),
      isPublished: c.isPublished, materialsText: c.materialsText,
    }, c.isPublished ? 'Contract saved and published' : 'Contract saved (not published)')
    if (ok) setC({ ...EMPTY_C })
  }
  const editContract = (k: any) => {
    const pr = one(k.housing_projects)
    setC({
      code: k.code, title: k.title, design: k.design ?? '', size: k.size ?? '', category: k.category ?? '', volume: k.volume ?? '', requirements: k.requirements ?? '', projectId: k.project_id ?? '', projectName: pr?.name ?? '', state: pr?.state ?? '', lga: pr?.lga ?? '',
      durationDays: String(k.duration_days), contractValue: String(k.contract_value), paymentDays: String(k.payment_days_after_completion), slots: String(k.slots),
      paymentTerms: k.payment_terms ?? '', isPublished: k.is_published,
      materialsText: (k.contract_materials ?? []).map((x: any) => `${one(x.materials)?.name}, ${one(x.materials)?.unit}, ${x.quantity}`).join('\n'),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await post('/api/admin/housing/projects', {
      name: p.name, state: p.state, lga: p.lga, description: p.description, status: p.status, landSize: p.landSize, designSummary: p.designSummary,
      buildingsCount: p.buildingsCount ? parseInt(p.buildingsCount, 10) : undefined, constructionSize: p.constructionSize, purpose: p.purpose,
      startDate: p.startDate, completionDate: p.completionDate, drawingsUrl: p.drawingsUrl, isPublished: p.isPublished,
    }, p.isPublished ? 'Project saved and published' : 'Project saved (not published)')
    if (ok) setP({ ...EMPTY_P })
  }
  const editProject = (x: any) => {
    setP({ name: x.name, state: x.state, lga: x.lga ?? '', description: x.description ?? '', status: x.status, landSize: x.land_size ?? '', designSummary: x.design_summary ?? '',
           buildingsCount: x.buildings_count ? String(x.buildings_count) : '', constructionSize: x.construction_size ?? '', purpose: x.purpose ?? '',
           startDate: x.start_date ?? '', completionDate: x.completion_date ?? '', drawingsUrl: x.drawings_url ?? '', isPublished: x.is_published })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveMerchant = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await post('/api/admin/housing/merchants', {
      id: m.id || undefined, name: m.name, state: m.state, phone: m.phone, bankName: m.bankName, accountNumber: m.accountNumber, accountName: m.accountName,
      logisticsFee: parseInt(m.logisticsFee, 10) || 0, deliveryPercent: parseFloat(m.deliveryPercent) || 0, isActive: m.isActive, pricesText: m.pricesText,
    }, 'Merchant saved')
    if (ok) setM({ ...EMPTY_M })
  }
  const editMerchant = (x: any) => {
    setM({
      id: x.id, name: x.name, state: x.state, phone: x.phone ?? '', bankName: x.bank_name ?? '', accountNumber: x.account_number ?? '', accountName: x.account_name ?? '',
      logisticsFee: String(x.logistics_fee), deliveryPercent: String(x.delivery_percent), isActive: x.is_active,
      pricesText: (x.merchant_prices ?? []).map((p: any) => `${one(p.materials)?.name}, ${p.unit_price}`).join('\n'),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function orderAction(o: any, action: 'confirm' | 'preparing' | 'dispatched' | 'delivered' | 'reject') {
    const q = action === 'confirm' ? `Confirm ${o.ref}? Only do this after the contractor's payment of ${naira(o.total_cost)} has reached ${o.merchant?.name}.`
      : action === 'reject' ? `Reject ${o.ref}? Use this when no payment was found.` : `Mark ${o.ref} as ${action}?`
    if (!confirm(q)) return
    await post(`/api/admin/housing/orders/${o.id}`, { action }, action === 'confirm' ? 'Payment confirmed' : action === 'reject' ? 'Order rejected' : `Marked as ${action}`)
  }

  const waiting = orders.filter(o => o.status === 'awaiting_confirmation').length
  const states = Object.keys(NIGERIA_DATA).sort()

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([['orders', `Orders${waiting ? ` (${waiting} waiting)` : ''}`], ['projects', 'Projects'], ['contracts', 'Contracts'], ['merchants', 'Merchants']] as const).map(([k, label]) => (
          <Button key={k} size="sm" variant={tab === k ? 'default' : 'outline'} onClick={() => setTab(k)}>{label}</Button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-sm text-muted py-8 text-center">No orders yet.</p>}
          {orders.map(o => (
            <Card key={o.id} className={`${box} ${o.status === 'awaiting_confirmation' ? 'border-gold' : ''}`}><CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-white">{o.contract?.code} · {o.contract?.title}</p>
                  <p className="text-xs text-muted">{o.ref} · {new Date(o.created_at).toLocaleString()} · contractor {o.contractor_phone} · merchant {o.merchant?.name}</p>
                </div>
                <Badge variant={o.status === 'awaiting_confirmation' ? 'default' : 'secondary'}>{o.status.replace('_', ' ')}</Badge>
              </div>
              <p className="text-xs text-ink dark:text-white">Cost {naira(o.total_cost)} · Contract value {naira(o.contract_value)} · Expected gross profit {naira(o.expected_profit)}{o.due_date ? ` · Due ${o.due_date}` : ''}{['paid', 'supplied'].includes(o.status) ? ` · Delivery: ${o.delivery_status.replace('_', ' ')}` : ''}</p>
              <div className="flex gap-2">
                {['pending_payment', 'awaiting_confirmation', 'expired'].includes(o.status) && <Button size="sm" disabled={busy} onClick={() => orderAction(o, 'confirm')}>Confirm payment</Button>}
                {['paid', 'supplied'].includes(o.status) && (['preparing', 'dispatched', 'delivered'] as const).filter(s => ['not_started', 'preparing', 'dispatched', 'delivered', 'confirmed'].indexOf(s) > ['not_started', 'preparing', 'dispatched', 'delivered', 'confirmed'].indexOf(o.delivery_status)).map(s => (
                  <Button key={s} size="sm" variant={s === 'delivered' ? 'default' : 'outline'} disabled={busy} onClick={() => orderAction(o, s)}>Mark {s}</Button>
                ))}
                {['pending_payment', 'awaiting_confirmation', 'expired'].includes(o.status) && <Button size="sm" variant="outline" disabled={busy} onClick={() => orderAction(o, 'reject')}>Reject</Button>}
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'projects' && (
        <>
          <Card className={box}><CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-ink dark:text-white">Announce a housing project</h2>
            <form onSubmit={saveProject} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className={`${field} md:col-span-2`} placeholder="Project name" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} />
                <select className={field} value={p.state} onChange={e => setP({ ...p, state: e.target.value })}><option value="">State</option>{states.map(s => <option key={s}>{s}</option>)}</select>
                <input className={field} placeholder="LGA" value={p.lga} onChange={e => setP({ ...p, lga: e.target.value })} />
                <input className={field} placeholder="Land size (e.g. 12 hectares)" value={p.landSize} onChange={e => setP({ ...p, landSize: e.target.value })} />
                <select className={field} value={p.status} onChange={e => setP({ ...p, status: e.target.value })}><option value="planned">Planned</option><option value="active">Active</option><option value="completed">Completed</option></select>
                <input className={`${field} md:col-span-2`} placeholder="Design (e.g. 3-bedroom detached bungalows)" value={p.designSummary} onChange={e => setP({ ...p, designSummary: e.target.value })} />
                <input className={field} type="number" min={1} placeholder="Number of buildings" value={p.buildingsCount} onChange={e => setP({ ...p, buildingsCount: e.target.value })} />
                <input className={field} placeholder="Size of each building" value={p.constructionSize} onChange={e => setP({ ...p, constructionSize: e.target.value })} />
                <input className={`${field} md:col-span-2`} placeholder="Purpose (residential sales, rental, estate...)" value={p.purpose} onChange={e => setP({ ...p, purpose: e.target.value })} />
                <label className="text-xs text-muted space-y-1 block">Start date<input className={field} type="date" value={p.startDate} onChange={e => setP({ ...p, startDate: e.target.value })} /></label>
                <label className="text-xs text-muted space-y-1 block">Expected completion<input className={field} type="date" value={p.completionDate} onChange={e => setP({ ...p, completionDate: e.target.value })} /></label>
                <input className={field} placeholder="Link to plans / drawings (https://...)" value={p.drawingsUrl} onChange={e => setP({ ...p, drawingsUrl: e.target.value })} />
              </div>
              <textarea className={`${field} h-24 py-2`} placeholder="Description" value={p.description} onChange={e => setP({ ...p, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-ink dark:text-white"><input type="checkbox" checked={p.isPublished} onChange={e => setP({ ...p, isPublished: e.target.checked })} /> Published (shown on the public Housing Projects page)</label>
              <p className="text-[11px] text-red-600">Only publish a project once the land title, survey and development approvals have been verified.</p>
              <div className="flex gap-2"><Button type="submit" disabled={busy}>Save project</Button>{p.name && <Button type="button" variant="outline" onClick={() => setP({ ...EMPTY_P })}>Clear</Button>}</div>
            </form>
          </CardContent></Card>
          <div className="space-y-2">
            {projects.map(x => (
              <Card key={x.id} className={box}><CardContent className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="text-sm font-semibold text-ink dark:text-white">{x.name}</p><p className="text-xs text-muted">{[x.lga, x.state].filter(Boolean).join(', ')} · {x.status}{x.land_size ? ` · ${x.land_size}` : ''}</p></div>
                <div className="flex items-center gap-2 shrink-0"><Badge variant={x.is_published ? 'default' : 'secondary'}>{x.is_published ? 'Published' : 'Draft'}</Badge><Button size="sm" variant="outline" onClick={() => editProject(x)}>Edit</Button></div>
              </CardContent></Card>
            ))}
          </div>
        </>
      )}

      {tab === 'contracts' && (
        <>
          <Card className={box}><CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-ink dark:text-white">{c.code && contracts.some(k => k.code === c.code.toUpperCase()) ? 'Edit contract' : 'New contract'}</h2>
            <form onSubmit={saveContract} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className={field} placeholder="Contract code (e.g. HC-ED-0001)" value={c.code} onChange={e => setC({ ...c, code: e.target.value.toUpperCase() })} />
                <input className={`${field} md:col-span-2`} placeholder="Title (e.g. 2-bedroom bungalow)" value={c.title} onChange={e => setC({ ...c, title: e.target.value })} />
                <input className={field} placeholder="Design" value={c.design} onChange={e => setC({ ...c, design: e.target.value })} />
                <input className={field} placeholder="Size (e.g. 80 sqm)" value={c.size} onChange={e => setC({ ...c, size: e.target.value })} />
                <input className={field} placeholder="Category (e.g. Foundation and substructure)" value={c.category} onChange={e => setC({ ...c, category: e.target.value })} />
                <input className={field} placeholder="Volume (e.g. Package 1 of 3)" value={c.volume} onChange={e => setC({ ...c, volume: e.target.value })} />
                <input className={field} placeholder="Contractor requirements" value={c.requirements} onChange={e => setC({ ...c, requirements: e.target.value })} />
                <select className={`${field} md:col-span-3`} value={c.projectId} onChange={e => setC({ ...c, projectId: e.target.value })}><option value="">Project: choose an announced project (or type a new name below)</option>{projects.map(x => <option key={x.id} value={x.id}>{x.name} · {x.state}</option>)}</select>
                <input className={field} placeholder="Project name" value={c.projectName} onChange={e => setC({ ...c, projectName: e.target.value })} />
                <select className={field} value={c.state} onChange={e => setC({ ...c, state: e.target.value })}><option value="">Project state</option>{states.map(s => <option key={s}>{s}</option>)}</select>
                <input className={field} placeholder="Project LGA" value={c.lga} onChange={e => setC({ ...c, lga: e.target.value })} />
                <input className={field} type="number" min={1} placeholder="Build time (days)" value={c.durationDays} onChange={e => setC({ ...c, durationDays: e.target.value })} />
                <input className={field} type="number" min={1} placeholder="Contract value (₦)" value={c.contractValue} onChange={e => setC({ ...c, contractValue: e.target.value })} />
                <input className={field} type="number" min={0} placeholder="Paid how many days after completion" value={c.paymentDays} onChange={e => setC({ ...c, paymentDays: e.target.value })} />
                <input className={field} type="number" min={1} placeholder="Contractor slots" value={c.slots} onChange={e => setC({ ...c, slots: e.target.value })} />
                <input className={field} placeholder="Payment terms (optional)" value={c.paymentTerms} onChange={e => setC({ ...c, paymentTerms: e.target.value })} />
              </div>
              <textarea className={area} placeholder={'Materials, one per line:  name, unit, quantity\nCement, bag, 300\nSharp sand, trip, 10\nRoofing sheet, sheet, 100'} value={c.materialsText} onChange={e => setC({ ...c, materialsText: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-ink dark:text-white"><input type="checkbox" checked={c.isPublished} onChange={e => setC({ ...c, isPublished: e.target.checked })} /> Published (contractors can see and order it)</label>
              <div className="flex gap-2"><Button type="submit" disabled={busy}>Save contract</Button>{c.code && <Button type="button" variant="outline" onClick={() => setC({ ...EMPTY_C })}>Clear</Button>}</div>
            </form>
          </CardContent></Card>
          <div className="space-y-2">
            {contracts.map(k => { const p = one(k.housing_projects); return (
              <Card key={k.id} className={box}><CardContent className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink dark:text-white">{k.code} · {k.title}</p>
                  <p className="text-xs text-muted">{p ? `${p.name}, ${p.state} · ` : ''}{naira(k.contract_value)} · {k.duration_days} days · {k.slots} slot(s) · {(k.contract_materials ?? []).length} materials</p>
                </div>
                <div className="flex items-center gap-2 shrink-0"><Badge variant={k.is_published ? 'default' : 'secondary'}>{k.is_published ? 'Published' : 'Draft'}</Badge><Button size="sm" variant="outline" onClick={() => editContract(k)}>Edit</Button></div>
              </CardContent></Card>) })}
          </div>
        </>
      )}

      {tab === 'merchants' && (
        <>
          <Card className={box}><CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-ink dark:text-white">{m.id ? 'Edit merchant' : 'New merchant'}</h2>
            <form onSubmit={saveMerchant} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className={field} placeholder="Merchant name" value={m.name} onChange={e => setM({ ...m, name: e.target.value })} />
                <select className={field} value={m.state} onChange={e => setM({ ...m, state: e.target.value })}><option value="">State</option>{states.map(s => <option key={s}>{s}</option>)}</select>
                <input className={field} placeholder="Phone" value={m.phone} onChange={e => setM({ ...m, phone: e.target.value })} />
                <input className={field} placeholder="Bank name" value={m.bankName} onChange={e => setM({ ...m, bankName: e.target.value })} />
                <input className={field} inputMode="numeric" maxLength={10} placeholder="10-digit account number" value={m.accountNumber} onChange={e => setM({ ...m, accountNumber: e.target.value.replace(/\D/g, '') })} />
                <input className={field} placeholder="Account name" value={m.accountName} onChange={e => setM({ ...m, accountName: e.target.value })} />
                <input className={field} type="number" min={0} placeholder="Logistics fee per order (₦)" value={m.logisticsFee} onChange={e => setM({ ...m, logisticsFee: e.target.value })} />
                <input className={field} type="number" min={0} max={100} step="0.01" placeholder="Delivery charge (% of materials)" value={m.deliveryPercent} onChange={e => setM({ ...m, deliveryPercent: e.target.value })} />
                <label className="flex items-center gap-2 text-sm text-ink dark:text-white"><input type="checkbox" checked={m.isActive} onChange={e => setM({ ...m, isActive: e.target.checked })} /> Active</label>
              </div>
              <textarea className={area} placeholder={'Prices, one per line:  material, price\nCement, 9000\nSharp sand, 60000'} value={m.pricesText} onChange={e => setM({ ...m, pricesText: e.target.value })} />
              <p className="text-[11px] text-muted dark:text-[#c0d0c4]">Materials must already exist (they are created when you save a contract). Saving replaces this merchant&apos;s price list with the lines above. A merchant must price every material in a contract before contractors can buy that contract through them.</p>
              <p className="text-[11px] text-red-600">The account details are not checked with the bank here. Verify them yourself before contractors pay.</p>
              <div className="flex gap-2"><Button type="submit" disabled={busy}>Save merchant</Button>{m.id && <Button type="button" variant="outline" onClick={() => setM({ ...EMPTY_M })}>Clear</Button>}</div>
            </form>
          </CardContent></Card>
          <div className="space-y-2">
            {merchants.map(x => (
              <Card key={x.id} className={`${box} ${x.is_active ? '' : 'opacity-60'}`}><CardContent className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink dark:text-white">{x.name} · {x.state}</p>
                  <p className="text-xs text-muted">{x.bank_name ? `${x.bank_name} ${x.account_number}` : 'No account set'} · logistics {naira(x.logistics_fee)} · delivery {x.delivery_percent}% · {(x.merchant_prices ?? []).length} prices</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => editMerchant(x)}>Edit</Button>
              </CardContent></Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
