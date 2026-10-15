'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Seller = {
  state: string; name: string | null; phone: string | null
  bank_name: string; account_number: string; account_name: string
}

const field = 'h-11 w-full rounded-lg border border-mint-line bg-white px-3 text-sm text-ink outline-none focus:border-gold'

function whatsapp(phone: string) {
  const d = phone.replace(/\D/g, '')
  return `https://wa.me/${d.startsWith('0') ? '234' + d.slice(1) : d}`
}

export function BuyVoucher() {
  const [states, setStates] = useState<string[] | null>(null)
  const [prices, setPrices] = useState<{ denomination: number; end_user_price: number }[]>([])
  const [state, setState] = useState('')
  const [seller, setSeller] = useState<Seller | null | undefined>(undefined)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/vouchers/sellers').then(r => r.json()).then(d => setStates(d.states ?? [])).catch(() => setStates([]))
    fetch('/api/vouchers/pricing').then(r => r.json()).then(d => setPrices(d.pricing ?? [])).catch(() => {})
  }, [])

  async function pick(s: string) {
    setState(s)
    setSeller(undefined)
    if (!s) return
    const d = await fetch(`/api/vouchers/sellers?state=${encodeURIComponent(s)}`).then(r => r.json()).catch(() => ({}))
    setSeller(d.seller ?? null)
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  if (states === null) return <p className="text-sm text-muted text-center">Loading...</p>

  return (
    <div className="space-y-4">
      {prices.length > 0 && (
        <div className="bg-white border border-mint-line rounded-xl p-4">
          <p className="text-xs font-medium text-muted mb-2">Voucher prices</p>
          <div className="grid grid-cols-2 gap-2">
            {prices.map(p => (
              <div key={p.denomination} className="rounded-lg bg-mint/50 px-3 py-2 text-sm">
                <span className="font-bold text-ink">{p.denomination} CIVICT</span>
                <span className="block text-muted">₦{p.end_user_price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-mint-line rounded-xl p-4 space-y-3">
        <label className="block text-xs font-medium text-muted space-y-1">
          Your state
          <select className={field} value={state} onChange={e => pick(e.target.value)}>
            <option value="">Select your state</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        {states.length === 0 && <p className="text-sm text-muted">No distributors are available yet. Please check back soon.</p>}

        {state && seller === undefined && <p className="text-sm text-muted">Loading...</p>}
        {state && seller === null && <p className="text-sm text-muted">No distributor available in {state} yet.</p>}

        {seller && (
          <div className="space-y-3">
            <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 space-y-1">
              <p className="text-xs text-muted">Pay to</p>
              <p className="font-bold text-ink">{seller.account_name}</p>
              <p className="text-sm text-ink">{seller.bank_name}</p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="font-mono text-xl font-black tracking-wider text-ink">{seller.account_number}</p>
                <Button size="sm" variant="outline" onClick={() => copy(seller.account_number)}>{copied ? 'Copied' : 'Copy'}</Button>
              </div>
            </div>
            {seller.phone && (
              <div className="flex gap-2">
                <a href={`tel:${seller.phone}`} className="flex-1 text-center border border-forest text-forest font-semibold py-2.5 rounded-lg text-sm">Call</a>
                <a href={whatsapp(seller.phone)} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center bg-gold text-ink font-semibold py-2.5 rounded-lg text-sm">WhatsApp</a>
              </div>
            )}
            <ol className="text-xs text-muted list-decimal pl-4 space-y-1">
              <li>Transfer the price of the voucher you want to the account above.</li>
              <li>Send your payment proof to the distributor on call or WhatsApp.</li>
              <li>They send you your voucher code. Then <Link href="/redeem-voucher" className="underline text-ink">redeem it here</Link>.</li>
            </ol>
            <p className="text-[11px] text-red-600">Only pay the account shown on this page, and check the account name matches. DICO will never ask you to pay anywhere else.</p>
          </div>
        )}
      </div>
    </div>
  )
}
