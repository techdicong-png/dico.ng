'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const field =
  'h-11 w-full rounded-lg border border-mint-line bg-white px-3 text-sm text-ink outline-none focus:border-gold'

export function RedeemVoucherForm() {
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [redeemed, setRedeemed] = useState<number | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, phone: phone.replace(/\D/g, '') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not redeem voucher')
      setRedeemed(data.denomination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (redeemed !== null) {
    return (
      <div className="bg-white border border-mint-line rounded-xl p-6 text-center space-y-3">
        <p className="text-4xl">🎉</p>
        <h2 className="font-serif text-xl font-black text-ink">Voucher redeemed</h2>
        <p className="text-sm text-muted">Your voucher worth <b className="text-ink">₡ {redeemed} CIVICT</b> has been accepted.</p>
        <Button onClick={() => { setRedeemed(null); setCode(''); setPhone('') }}>Redeem another</Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white border border-mint-line rounded-xl p-6 space-y-4">
      <label className="block text-xs font-medium text-muted space-y-1">
        Voucher code
        <input className={`${field} font-mono tracking-wider uppercase`} value={code}
          onChange={e => setCode(e.target.value)} placeholder="XXXXXXXXXXXXXXXX" autoComplete="off" />
      </label>
      <label className="block text-xs font-medium text-muted space-y-1">
        Phone number
        <input className={field} inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full h-11" disabled={busy || code.trim().length < 8 || phone.length < 10}>
        {busy ? 'Checking...' : 'Redeem voucher'}
      </Button>
    </form>
  )
}
