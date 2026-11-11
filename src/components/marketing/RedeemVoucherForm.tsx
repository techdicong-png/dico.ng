'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const field =
  'h-11 w-full rounded-lg border border-mint-line bg-white px-3 text-sm text-ink outline-none focus:border-gold'

export function RedeemVoucherForm() {
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ days: number; expires_at: string; restored: boolean } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/services/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, phone, service: 'spacify' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not redeem voucher')
      setDone({ days: data.days, expires_at: data.expires_at, restored: data.restored })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white border border-mint-line rounded-xl p-6 text-center space-y-3">
        <p className="text-4xl">🎉</p>
        <h2 className="font-serif text-xl font-black text-ink">DICO Spacify unlocked</h2>
        <p className="text-sm text-muted">
          {done.restored ? 'Access is open on this device.' : `Your voucher gives you ${done.days === 1 ? '1 day' : `${done.days} days`} of access.`}
          {' '}It runs until <b className="text-ink">{new Date(done.expires_at).toLocaleString()}</b>.
        </p>
        <Link href="/spacify" className="block bg-forest text-white font-semibold py-2.5 rounded-lg text-sm">Open Spacify</Link>
        <p className="text-[11px] text-muted">Keep your code and phone number. You can use them to open Spacify on another device.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white border border-mint-line rounded-xl p-6 space-y-4">
      <label className="block text-xs font-medium text-muted space-y-1">
        Voucher code
        <input className={`${field} font-mono tracking-wider uppercase`} value={code}
          onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ED-XXXX-XXXX-XXXX" autoComplete="off" />
      </label>
      <label className="block text-xs font-medium text-muted space-y-1">
        Phone number
        <input className={field} inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full h-11" disabled={busy || code.trim().length < 8 || phone.replace(/\D/g, '').length < 10}>
        {busy ? 'Checking...' : 'Redeem voucher'}
      </Button>
      <p className="text-[11px] text-muted">A voucher unlocks DICO services. Right now it opens DICO Spacify. Voucher value is for services and is not cash.</p>
    </form>
  )
}
