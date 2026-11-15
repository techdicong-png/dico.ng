'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Plan = { denomination: number; days: number; price: number | null }
type Access = { active: boolean; expires_at: string | null; via: string | null; plans: Plan[] }
type Project = { name: string; state: string; lga: string | null; description?: string | null } | null
type Row = { code: string; title: string; design: string | null; size: string | null; duration_days: number; contract_value: number; payment_days_after_completion: number; slots_left: number; project: Project }
type Detail = {
  contract: { code: string; title: string; design: string | null; size: string | null; duration_days: number; contract_value: number; payment_days_after_completion: number; payment_terms: string | null; project: Project }
  materials: { name: string; unit: string; quantity: number }[]
  merchants: { id: string; name: string; state: string; logistics_fee: number; delivery_percent: number }[]
}
type Quote = {
  lines: { item: string; unit: string; quantity: number; unit_price: number; amount: number }[]
  materials_cost: number; logistics_fee: number; delivery_fee: number; total_cost: number; contract_value: number; expected_profit: number
  completion_days: number; payment_due_days: number; estimated_due_date: string
}
type Order = {
  ref: string; status: string; materials_cost: number; logistics_fee: number; delivery_fee: number; total_cost: number; contract_value: number
  expected_profit: number; completion_days: number; payment_due_days: number; due_date: string | null; created_at: string; expires_at: string
  contract: { code: string; title: string } | null
  pay_to: { name: string; phone: string | null; bank_name: string | null; account_number: string | null; account_name: string | null } | null
}

const field = 'h-11 w-full rounded-lg border border-mint-line bg-white px-3 text-sm text-ink outline-none focus:border-gold'
const card = 'bg-white border border-mint-line rounded-xl p-5'
const naira = (n: number) => (n < 0 ? '-₦' : '₦') + Math.abs(n).toLocaleString()
const fmtDate = (s: string) => new Date(s.length === 10 ? s + 'T00:00:00' : s).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const days = (n: number) => (n === 1 ? '1 day' : `${n} days`)
const STATUS: Record<string, string> = {
  pending_payment: 'Waiting for your payment', awaiting_confirmation: 'Payment being confirmed', paid: 'Paid, materials being arranged',
  supplied: 'Materials supplied', cancelled: 'Cancelled', expired: 'Expired', rejected: 'Payment not found',
}

