'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Account = { bank_name: string; account_number: string; account_name: string }
type Bank = { name: string; code: string }

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'

export function DicoBankAccount({ initial }: { initial: Account | null }) {
  const [account, setAccount] = useState<Account | null>(initial)
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankCode, setBankCode] = useState('')
  const [number, setNumber] = useState('')
  const [editing, setEditing] = useState(!initial)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/redeem/banks').then(r => r.json()).then(d => setBanks(d.banks || [])).catch(() => {})
  }, [])

  async function save() {
    const bank = banks.find(b => b.code === bankCode)
    if (!bank || !/^\d{10}$/.test(number)) return toast.error('Choose a bank and enter a 10-digit account number')
    setBusy(true)
    const t = toast.loading('Verifying account...')
    try {
      const res = await fetch('/api/admin/bank-account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode: bank.code, bankName: bank.name, accountNumber: number }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setAccount(data.account)
      setEditing(false)
      setNumber('')
      toast.success(`Saved: ${data.account.account_name}`, { id: t })
    } catch (err: any) {
      toast.error(err.message, { id: t })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-gold dark:bg-[#11241b] dark:border-[#1f3a2c]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-ink dark:text-white">DICO payment account</h2>
          {account && !editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Change</Button>}
        </div>
        <p className="text-xs text-muted dark:text-[#c0d0c4]">
          Distributors see this account on their Vouchers page and pay it for their VGI and voucher credit.
        </p>
        {account && !editing && (
          <p className="text-sm text-ink dark:text-white">
            <b>{account.account_name}</b><br />
            {account.bank_name} · <span className="font-mono">{account.account_number}</span>
          </p>
        )}
        {!account && !editing && <p className="text-sm text-red-600">Not set yet.</p>}
        {editing && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <select className={field} value={bankCode} onChange={e => setBankCode(e.target.value)}>
              <option value="">Select bank</option>
              {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            <input className={field} inputMode="numeric" maxLength={10} placeholder="10-digit account number"
              value={number} onChange={e => setNumber(e.target.value.replace(/\D/g, ''))} />
            <div className="flex gap-2">
              <Button disabled={busy} onClick={save}>Verify &amp; save</Button>
              {account && <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
