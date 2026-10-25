'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Child = {
  id: string; level: string; parent_id: string | null; direct: boolean; state: string; lga: string | null; ward: string | null
  is_active: boolean; name: string; phone: string | null; stock: { unused: number; redeemed: number; unused_value: number }
}
type Transfer = { id: number; kind: string; denomination: number | null; qty: number; created_at: string; from_name: string; to_name: string; direction: string }
type Net = { level: string; parent: { name: string; phone: string | null } | null; children: Child[]; transfers: Transfer[] }

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'
const box = 'dark:bg-[#11241b] dark:border-[#1f3a2c]'
const LEVEL: Record<string, string> = { sole: 'State Sole Distributor', major: 'LGA distributor', area: 'Ward distributor' }

export function VoucherNetwork({ level, stock, onChanged }: { level: string; stock: Record<string, number>; onChanged: () => void }) {
  const [net, setNet] = useState<Net | null>(null)
  const [to, setTo] = useState('')
  const [denom, setDenom] = useState('')
  const [qty, setQty] = useState('1')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/vouchers/network')
    if (res.ok) setNet(await res.json())
  }, [])
  useEffect(() => { load() }, [load])

  const denoms = Object.keys(stock).map(Number).sort((a, b) => a - b)
  const available = denoms.filter(d => stock[String(d)] > 0)
  useEffect(() => { if (!available.includes(Number(denom))) setDenom(available[0] ? String(available[0]) : '') }, [available.join(','), denom]) // eslint-disable-line

  const children = net?.children ?? []
  const recipients = children.filter(c => c.direct && c.is_active)
  const majors = children.filter(c => c.level === 'major')
  const wardsOf = (id: string) => children.filter(c => c.level === 'area' && c.parent_id === id)
  const orphanWards = children.filter(c => c.level === 'area' && !majors.some(m => m.id === c.parent_id))
  const max = Number(denom) ? stock[denom] ?? 0 : 0

  async function post(url: string, body: object, ok: (d: any) => string) {
    setBusy(true)
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Request failed')
      toast.success(ok(d))
      await Promise.all([load(), onChanged()])
      return true
    } catch (e: any) { toast.error(e.message); return false } finally { setBusy(false) }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const who = recipients.find(r => r.id === to)
    if (!who || !denom) return toast.error('Choose who to send to and which vouchers')
    const n = parseInt(qty, 10)
    if (!n || n < 1) return toast.error('Enter a quantity')
    if (!confirm(`Send ${n} × ${denom} CIVICT vouchers to ${who.name}?\n\nThis moves the vouchers only. Settle any payment with them yourselves.`)) return
    await post('/api/vouchers/transfer', { toDistributorId: to, denomination: Number(denom), quantity: n }, d => `Sent ${d.moved} vouchers to ${who.name}`)
  }

  async function takeBack(c: Child) {
    if (!confirm(`Take back all ${c.stock.unused} unused vouchers from ${c.name}?`)) return
    await post('/api/vouchers/recall', { childId: c.id }, d => `Took back ${d.moved} vouchers`)
  }

  function Row({ c, indent }: { c: Child; indent?: boolean }) {
    return (
      <div className={`rounded-lg border border-border dark:border-[#1f3a2c] p-3 space-y-1 ${indent ? 'ml-5' : ''} ${c.is_active ? '' : 'opacity-60'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink dark:text-white truncate">{c.name}</p>
            <p className="text-xs text-muted">{LEVEL[c.level]} · {c.level === 'area' ? `${c.ward}, ${c.lga}` : c.lga}</p>
            {c.phone && <a href={`tel:${c.phone}`} className="text-xs underline text-ink dark:text-white">{c.phone}</a>}
          </div>
          <div className="text-right shrink-0">
            {!c.is_active && <Badge variant="secondary">Inactive</Badge>}
            <p className="text-sm font-bold text-ink dark:text-white">{c.stock.unused.toLocaleString()} in stock</p>
            <p className="text-[11px] text-muted">₡ {c.stock.unused_value.toLocaleString()} · {c.stock.redeemed} redeemed</p>
          </div>
        </div>
        {c.direct && c.stock.unused > 0 && (
          <div className="flex justify-end"><Button size="sm" variant="outline" disabled={busy} onClick={() => takeBack(c)}>Take back stock</Button></div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {denoms.map(d => (
          <Card key={d} className={box}><CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted">{d} CIVICT in stock</p>
            <p className="text-lg font-bold text-ink dark:text-white">{(stock[String(d)] ?? 0).toLocaleString()}</p>
          </CardContent></Card>
        ))}
      </div>

      {level !== 'sole' && (
        <Card className={box}><CardContent className="p-4 space-y-1">
          <h2 className="font-bold text-ink dark:text-white">{LEVEL[level] ?? 'Distributor'}</h2>
          {net?.parent
            ? <p className="text-sm text-ink dark:text-white">Your vouchers come from <b>{net.parent.name}</b>{net.parent.phone && <> · <a href={`tel:${net.parent.phone}`} className="underline">{net.parent.phone}</a></>}.</p>
            : <p className="text-sm text-muted">You are not linked to a supplier yet. Contact DICO.</p>}
          <p className="text-xs text-muted dark:text-[#c0d0c4]">Vouchers sent to you appear in your list below. Hand a code to the buyer once you have been paid; each code works once.</p>
        </CardContent></Card>
      )}

      {level !== 'area' && (
        <>
          <Card className={box}><CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-ink dark:text-white">{level === 'sole' ? 'My LGA and ward distributors' : 'My ward distributors'}</h2>
            {!net && <p className="text-sm text-muted">Loading...</p>}
            {net && children.length === 0 && <p className="text-sm text-muted">No one has been registered under you yet. DICO admin adds them.</p>}
            {level === 'sole' ? (
              <div className="space-y-3">
                {majors.map(m => (
                  <div key={m.id} className="space-y-2">
                    <Row c={m} />
                    {wardsOf(m.id).map(w => <Row key={w.id} c={w} indent />)}
                  </div>
                ))}
                {orphanWards.length > 0 && (
                  <div className="space-y-2"><p className="text-xs text-muted">Ward distributors without an active LGA distributor</p>{orphanWards.map(w => <Row key={w.id} c={w} />)}</div>
                )}
              </div>
            ) : (
              <div className="space-y-2">{children.map(c => <Row key={c.id} c={c} />)}</div>
            )}
          </CardContent></Card>

          {recipients.length > 0 && (
            <Card className={box}><CardContent className="p-4 space-y-3">
              <h2 className="font-bold text-ink dark:text-white">Send vouchers</h2>
              {available.length === 0 ? <p className="text-sm text-muted">You have no unused vouchers to send.</p> : (
                <form onSubmit={send} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-3 items-end">
                  <label className="text-xs text-muted space-y-1 block">To
                    <select className={field} value={to} onChange={e => setTo(e.target.value)}>
                      <option value="">Choose…</option>
                      {recipients.map(r => <option key={r.id} value={r.id}>{r.name} · {r.level === 'area' ? r.ward : r.lga}</option>)}
                    </select>
                  </label>
                  <label className="text-xs text-muted space-y-1 block">Voucher
                    <select className={field} value={denom} onChange={e => setDenom(e.target.value)}>
                      {available.map(d => <option key={d} value={d}>{d} CIVICT ({stock[String(d)]} in stock)</option>)}
                    </select>
                  </label>
                  <label className="text-xs text-muted space-y-1 block">Quantity
                    <input className={field} type="number" min={1} max={Math.min(500, max)} value={qty} onChange={e => setQty(e.target.value)} />
                  </label>
                  <Button type="submit" disabled={busy || !to || !denom || (parseInt(qty, 10) || 0) > max}>Send</Button>
                </form>
              )}
              <p className="text-xs text-muted dark:text-[#c0d0c4]">Sending moves the vouchers only. Any payment between you and them is settled outside the app.</p>
            </CardContent></Card>
          )}
        </>
      )}

      {net && net.transfers.length > 0 && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer">Recent stock movements ({net.transfers.length})</summary>
          <ul className="mt-2 space-y-1">
            {net.transfers.map(t => (
              <li key={t.id}>
                {new Date(t.created_at).toLocaleDateString()} · {t.kind === 'recall' ? `${t.qty} vouchers taken back` : `${t.qty} × ${t.denomination} CIVICT`} ·{' '}
                {t.direction === 'out' ? `to ${t.to_name}` : `from ${t.from_name}`}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