export function HousingContractor() {
  const [access, setAccess] = useState<Access | null>(null)
  const [code, setCode] = useState(''); const [phone, setPhone] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [tab, setTab] = useState<'contracts' | 'orders'>('contracts')
  const [rows, setRows] = useState<Row[]>([])
  const [lookup, setLookup] = useState('')
  const [detail, setDetail] = useState<Detail | null>(null)
  const [merchant, setMerchant] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const loadAccess = useCallback(() => fetch('/api/housing/access').then(r => r.json()).then(setAccess).catch(() => setAccess({ active: false, expires_at: null, via: null, plans: [] })), [])
  const relock = useCallback(async () => { await loadAccess(); setError('Your Housing access has ended. Redeem a voucher to continue.') }, [loadAccess])

  const loadContracts = useCallback(async () => {
    const res = await fetch('/api/housing/contracts')
    if (res.status === 402) return relock()
    if (res.ok) setRows((await res.json()).contracts)
  }, [relock])
  const loadOrders = useCallback(async () => {
    const res = await fetch('/api/housing/orders')
    if (res.status === 402) return relock()
    if (res.ok) setOrders((await res.json()).orders)
  }, [relock])

  useEffect(() => { loadAccess() }, [loadAccess])
  useEffect(() => { if (access?.active) { loadContracts(); loadOrders() } }, [access?.active, loadContracts, loadOrders])
  useEffect(() => {
    if (!access?.active || !orders.some(o => ['pending_payment', 'awaiting_confirmation', 'paid'].includes(o.status))) return
    const id = setInterval(loadOrders, 20000); return () => clearInterval(id)
  }, [access?.active, orders, loadOrders])

  async function unlock(e: React.FormEvent) {
    e.preventDefault(); setError(''); setUnlocking(true)
    try {
      const res = await fetch('/api/services/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, phone, service: 'housing' }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not unlock')
      setCode(''); await loadAccess()
    } catch (err: any) { setError(err.message) } finally { setUnlocking(false) }
  }

  async function open(c: string) {
    setError(''); setQuote(null); setMerchant(''); setDetail(null)
    const res = await fetch(`/api/housing/contracts/${encodeURIComponent(c.trim())}`)
    const d = await res.json()
    if (res.status === 402) return relock()
    if (!res.ok) return setError(d.error || 'Contract not found')
    setDetail(d)
  }

  async function pickMerchant(id: string) {
    setMerchant(id); setQuote(null); setError('')
    if (!id || !detail) return
    setQuoting(true)
    try {
      const res = await fetch('/api/housing/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: detail.contract.code, merchantId: id }) })
      const d = await res.json()
      if (res.status === 402) return relock()
      if (!res.ok) throw new Error(d.error || 'Could not price this contract')
      setQuote(d.quote)
    } catch (err: any) { setError(err.message) } finally { setQuoting(false) }
  }

  async function proceed() {
    if (!detail || !merchant) return
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/housing/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: detail.contract.code, merchantId: merchant }) })
      const d = await res.json()
      if (res.status === 402) return relock()
      if (!res.ok) throw new Error(d.error || 'Could not place the order')
      setDetail(null); setQuote(null); setTab('orders'); await Promise.all([loadOrders(), loadContracts()])
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  async function act(ref: string, action: 'claim' | 'cancel') {
    setBusy(true); setError('')
    try {
      const res = await fetch(`/api/housing/orders/${ref}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const d = await res.json()
      if (res.status === 402) return relock()
      if (!res.ok) throw new Error(d.error || 'Something went wrong')
      await Promise.all([loadOrders(), loadContracts()])
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  const copy = (t: string, k: string) => navigator.clipboard.writeText(t).then(() => { setCopied(k); setTimeout(() => setCopied(''), 1500) })

  if (access === null) return <p className="text-sm text-muted text-center">Loading...</p>

  if (!access.active) {
    return (
      <form onSubmit={unlock} className="bg-white border border-gold/40 rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-ink">Become a DICO Contractor</h2>
        <p className="text-xs text-muted">A DICO voucher gives you access to the available housing contracts. No account needed.</p>
        {access.plans.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {access.plans.map(p => (
              <div key={p.denomination} className="rounded-lg bg-mint/50 px-3 py-2 text-xs">
                <span className="font-bold text-ink">{p.denomination} CIVICT voucher</span>
                <span className="block text-muted">{days(p.days)} of access{p.price ? ` · ₦${p.price.toLocaleString()}` : ''}</span>
              </div>
            ))}
          </div>
        )}
        <input className={`${field} font-mono tracking-wider uppercase`} placeholder="ED-XXXX-XXXX-XXXX" value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" />
        <input className={field} inputMode="tel" placeholder="Your phone number" value={phone} onChange={e => setPhone(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full h-11" disabled={unlocking || code.trim().length < 8 || phone.replace(/\D/g, '').length < 10}>{unlocking ? 'Checking…' : 'Unlock'}</Button>
        <p className="text-[11px] text-muted">Used a code before? Enter the same code and phone number to open this on another device (up to 3). <Link href="/buy-voucher" className="underline text-ink">Buy a voucher</Link></p>
      </form>
    )
  }

  // ---------------- contract detail + cart ----------------
  if (detail) {
    const c = detail.contract
    return (
      <div className="space-y-4">
        <button onClick={() => { setDetail(null); setQuote(null); setError('') }} className="text-xs underline text-muted">← All contracts</button>
        <div className={`${card} space-y-2`}>
          <p className="text-xs text-muted">{c.code}{c.project ? ` · ${c.project.name}, ${c.project.lga ? c.project.lga + ', ' : ''}${c.project.state}` : ''}</p>
          <h2 className="font-serif text-xl font-black text-ink">{c.title}</h2>
          <p className="text-sm text-ink">{[c.design, c.size].filter(Boolean).join(' · ')}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-mint/50 py-2"><p className="text-muted">Contract value</p><p className="font-bold text-ink">{naira(c.contract_value)}</p></div>
            <div className="rounded-lg bg-mint/50 py-2"><p className="text-muted">Build time</p><p className="font-bold text-ink">{days(c.duration_days)}</p></div>
            <div className="rounded-lg bg-mint/50 py-2"><p className="text-muted">Paid after</p><p className="font-bold text-ink">{days(c.payment_days_after_completion)}</p></div>
          </div>
          {c.payment_terms && <p className="text-xs text-muted">Payment terms: {c.payment_terms}</p>}
        </div>

        <div className={`${card} space-y-2`}>
          <h3 className="font-bold text-ink text-sm">Materials required</h3>
          <div className="overflow-x-auto"><table className="w-full text-sm text-ink">
            <tbody>{detail.materials.map(m => <tr key={m.name} className="border-t border-mint-line"><td className="py-1.5">{m.name}</td><td className="text-right text-muted">{m.quantity.toLocaleString()} {m.unit}</td></tr>)}</tbody>
          </table></div>
        </div>

        <div className={`${card} space-y-3`}>
          <h3 className="font-bold text-ink text-sm">Choose a merchant</h3>
          <select className={field} value={merchant} onChange={e => pickMerchant(e.target.value)}>
            <option value="">Select a merchant…</option>
            {detail.merchants.map(m => <option key={m.id} value={m.id}>{m.name} · {m.state}</option>)}
          </select>
          {detail.merchants.length === 0 && <p className="text-xs text-red-600">No merchants are registered yet.</p>}
          {quoting && <p className="text-sm text-muted">Calculating…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {quote && (
            <div className="space-y-3">
              <div className="overflow-x-auto"><table className="w-full text-xs text-ink">
                <thead><tr className="text-left text-muted"><th className="py-1">Item</th><th>Qty</th><th>Price</th><th className="text-right">Amount</th></tr></thead>
                <tbody>{quote.lines.map(l => <tr key={l.item} className="border-t border-mint-line"><td className="py-1">{l.item}</td><td>{l.quantity.toLocaleString()} {l.unit}</td><td>{naira(l.unit_price)}</td><td className="text-right">{naira(l.amount)}</td></tr>)}</tbody>
              </table></div>
              <div className="text-sm text-ink space-y-1">
                <div className="flex justify-between"><span>Materials</span><span>{naira(quote.materials_cost)}</span></div>
                <div className="flex justify-between"><span>Logistics</span><span>{naira(quote.logistics_fee)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{naira(quote.delivery_fee)}</span></div>
                <div className="flex justify-between font-bold border-t border-mint-line pt-1"><span>Actual cost to you</span><span>{naira(quote.total_cost)}</span></div>
                <div className="flex justify-between"><span>Total contract value</span><span>{naira(quote.contract_value)}</span></div>
                <div className={`flex justify-between font-bold ${quote.expected_profit < 0 ? 'text-red-600' : 'text-forest'}`}><span>Expected gross profit</span><span>{naira(quote.expected_profit)}</span></div>
                <div className="flex justify-between"><span>Estimated payment due date</span><span>{fmtDate(quote.estimated_due_date)}</span></div>
              </div>
              {quote.expected_profit < 0 && <p className="text-xs text-red-600">At this merchant&apos;s prices the cost is more than the contract value. Consider another merchant.</p>}
              <p className="text-[11px] text-muted">
                These figures are estimates under the contract terms, not a guarantee. The due date counts from the day your payment is confirmed: build time plus the payment period.
                Read the full contract before you pay.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1 h-11" disabled={busy} onClick={proceed}>{busy ? 'Please wait…' : 'Proceed to payment'}</Button>
                <Button variant="outline" className="h-11" onClick={() => { setQuote(null); setMerchant('') }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------------- lists ----------------
  const openOrders = orders.filter(o => ['pending_payment', 'awaiting_confirmation'].includes(o.status)).length
  return (
    <div className="space-y-4">
      <p className="text-[11px] text-forest font-semibold text-center">
        {access.via === 'admin' ? 'Admin access (you can browse; ordering needs a voucher)' : `Contractor access until ${new Date(access.expires_at!).toLocaleString()}`}
      </p>
      <div className="flex gap-2 justify-center">
        {(['contracts', 'orders'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError('') }} className={`text-xs font-semibold px-4 py-1.5 rounded-full border ${tab === t ? 'bg-forest text-white border-forest' : 'border-mint-line text-muted bg-white'}`}>
            {t === 'contracts' ? 'Contracts' : `My orders${orders.length ? ` (${orders.length})` : ''}${openOrders ? ' •' : ''}`}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {tab === 'contracts' && (
        <div className="space-y-3">
          <form onSubmit={e => { e.preventDefault(); if (lookup.trim()) open(lookup) }} className="flex gap-2">
            <input className={`${field} font-mono uppercase`} placeholder="Enter a contract code" value={lookup} onChange={e => setLookup(e.target.value.toUpperCase())} />
            <Button type="submit" className="h-11" disabled={!lookup.trim()}>Open</Button>
          </form>
          {rows.length === 0 && <p className="text-sm text-muted text-center py-8">No contracts are open right now. Please check back soon.</p>}
          {rows.map(r => (
            <button key={r.code} onClick={() => open(r.code)} disabled={r.slots_left === 0} className={`${card} w-full text-left space-y-1 ${r.slots_left === 0 ? 'opacity-60' : 'hover:border-gold'}`}>
              <div className="flex items-start justify-between gap-2">
                <div><p className="text-[11px] text-muted">{r.code}{r.project ? ` · ${r.project.state}` : ''}</p><p className="font-semibold text-ink">{r.title}</p></div>
                <p className="font-bold text-ink shrink-0">{naira(r.contract_value)}</p>
              </div>
              <p className="text-xs text-muted">{[r.design, r.size].filter(Boolean).join(' · ')} · {days(r.duration_days)} build · {r.slots_left === 0 ? 'fully taken' : `${r.slots_left} available`}</p>
            </button>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-sm text-muted text-center py-8">You have no orders yet.</p>}
          {orders.map(o => (
            <div key={o.ref} className={`${card} space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <div><p className="text-[11px] text-muted">{o.ref} · {o.contract?.code}</p><p className="font-semibold text-ink">{o.contract?.title}</p></div>
                <span className="text-[11px] font-semibold rounded-full bg-mint px-2 py-1 text-ink shrink-0">{STATUS[o.status] ?? o.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-mint/50 py-2"><p className="text-muted">Cost</p><p className="font-bold text-ink">{naira(o.total_cost)}</p></div>
                <div className="rounded-lg bg-mint/50 py-2"><p className="text-muted">Contract value</p><p className="font-bold text-ink">{naira(o.contract_value)}</p></div>
                <div className="rounded-lg bg-mint/50 py-2"><p className="text-muted">Expected gross profit</p><p className={`font-bold ${o.expected_profit < 0 ? 'text-red-600' : 'text-forest'}`}>{naira(o.expected_profit)}</p></div>
              </div>

              {o.status === 'pending_payment' && o.pay_to && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-gold/40 bg-gold/5 p-3 space-y-1">
                    <p className="text-xs text-muted">Pay {naira(o.total_cost)} to merchant {o.pay_to.name}</p>
                    {o.pay_to.account_number ? (
                      <>
                        <p className="font-bold text-ink text-sm">{o.pay_to.account_name} · {o.pay_to.bank_name}</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono text-lg font-black tracking-wider text-ink">{o.pay_to.account_number}</p>
                          <Button size="sm" variant="outline" onClick={() => copy(o.pay_to!.account_number!, o.ref)}>{copied === o.ref ? 'Copied' : 'Copy'}</Button>
                        </div>
                      </>
                    ) : <p className="text-xs text-red-600">The merchant&apos;s account is not set yet. Contact DICO.</p>}
                    <p className="text-[11px] text-muted">Put {o.ref} in the transfer remark. This order is held until {new Date(o.expires_at).toLocaleString()}.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" disabled={busy} onClick={() => act(o.ref, 'claim')}>I have paid</Button>
                    <Button variant="outline" disabled={busy} onClick={() => act(o.ref, 'cancel')}>Cancel order</Button>
                  </div>
                  <p className="text-[11px] text-red-600">Only tap &quot;I have paid&quot; after you have sent the money.</p>
                </div>
              )}
              {o.status === 'awaiting_confirmation' && <p className="text-sm text-muted">DICO is confirming your payment with the merchant. This page updates by itself.</p>}
              {(o.status === 'paid' || o.status === 'supplied') && (
                <p className="text-sm text-ink">
                  {o.status === 'paid' ? 'Payment confirmed. The merchant will supply the materials through DICO Logistics to your site.' : 'Materials have been supplied to your site.'}
                  {o.due_date && <> Your payment is due on <b>{fmtDate(o.due_date)}</b>.</>}
                </p>
              )}
              {o.status === 'expired' && <p className="text-sm text-muted">This order expired before it was paid. If you did pay, contact DICO with {o.ref}.</p>}
              {o.status === 'rejected' && <p className="text-sm text-muted">The payment could not be found. Contact DICO with {o.ref} if you believe this is a mistake.</p>}
              {o.status === 'cancelled' && <p className="text-sm text-muted">This order was cancelled.</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
