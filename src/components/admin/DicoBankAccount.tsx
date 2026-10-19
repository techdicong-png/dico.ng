'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Account = { bank_name: string; account_number: string; account_name: string; verified_manually?: boolean }
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
  const [manual, setManual] = useState(false)
  const [manualName, setManualName] = useState('')

  useEffect(() => {
    fetch('/api/redeem/banks').then(r => r.json()).then(d => setBanks(d.banks || [])).catch(() => {})
  }, [])

  async function save() {
    const bank = banks.find(b => b.code === bankCode)
    if (!bank || !/^\d{10}$/.test(number)) return toast.error('Choose a bank and enter a 10-digit account number')
    if (manual && manualName.trim().length < 3) return toast.error('Enter the account name exactly as the bank shows it')
    setBusy(true)
    const t = toast.loading(manual ? 'Saving account...' : 'Verifying account...')
    try {
      const res = await fetch('/api/admin/bank-account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode: bank.code, bankName: bank.name, accountNumber: number, skipVerify: manual, accountName: manual ? manualName.trim() : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setAccount(data.account)
      setEditing(false)
      setNumber('')
      setManual(false)
      setManualName('')
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
            {account.verified_manually && <><br /><span className="text-xs text-muted">Name entered by hand, not checked with the bank</span></>}
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
            <label className="md:col-span-3 flex items-center gap-2 text-xs text-muted dark:text-[#c0d0c4]">
              <input type="checkbox" checked={manual} onChange={e => setManual(e.target.checked)} />
              Enter the account name myself (use only if the bank check fails)
            </label>
            {manual && <input className={`${field} md:col-span-3`} placeholder="Account name exactly as the bank shows it" value={manualName} onChange={e => setManualName(e.target.value)} />}
            <div className="flex gap-2">
              <Button disabled={busy} onClick={save}>{manual ? 'Save account' : 'Verify & save'}</Button>
              {account && <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
