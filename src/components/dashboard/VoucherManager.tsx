'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Summary = {
  level: string; state: string; vgi_active: boolean
  voucher_credit: number; voucher_used: number; voucher_remaining: number; sms_units: number
}
type Voucher = { id: string; code: string; denomination: number; status: string; created_at: string; redeemed_at: string | null }

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'

export function VoucherManager() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [denoms, setDenoms] = useState<number[]>([])
  const [denom, setDenom] = useState('')
  const [qty, setQty] = useState('1')
  const [filter, setFilter] = useState<'all' | 'unused' | 'redeemed'>('unused')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const [v, p] = await Promise.all([fetch('/api/vouchers'), fetch('/api/vouchers/pricing')])
    if (v.ok) {
      const d = await v.json()
      setSummary(d.distributor)
      setVouchers(d.vouchers)
    }
    if (p.ok) {
      const list = (await p.json()).pricing.map((x: any) => x.denomination)
      setDenoms(list)
      setDenom(prev => prev || String(list[0] ?? ''))
    }
    setLoaded(true)
  }, [])

  useEffect(() => { load() }, [load])

  const cost = (parseInt(denom, 10) || 0) * (parseInt(qty, 10) || 0)

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const t = toast.loading('Generating vouchers...')
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ denomination: parseInt(denom, 10), quantity: parseInt(qty, 10) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success(`${data.vouchers.length} voucher(s) created`, { id: t })
      setFilter('unused')
      await load()
    } catch (err: any) {
      toast.error(err.message, { id: t })
    } finally {
      setBusy(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied'))
  }

  const shown = vouchers.filter(v => filter === 'all' ? v.status !== 'void' : v.status === filter)

  if (!loaded) return <p className="text-sm text-muted">Loading...</p>
  if (!summary) return <p className="text-sm text-red-600">Could not load your voucher data.</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Voucher credit', `₡ ${summary.voucher_credit.toLocaleString()}`],
          ['Issued', `₡ ${summary.voucher_used.toLocaleString()}`],
          ['Remaining', `₡ ${summary.voucher_remaining.toLocaleString()}`],
          ['SMS units', summary.sms_units.toLocaleString()],
        ].map(([label, value]) => (
          <Card key={label} className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
              <p className="text-lg font-bold text-ink dark:text-white">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!summary.vgi_active ? (
        <Card className="border-gold dark:bg-[#11241b]">
          <CardContent className="p-4 text-sm text-ink dark:text-white">
            Your Voucher Generator Interface is not active yet. It is activated by DICO admin after payment.
          </CardContent>
        </Card>
      ) : (
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-ink dark:text-white">Generate vouchers</h2>
            <form onSubmit={generate} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <label className="text-xs text-muted space-y-1 block">
                Denomination (CIVICT)
                <select className={field} value={denom} onChange={e => setDenom(e.target.value)}>
                  {denoms.map(d => <option key={d} value={d}>{d} CIVICT</option>)}
                </select>
              </label>
              <label className="text-xs text-muted space-y-1 block">
                Quantity (max 500)
                <input className={field} type="number" min={1} max={500} value={qty} onChange={e => setQty(e.target.value)} />
              </label>
              <Button type="submit" disabled={busy || cost <= 0 || cost > summary.voucher_remaining}>Generate</Button>
            </form>
            <p className={`text-xs ${cost > summary.voucher_remaining ? 'text-red-600' : 'text-muted dark:text-[#c0d0c4]'}`}>
              This batch: ₡ {cost.toLocaleString()} of ₡ {summary.voucher_remaining.toLocaleString()} remaining
              {cost > summary.voucher_remaining && ' (exceeds your funded CIVICT)'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            {(['unused', 'redeemed', 'all'] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
            ))}
          </div>
          <Button size="sm" variant="outline" disabled={shown.length === 0}
            onClick={() => copy(shown.map(v => `${v.code} (${v.denomination})`).join('\n'))}>
            Copy {shown.length} listed
          </Button>
        </div>
        <div className="space-y-2">
          {shown.length === 0 && <p className="text-sm text-muted py-6 text-center">No vouchers here yet.</p>}
          {shown.map(v => (
            <Card key={v.id} className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-ink dark:text-white tracking-wider">{v.code}</p>
                  <p className="text-xs text-muted">₡ {v.denomination} · {new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={v.status === 'unused' ? 'default' : 'secondary'}>{v.status}</Badge>
                  {v.status === 'unused' && <Button size="sm" variant="outline" onClick={() => copy(v.code)}>Copy</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
