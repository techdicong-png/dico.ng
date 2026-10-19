'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Summary = {
  level: string; state: string; vgi_active: boolean
  voucher_credit: number; voucher_used: number; voucher_remaining: number; sms_units: number
  balance_naira: number
}
type Order = { id: string; ref: string; denomination: number; amount_naira: number; buyer_phone: string; buyer_name: string | null; status: string; created_at: string; expires_at: string; paid_claimed_at: string | null; confirmed_at: string | null }
type Voucher = { id: string; code: string | null; denomination: number; status: string; created_at: string; redeemed_at: string | null }

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'

// ED K7QM 2XTP 9WCD -> ED-K7QM-2XTP-9WCD (older codes are shown as they are)
const fmt = (c: string) => /^[A-Z]{2}[A-Z0-9]{12}$/.test(c) ? `${c.slice(0, 2)}-${c.slice(2, 6)}-${c.slice(6, 10)}-${c.slice(10)}` : c

export function VoucherManager() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [denoms, setDenoms] = useState<number[]>([])
  const [prices, setPrices] = useState<Record<number, number>>({})
  const [dico, setDico] = useState<{ bank_name: string; account_number: string; account_name: string } | null>(null)
  const [denom, setDenom] = useState('')
  const [qty, setQty] = useState('1')
  const [orders, setOrders] = useState<{ open: Order[]; paid: Order[] }>({ open: [], paid: [] })
  const [filter, setFilter] = useState<'all' | 'unused' | 'redeemed'>('unused')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const [v, p] = await Promise.all([fetch('/api/vouchers'), fetch('/api/vouchers/pricing')])
    if (v.ok) {
      const d = await v.json()
      setSummary(d.distributor)
      setDico(d.dico_account ?? null)
      setPrices(Object.fromEntries((d.prices ?? []).map((x: any) => [x.denomination, x.distributor_price])))
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

  const loadOrders = useCallback(async () => {
    const res = await fetch('/api/vouchers/orders')
    if (res.ok) setOrders(await res.json())
  }, [])
  useEffect(() => { loadOrders(); const id = setInterval(loadOrders, 15000); return () => clearInterval(id) }, [loadOrders])

  async function actOnOrder(o: Order, action: 'confirm' | 'reject') {
    const q = action === 'confirm'
      ? `Confirm ${o.ref}?\n\nOnly do this after ₦${o.amount_naira.toLocaleString()} has reached your bank account. The buyer will then receive their code.`
      : `Reject ${o.ref}? Use this if no payment arrived. The code goes back into your stock.`
    if (!confirm(q)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/vouchers/orders/${o.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      toast.success(action === 'confirm' ? 'Payment confirmed. The buyer can now see their code.' : 'Order rejected')
      await Promise.all([loadOrders(), load()])
    } catch (err: any) { toast.error(err.message) } finally { setBusy(false) }
  }

  const cost = (parseInt(denom, 10) || 0) * (parseInt(qty, 10) || 0)
  const costNaira = (prices[parseInt(denom, 10)] || 0) * (parseInt(qty, 10) || 0)

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ['Balance to spend', `₦ ${summary.balance_naira.toLocaleString()}`],
          ['Voucher cap', `₡ ${summary.voucher_credit.toLocaleString()}`],
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

      <Card className="border-gold dark:bg-[#11241b]">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-bold text-ink dark:text-white">Pay DICO to top up your balance</h2>
          {dico ? (
            <>
              <p className="text-sm text-ink dark:text-white">{dico.account_name} · {dico.bank_name}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xl font-black tracking-wider text-ink dark:text-white">{dico.account_number}</p>
                <Button size="sm" variant="outline" onClick={() => copy(dico.account_number)}>Copy</Button>
              </div>
              <p className="text-xs text-muted dark:text-[#c0d0c4]">After you pay, send your payment proof to DICO. Your balance is updated once the payment is confirmed.</p>
            </>
          ) : (
            <p className="text-sm text-muted dark:text-[#c0d0c4]">DICO&apos;s payment account has not been set yet. Please contact DICO admin.</p>
          )}
        </CardContent>
      </Card>

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
              <Button type="submit" disabled={busy || cost <= 0 || cost > summary.voucher_remaining || costNaira > summary.balance_naira}>Generate</Button>
            </form>
            <p className={`text-xs ${costNaira > summary.balance_naira ? 'text-red-600' : 'text-muted dark:text-[#c0d0c4]'}`}>
              You pay DICO: ₦ {costNaira.toLocaleString()} from your balance of ₦ {summary.balance_naira.toLocaleString()}
              {costNaira > summary.balance_naira && ' (not enough, pay DICO to top up)'}
            </p>
            <p className={`text-xs ${cost > summary.voucher_remaining ? 'text-red-600' : 'text-muted dark:text-[#c0d0c4]'}`}>
              This batch: ₡ {cost.toLocaleString()} of ₡ {summary.voucher_remaining.toLocaleString()} remaining
              {cost > summary.voucher_remaining && ' (exceeds your funded CIVICT)'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-ink dark:text-white">Orders from buyers</h2>
            <span className="text-xs text-muted">{orders.open.filter(o => o.status === 'awaiting_confirmation').length} waiting for you</span>
          </div>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">Buyers pay your bank account. When the money is in, confirm the order and they receive their code.</p>
          {orders.open.length === 0 && <p className="text-sm text-muted py-2">No open orders.</p>}
          {orders.open.map(o => (
            <div key={o.id} className={`rounded-lg border p-3 space-y-2 ${o.status === 'awaiting_confirmation' ? 'border-gold bg-gold/5' : 'border-border dark:border-[#1f3a2c]'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-white">{o.denomination} CIVICT · ₦{o.amount_naira.toLocaleString()}</p>
                  <p className="text-xs text-muted">{o.ref} · {new Date(o.created_at).toLocaleString()}</p>
                  <p className="text-xs text-ink dark:text-white">{o.buyer_name ? `${o.buyer_name} · ` : ''}<a href={`tel:${o.buyer_phone}`} className="underline">{o.buyer_phone}</a></p>
                </div>
                <Badge variant={o.status === 'awaiting_confirmation' ? 'default' : 'secondary'}>{o.status === 'awaiting_confirmation' ? 'Says paid' : o.status === 'pending' ? 'Not paid yet' : 'Expired'}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={busy} onClick={() => actOnOrder(o, 'confirm')}>Confirm payment</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => actOnOrder(o, 'reject')}>Reject</Button>
              </div>
            </div>
          ))}
          {orders.paid.length > 0 && (
            <details className="text-xs text-muted">
              <summary className="cursor-pointer">Recently confirmed ({orders.paid.length})</summary>
              <ul className="mt-2 space-y-1">{orders.paid.map(o => <li key={o.id}>{o.ref} · {o.denomination} CIVICT · ₦{o.amount_naira.toLocaleString()} · {o.buyer_phone}</li>)}</ul>
            </details>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            {(['unused', 'redeemed', 'all'] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
            ))}
          </div>
          <Button size="sm" variant="outline" disabled={shown.length === 0}
            onClick={() => copy(shown.filter(v => v.code).map(v => `${fmt(v.code!)} (${v.denomination})`).join('\n'))}>
            Copy {shown.length} listed
          </Button>
        </div>
        <div className="space-y-2">
          {shown.length === 0 && <p className="text-sm text-muted py-6 text-center">No vouchers here yet.</p>}
          {shown.map(v => (
            <Card key={v.id} className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-ink dark:text-white tracking-wider">{v.code ? fmt(v.code) : '••••-••••-••••'}</p>
                  <p className="text-xs text-muted">₡ {v.denomination} · {new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={v.status === 'unused' ? 'default' : 'secondary'}>{v.status}</Badge>
                  {v.status === 'unused' && <Button size="sm" variant="outline" onClick={() => v.code && copy(fmt(v.code))}>Copy</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
