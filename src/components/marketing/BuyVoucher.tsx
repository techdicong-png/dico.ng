'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type PayTo = { bank_name: string; account_number: string; account_name: string; phone: string | null }
type Order = { ref: string; status: string; denomination: number; amount: number; expires_at: string; code: string | null; pay_to: PayTo }

const KEY = 'dico_voucher_order'
const field = 'h-11 w-full rounded-lg border border-mint-line bg-white px-3 text-sm text-ink outline-none focus:border-gold'
const naira = (n: number) => '₦' + n.toLocaleString()
const fmt = (c: string) => /^[A-Z]{2}[A-Z0-9]{12}$/.test(c) ? `${c.slice(0, 2)}-${c.slice(2, 6)}-${c.slice(6, 10)}-${c.slice(10)}` : c
const whatsapp = (p: string) => { const d = p.replace(/\D/g, ''); return `https://wa.me/${d.startsWith('0') ? '234' + d.slice(1) : d}` }

function store(ref: string, token: string) { try { localStorage.setItem(KEY, JSON.stringify({ ref, token })) } catch {} }
function stored(): { ref: string; token: string } | null { try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null } }
function forget() { try { localStorage.removeItem(KEY) } catch {} }

export function BuyVoucher() {
  const [states, setStates] = useState<string[] | null>(null)
  const [prices, setPrices] = useState<{ denomination: number; end_user_price: number }[]>([])
  const [state, setState] = useState('')
  const [denom, setDenom] = useState<number | null>(null)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState('')
  const [left, setLeft] = useState(0)

  const refresh = useCallback(async (ref: string, t: string) => {
    const res = await fetch(`/api/voucher-orders/${ref}?t=${encodeURIComponent(t)}`)
    if (res.status === 404) { forget(); setOrder(null); return }
    if (res.ok) setOrder(await res.json())
  }, [])

  useEffect(() => {
    fetch('/api/vouchers/sellers').then(r => r.json()).then(d => setStates(d.states ?? [])).catch(() => setStates([]))
    fetch('/api/vouchers/pricing').then(r => r.json()).then(d => setPrices(d.pricing ?? [])).catch(() => {})
    const s = stored()
    if (s) { setToken(s.token); refresh(s.ref, s.token) }
  }, [refresh])

  // keep an open order up to date (the distributor confirms on their side)
  useEffect(() => {
    if (!order || !token || !['pending', 'awaiting_confirmation'].includes(order.status)) return
    const id = setInterval(() => refresh(order.ref, token), 8000)
    return () => clearInterval(id)
  }, [order, token, refresh])

  useEffect(() => {
    if (!order || order.status !== 'pending') return
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(order.expires_at).getTime() - Date.now()) / 1000)))
    tick(); const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [order])

  function copy(text: string, what: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(what); setTimeout(() => setCopied(''), 1500) })
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!state || !denom) return setError('Choose your state and a voucher')
    setBusy(true)
    try {
      const res = await fetch('/api/voucher-orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, denomination: denom, phone, name: name || undefined }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not start your order')
      store(d.ref, d.token); setToken(d.token); setOrder(d)
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  async function act(action: 'claim' | 'cancel') {
    if (!order) return
    setBusy(true); setError('')
    try {
      const res = await fetch(`/api/voucher-orders/${order.ref}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Something went wrong')
      setOrder(d)
      if (action === 'cancel') { forget(); setOrder(null) }
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }

  const startOver = () => { forget(); setOrder(null); setToken(''); setError('') }

  if (states === null) return <p className="text-sm text-muted text-center">Loading...</p>

  // ------- an order is in progress -------
  if (order) {
    const p = order.pay_to
    const contact = p.phone && (
      <div className="flex gap-2">
        <a href={`tel:${p.phone}`} className="flex-1 text-center border border-forest text-forest font-semibold py-2.5 rounded-lg text-sm">Call distributor</a>
        <a href={whatsapp(p.phone)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-gold text-ink font-semibold py-2.5 rounded-lg text-sm">WhatsApp</a>
      </div>
    )
    const shell = (children: React.ReactNode) => (
      <div className="bg-white border border-mint-line rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-muted"><span>Order <b className="text-ink">{order.ref}</b></span><span>{order.denomination} CIVICT · {naira(order.amount)}</span></div>
        {children}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )

    if (order.status === 'paid' && order.code) return shell(
      <>
        <div className="text-center space-y-2">
          <p className="text-3xl">🎉</p>
          <h2 className="font-serif text-xl font-black text-ink">Payment confirmed</h2>
          <p className="text-sm text-muted">Your voucher code:</p>
          <p className="font-mono text-2xl font-black tracking-wider text-ink bg-gold/10 border border-gold/40 rounded-lg py-3">{fmt(order.code)}</p>
          <Button variant="outline" onClick={() => copy(fmt(order.code!), 'code')}>{copied === 'code' ? 'Copied' : 'Copy code'}</Button>
        </div>
        <p className="text-xs text-muted">Save this code. It works once and cannot be issued again.</p>
        <Link href="/redeem-voucher" className="block text-center bg-forest text-white font-semibold py-2.5 rounded-lg text-sm">Redeem it now</Link>
        <button onClick={startOver} className="block mx-auto text-xs underline text-muted">Done</button>
      </>
    )

    if (order.status === 'pending') return shell(
      <>
        <div className="space-y-1 text-center">
          <p className="text-xs text-muted">Pay exactly</p>
          <p className="text-3xl font-black text-ink">{naira(order.amount)}</p>
          <p className="text-xs text-muted">Your code is held for {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</p>
        </div>
        <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 space-y-1">
          <p className="text-xs text-muted">Pay to</p>
          <p className="font-bold text-ink">{p.account_name}</p>
          <p className="text-sm text-ink">{p.bank_name}</p>
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="font-mono text-xl font-black tracking-wider text-ink">{p.account_number}</p>
            <Button size="sm" variant="outline" onClick={() => copy(p.account_number, 'acct')}>{copied === 'acct' ? 'Copied' : 'Copy'}</Button>
          </div>
        </div>
        <p className="text-xs text-muted">If your bank has a narration or remark box, write <b className="text-ink">{order.ref}</b> in it.</p>
        <Button className="w-full h-11" disabled={busy} onClick={() => act('claim')}>I have paid</Button>
        {contact}
        <button onClick={() => act('cancel')} disabled={busy} className="block mx-auto text-xs underline text-muted">Cancel this order</button>
        <p className="text-[11px] text-red-600">Only pay the account shown here, and check the name matches. Do not tap &quot;I have paid&quot; before you have sent the money.</p>
      </>
    )

    if (order.status === 'awaiting_confirmation') return shell(
      <>
        <div className="text-center space-y-2">
          <p className="text-3xl">⏳</p>
          <h2 className="font-serif text-xl font-black text-ink">Waiting for confirmation</h2>
          <p className="text-sm text-muted">The distributor will confirm your payment, then your code appears here. This page updates by itself, and you can close it and come back.</p>
        </div>
        {contact}
        <p className="text-xs text-muted text-center">If you contact them, quote <b className="text-ink">{order.ref}</b>.</p>
      </>
    )

    const msg: Record<string, string> = {
      expired: 'This order expired before it was paid. If you have already paid, contact the distributor and quote your order number.',
      rejected: 'The distributor could not find your payment. Contact them with your order number if you believe this is a mistake.',
      cancelled: 'This order was cancelled.',
    }
    return shell(
      <>
        <p className="text-sm text-ink text-center">{msg[order.status] ?? 'This order is no longer active.'}</p>
        {contact}
        <Button className="w-full h-11" onClick={startOver}>Start a new order</Button>
      </>
    )
  }

  // ------- new order form -------
  return (
    <form onSubmit={create} className="bg-white border border-mint-line rounded-xl p-5 space-y-4">
      <label className="block text-xs font-medium text-muted space-y-1">
        Your state
        <select className={field} value={state} onChange={e => setState(e.target.value)}>
          <option value="">Select your state</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      {states.length === 0 && <p className="text-sm text-muted">No distributors are available yet. Please check back soon.</p>}

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted">Voucher</p>
        <div className="grid grid-cols-2 gap-2">
          {prices.map(p => (
            <button type="button" key={p.denomination} onClick={() => setDenom(p.denomination)}
              className={`rounded-lg border px-3 py-2 text-left text-sm ${denom === p.denomination ? 'border-forest bg-forest/10' : 'border-mint-line bg-mint/50'}`}>
              <span className="font-bold text-ink">{p.denomination} CIVICT</span>
              <span className="block text-muted">{naira(p.end_user_price)}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="block text-xs font-medium text-muted space-y-1">
        Phone number
        <input className={field} inputMode="tel" placeholder="08012345678" value={phone} onChange={e => setPhone(e.target.value)} />
      </label>
      <label className="block text-xs font-medium text-muted space-y-1">
        Name (optional)
        <input className={field} value={name} onChange={e => setName(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full h-11" disabled={busy || !state || !denom || phone.replace(/\D/g, '').length < 10}>
        {busy ? 'Please wait...' : 'Continue to payment'}
      </Button>
      <p className="text-[11px] text-muted">You will see the distributor&apos;s account and the exact amount next. Your code appears here after they confirm your payment.</p>
    </form>
  )
}
