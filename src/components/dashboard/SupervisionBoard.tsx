'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Totals = { sole: number; lga: number; ward: number; active: number; generated: number; generated_value: number; in_stock: number; sold: number; sold_value: number; redeemed: number; open_orders: number; paid_to_dico: number }
type Dist = { id: string; level: string; state: string; lga: string | null; ward: string | null; name: string; phone: string | null; is_active: boolean; vgi_active: boolean; balance_naira: number; generated: number; in_stock: number; sold: number; sold_value: number; redeemed: number; open_orders: number; sent_out: number; received: number; paid_to_dico: number }
type Ev = { at: string; kind: string; distributor_id: string; name: string; level: string; state: string; lga: string | null; ward: string | null; detail: string; amount: number | null }

const LEVEL: Record<string, string> = { sole: 'State Sole Distributor', major: 'LGA distributor', area: 'Ward distributor' }
const KIND: Record<string, string> = {
  order_paid: 'Sale confirmed', order_rejected: 'Order rejected', transfer: 'Stock moved',
  payment_recorded: 'Payment to DICO', vouchers_generated: 'Vouchers generated', redeemed: 'Redeemed',
}
const naira = (n: number) => '₦' + Number(n).toLocaleString()
const field =
  'h-9 rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'
const box = 'dark:bg-[#11241b] dark:border-[#1f3a2c]'

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 90) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return new Date(iso).toLocaleDateString()
}

