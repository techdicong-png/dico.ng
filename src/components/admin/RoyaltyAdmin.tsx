'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { NIGERIA_DATA } from '@/data/nigeria'

type Rate = { role: string; amount_naira: number }
type Total = { role: string; paid_to_leaders: number; unclaimed: number; transactions: number }
type Leader = { id: string; role: string; zone: string | null; function: string | null; users: { full_name: string; email: string } | null }

const ROLES: [string, string][] = [
  ['ward', 'Ward distributor'], ['lga', 'LGA distributor'], ['state', 'State Sole Distributor'],
  ['zonal', 'Zonal director'], ['national', 'National directors (total, shared equally)'],
]
const ZONES = ['North Central', 'North East', 'North West', 'South East', 'South South', 'South West']
const FUNCTIONS: [string, string][] = [['activation_logistics', 'Activation / Logistics'], ['admin_finance', 'Admin & Finance'], ['sales', 'Sales']]
const naira = (n: number) => '₦' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'
const box = 'dark:bg-[#11241b] dark:border-[#1f3a2c]'

export function RoyaltyAdmin({ initialRates, initialTotals, initialLeaders }: { initialRates: Rate[]; initialTotals: Total[]; initialLeaders: Leader[] }) {
  const [rates, setRates] = useState<Record<string, string>>(
    Object.fromEntries(ROLES.map(([k]) => [k, String(initialRates.find(r => r.role === k)?.amount_naira ?? 0)]))
  )
  const [totals, setTotals] = useState<Total[]>(initialTotals)
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders)
  const [busy, setBusy] = useState(false)

  const [lEmail, setLEmail] = useState('')
  const [lRole, setLRole] = useState<'zonal_director' | 'national_director'>('zonal_director')
  const [lZone, setLZone] = useState(ZONES[0])
  const [lFn, setLFn] = useState(FUNCTIONS[0][0])

  const [ref, setRef] = useState('')
  const [st, setSt] = useState('')
  const [lga, setLga] = useState('')
  const [ward, setWard] = useState('')

  const sum = ROLES.reduce((a, [k]) => a + (parseFloat(rates[k]) || 0), 0)

  async function refresh() {
    const res = await fetch('/api/admin/royalty')
    if (!res.ok) return
    const d = await res.json()
    setTotals(d.totals); setLeaders(d.leaders)
  }

  async function post(url: string, body: object, ok: (d: any) => string) {
    setBusy(true)
    const t = toast.loading('Working...')
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      toast.success(ok(data), { id: t })
      await refresh()
      return true
    } catch (e: any) { toast.error(e.message, { id: t }); return false } finally { setBusy(false) }
  }

  const saveRates = () => post('/api/admin/royalty/rates',
    Object.fromEntries(ROLES.map(([k]) => [k, parseFloat(rates[k]) || 0])), () => 'Rates saved (new transactions only)')

  async function addLeader() {
    if (!lEmail) return toast.error('Enter the user email')
    const body = lRole === 'zonal_director' ? { email: lEmail, role: lRole, zone: lZone } : { email: lEmail, role: lRole, function: lFn }
    if (await post('/api/admin/leaders', body, () => 'Leader added')) setLEmail('')
  }

  async function removeLeader(l: Leader) {
    if (!confirm(`Remove ${l.users?.full_name} from this role? Their past earnings are kept.`)) return
    const res = await fetch(`/api/admin/leaders?id=${l.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Removed'); refresh() } else toast.error('Could not remove')
  }

  async function record() {
    if (!st || !lga || !ward) return toast.error('Choose state, LGA and ward')
    const r = ref.trim() || `manual-${Date.now()}`
    if (await post('/api/admin/royalty', { ref: r, state: st, lga, ward }, d => d.entries === 0 ? 'That reference was already recorded' : `Recorded ${d.entries} royalty entries`)) setRef('')
  }

  const lgas = st ? Object.keys(NIGERIA_DATA[st] || {}).sort() : []
  const wards = st && lga ? NIGERIA_DATA[st]?.[lga] || [] : []

  return (
    <div className="space-y-6">
      <Card className={box}><CardContent className="p-4 space-y-3">
        <h2 className="font-bold text-ink dark:text-white">Royalty per transaction (₦)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ROLES.map(([k, label]) => (
            <label key={k} className="text-xs text-muted space-y-1 block">{label}
              <input className={field} type="number" min={0} step="0.01" value={rates[k]} onChange={e => setRates(p => ({ ...p, [k]: e.target.value }))} />
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-ink dark:text-white">Total paid out per transaction: <b>{naira(sum)}</b></p>
          <Button disabled={busy} onClick={saveRates}>Save rates</Button>
        </div>
      </CardContent></Card>

      <Card className={box}><CardContent className="p-4 space-y-3">
        <h2 className="font-bold text-ink dark:text-white">Accrued so far</h2>
        <p className="text-xs text-muted dark:text-[#c0d0c4]">Unclaimed means nobody was appointed for that role at the time. It is kept so nothing is lost; you decide later what happens to it.</p>
        <div className="overflow-x-auto"><table className="w-full text-sm text-ink dark:text-white">
          <thead><tr className="text-left text-xs text-muted"><th className="py-1">Role</th><th>To leaders</th><th>Unclaimed</th><th>Transactions</th></tr></thead>
          <tbody>
            {ROLES.map(([k, label]) => { const t = totals.find(x => x.role === k); return (
              <tr key={k} className="border-t border-border dark:border-[#1f3a2c]"><td className="py-1.5">{label.split(' (')[0]}</td>
                <td>{naira(t?.paid_to_leaders ?? 0)}</td><td className={t?.unclaimed ? 'text-red-600' : ''}>{naira(t?.unclaimed ?? 0)}</td><td>{t?.transactions ?? 0}</td></tr>) })}
          </tbody>
        </table></div>
      </CardContent></Card>

      <Card className={box}><CardContent className="p-4 space-y-3">
        <h2 className="font-bold text-ink dark:text-white">Zonal and national directors</h2>
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-3">
          <input className={field} type="email" placeholder="User's registered email" value={lEmail} onChange={e => setLEmail(e.target.value)} />
          <select className={field} value={lRole} onChange={e => setLRole(e.target.value as any)}>
            <option value="zonal_director">Zonal director</option><option value="national_director">National director</option>
          </select>
          {lRole === 'zonal_director'
            ? <select className={field} value={lZone} onChange={e => setLZone(e.target.value)}>{ZONES.map(z => <option key={z}>{z}</option>)}</select>
            : <select className={field} value={lFn} onChange={e => setLFn(e.target.value)}>{FUNCTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}
          <Button disabled={busy} onClick={addLeader}>Add</Button>
        </div>
        <div className="space-y-2">
          {leaders.length === 0 && <p className="text-sm text-muted">No directors appointed yet.</p>}
          {leaders.map(l => (
            <div key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-border dark:border-[#1f3a2c] p-2 text-sm text-ink dark:text-white">
              <span><b>{l.users?.full_name}</b> · {l.role === 'zonal_director' ? `Zonal director, ${l.zone}` : `National director, ${FUNCTIONS.find(f => f[0] === l.function)?.[1]}`}</span>
              <Button size="sm" variant="outline" onClick={() => removeLeader(l)}>Remove</Button>
            </div>
          ))}
        </div>
      </CardContent></Card>

      <Card className={box}><CardContent className="p-4 space-y-3">
        <h2 className="font-bold text-ink dark:text-white">Record a transaction&apos;s royalty</h2>
        <p className="text-xs text-muted dark:text-[#c0d0c4]">Use this to test, or to record one manually. Each reference can only be recorded once.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select className={field} value={st} onChange={e => { setSt(e.target.value); setLga(''); setWard('') }}>
            <option value="">State</option>{Object.keys(NIGERIA_DATA).sort().map(s => <option key={s}>{s}</option>)}
          </select>
          <select className={field} value={lga} onChange={e => { setLga(e.target.value); setWard('') }} disabled={!st}>
            <option value="">LGA</option>{lgas.map(l => <option key={l}>{l}</option>)}
          </select>
          <select className={field} value={ward} onChange={e => setWard(e.target.value)} disabled={!lga}>
            <option value="">Ward</option>{wards.map(w => <option key={w}>{w}</option>)}
          </select>
          <input className={field} placeholder="Reference (optional)" value={ref} onChange={e => setRef(e.target.value)} />
        </div>
        <Button disabled={busy} onClick={record}>Record royalty</Button>
      </CardContent></Card>
    </div>
  )
}