export function SupervisionBoard() {
  const [scope, setScope] = useState<{ kind: string; label: string } | null>(null)
  const [states, setStates] = useState<string[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [dists, setDists] = useState<Dist[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [events, setEvents] = useState<Ev[]>([])
  const [evMore, setEvMore] = useState(false)
  const [state, setState] = useState('')
  const [level, setLevel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const qs = (extra: Record<string, string> = {}) => {
    const p = new URLSearchParams({ ...(state && { state }), ...(level && { level }), ...extra })
    return p.toString()
  }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [s, f] = await Promise.all([
      fetch(`/api/supervision?${qs()}`), fetch(`/api/supervision/feed?${state ? `state=${encodeURIComponent(state)}` : ''}`),
    ])
    if (!s.ok) { setError(s.status === 403 ? 'You do not have a supervision role.' : 'Could not load supervision data.'); setLoading(false); return }
    const d = await s.json()
    setScope(d.scope); setStates(d.states); setTotals(d.totals); setDists(d.distributors); setHasMore(d.hasMore)
    if (f.ok) { const e = await f.json(); setEvents(e.events); setEvMore(e.hasMore) }
    setLoading(false)
  }, [state, level]) // eslint-disable-line

  useEffect(() => { load() }, [load])

  async function moreDists() {
    const res = await fetch(`/api/supervision?${qs({ offset: String(dists.length) })}`)
    if (res.ok) { const d = await res.json(); setDists(p => [...p, ...d.distributors]); setHasMore(d.hasMore) }
  }
  async function moreEvents() {
    const last = events[events.length - 1]
    if (!last) return
    const p = new URLSearchParams({ before: last.at, ...(state && { state }) })
    const res = await fetch(`/api/supervision/feed?${p}`)
    if (res.ok) { const e = await res.json(); setEvents(x => [...x, ...e.events]); setEvMore(e.hasMore) }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!scope || !totals) return <p className="text-sm text-muted">Loading...</p>

  const cards: [string, string, string?][] = [
    ['People', `${totals.sole + totals.lga + totals.ward}`, `${totals.sole} state · ${totals.lga} LGA · ${totals.ward} ward`],
    ['Vouchers generated', totals.generated.toLocaleString(), `₡ ${totals.generated_value.toLocaleString()}`],
    ['In stock now', totals.in_stock.toLocaleString()],
    ['Sold online', totals.sold.toLocaleString(), naira(totals.sold_value)],
    ['Redeemed', totals.redeemed.toLocaleString()],
    ['Orders waiting', totals.open_orders.toLocaleString(), totals.open_orders > 0 ? 'unconfirmed' : undefined],
    ['Paid to DICO', naira(totals.paid_to_dico), 'voucher credit'],
  ]

  return (
    <div className="space-y-6">
      <Card className={box}><CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-wide text-muted">You are viewing</p>
        <p className="text-lg font-bold text-ink dark:text-white">{scope.label}</p>
        <p className="text-xs text-muted dark:text-[#c0d0c4]">Everything below is read-only. Buyer phone numbers and voucher codes are hidden.</p>
      </CardContent></Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(([label, value, sub]) => (
          <Card key={label} className={box}><CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
            <p className="text-lg font-bold text-ink dark:text-white">{value}</p>
            {sub && <p className="text-[11px] text-muted">{sub}</p>}
          </CardContent></Card>
        ))}
      </div>

      {scope.kind !== 'ward' && (
        <div className="flex flex-wrap gap-2">
          {states.length > 1 && (
            <select className={field} value={state} onChange={e => setState(e.target.value)}>
              <option value="">All states</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          )}
          <select className={field} value={level} onChange={e => setLevel(e.target.value)}>
            <option value="">All levels</option>
            <option value="sole">State Sole Distributors</option>
            <option value="major">LGA distributors</option>
            <option value="area">Ward distributors</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="font-bold text-ink dark:text-white">Distributors</h2>
        {dists.length === 0 && <p className="text-sm text-muted py-4 text-center">No distributors in this view.</p>}
        {dists.map(d => (
          <Card key={d.id} className={`${box} ${d.is_active ? '' : 'opacity-60'}`}><CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink dark:text-white truncate">{d.name}</p>
                <p className="text-xs text-muted">{LEVEL[d.level]} · {d.level === 'area' ? `${d.ward}, ${d.lga}, ${d.state}` : d.level === 'major' ? `${d.lga}, ${d.state}` : d.state}</p>
                {d.phone && <a href={`tel:${d.phone}`} className="text-xs underline text-ink dark:text-white">{d.phone}</a>}
              </div>
              <div className="flex gap-1 shrink-0">
                {!d.is_active && <Badge variant="secondary">Inactive</Badge>}
                {d.open_orders > 0 && <Badge>{d.open_orders} waiting</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              {[
                ['In stock', d.in_stock.toLocaleString()],
                ['Generated', d.level === 'sole' ? d.generated.toLocaleString() : '—'],
                ['Sold online', `${d.sold} · ${naira(d.sold_value)}`],
                ['Redeemed', d.redeemed.toLocaleString()],
                ['Received / sent', `${d.received} / ${d.sent_out}`],
                [d.level === 'sole' ? 'Balance' : '—', d.level === 'sole' ? naira(d.balance_naira) : ''],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-1.5 px-1">
                  <p className="text-[10px] uppercase tracking-wide text-muted">{l}</p>
                  <p className="font-semibold text-ink dark:text-white">{v}</p>
                </div>
              ))}
            </div>
          </CardContent></Card>
        ))}
        {hasMore && <div className="text-center"><Button variant="outline" size="sm" onClick={moreDists}>Show more</Button></div>}
      </div>

      <div className="space-y-2">
        <h2 className="font-bold text-ink dark:text-white">Recent activity</h2>
        {events.length === 0 && <p className="text-sm text-muted py-4 text-center">No activity yet.</p>}
        {events.map((e, i) => (
          <Card key={`${e.at}-${i}`} className={box}><CardContent className="p-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs"><Badge variant="secondary">{KIND[e.kind] ?? e.kind}</Badge> <span className="text-muted">{ago(e.at)}</span></p>
              <p className="text-sm text-ink dark:text-white mt-1">{e.detail}</p>
              <p className="text-xs text-muted">{e.name} · {LEVEL[e.level]} · {e.level === 'area' ? e.ward : e.level === 'major' ? e.lga : e.state}</p>
            </div>
            {e.amount != null && <p className="font-bold text-ink dark:text-white shrink-0">{naira(e.amount)}</p>}
          </CardContent></Card>
        ))}
        {evMore && <div className="text-center"><Button variant="outline" size="sm" onClick={moreEvents}>Show older</Button></div>}
      </div>
    </div>
  )
}
