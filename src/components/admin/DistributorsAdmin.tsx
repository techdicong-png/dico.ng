'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Distributor = {
  id: string
  level: string
  state: string
  lga: string | null
  vgi_active: boolean
  voucher_credit: number
  sms_units: number
  balance_naira: number
  bank_name: string | null
  account_number: string | null
  account_name: string | null
  bank_verified_at: string | null
  users: { full_name: string; email: string; phone: string | null } | null
}

type Bank = { name: string; code: string }

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'

export function DistributorsAdmin({ initialData, states }: { initialData: Distributor[]; states: string[] }) {
  const [list, setList] = useState<Distributor[]>(initialData)
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [busy, setBusy] = useState(false)
  const [topUp, setTopUp] = useState<Record<string, string>>({})
  const [banks, setBanks] = useState<Bank[]>([])
  const [payAmt, setPayAmt] = useState<Record<string, string>>({})
  const [payKind, setPayKind] = useState<Record<string, string>>({})
  const [bulk, setBulk] = useState('')
  const [bulkResult, setBulkResult] = useState<string[]>([])
  const [bankSel, setBankSel] = useState<Record<string, string>>({})
  const [acct, setAcct] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/redeem/banks').then(r => r.json()).then(d => setBanks(d.banks || [])).catch(() => {})
  }, [])

  async function recordPayment(d: Distributor) {
    const amount = parseInt(payAmt[d.id] || '', 10)
    if (!amount || amount <= 0) return toast.error('Enter the amount paid in naira')
    const kind = payKind[d.id] || 'voucher_credit'
    if (!confirm(`Record ₦${amount.toLocaleString()} (${kind === 'vgi_fee' ? 'VGI fee' : 'voucher credit'}) for ${d.users?.full_name}? Only do this after the money is in the DICO bank account.`)) return
    const done = await call(`/api/admin/distributors/${d.id}/payment`, { kind, amount }, 'Payment recorded')
    if (done) setPayAmt(prev => ({ ...prev, [d.id]: '' }))
  }

  async function bulkRegister() {
    const lines = bulk.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return toast.error('Paste one "email, state" per line')
    setBusy(true)
    const out: string[] = []
    for (const line of lines) {
      const [emailRaw, stateRaw] = line.split(/[,\t]/).map(x => x?.trim())
      const match = states.find(s => s.toLowerCase() === (stateRaw || '').toLowerCase())
      if (!emailRaw || !match) { out.push(`SKIPPED  ${line}  (need: email, valid state)`); continue }
      const res = await fetch('/api/admin/distributors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRaw, state: match, level: 'sole' }),
      })
      const data = await res.json().catch(() => ({}))
      out.push(res.ok ? `OK       ${emailRaw}  ${match}` : `FAILED   ${emailRaw}  ${match}: ${data.error || 'error'}`)
    }
    setBulkResult(out)
    await reload()
    setBusy(false)
  }

  async function saveBank(d: Distributor) {
    const code = bankSel[d.id]
    const bank = banks.find(b => b.code === code)
    if (!bank || !/^\d{10}$/.test(acct[d.id] || '')) return toast.error('Choose a bank and enter a 10-digit account number')
    const done = await call(`/api/admin/distributors/${d.id}/bank`, { bankCode: bank.code, bankName: bank.name, accountNumber: acct[d.id] }, 'Bank account verified and saved')
    if (done) setAcct(prev => ({ ...prev, [d.id]: '' }))
  }

  const covered = new Set(list.filter(d => d.level === 'sole').map(d => d.state))

  async function reload() {
    const res = await fetch('/api/admin/distributors')
    if (res.ok) setList((await res.json()).distributors)
  }

  async function call(url: string, body: object, ok: string) {
    setBusy(true)
    const t = toast.loading('Working...')
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      toast.success(ok, { id: t })
      await reload()
      return true
    } catch (err: any) {
      toast.error(err.message, { id: t })
      return false
    } finally {
      setBusy(false)
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !state) return toast.error('Enter the user email and choose a state')
    const done = await call('/api/admin/distributors', { email, state, level: 'sole' }, 'Sole Distributor registered')
    if (done) { setEmail(''); setState('') }
  }

  async function activate(d: Distributor) {
    if (!confirm(`Activate VGI for ${d.users?.full_name} (${d.state})?\nThis sets 100,000 CIVICT voucher credit and allocates 1,000 SMS units.`)) return
    await call(`/api/admin/distributors/${d.id}/activate`, {}, 'VGI activated')
  }

  async function addCredit(d: Distributor) {
    const amount = parseInt(topUp[d.id] || '', 10)
    if (!amount || amount <= 0) return toast.error('Enter a valid CIVICT amount')
    const done = await call(`/api/admin/distributors/${d.id}/credit`, { amount }, `Added ${amount} CIVICT credit`)
    if (done) setTopUp(prev => ({ ...prev, [d.id]: '' }))
  }

  return (
    <div className="space-y-6">
      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink dark:text-white">Register Sole Distributor</h2>
            <span className="text-xs text-muted dark:text-[#c0d0c4]">
              {covered.size} of {states.length} states covered
            </span>
          </div>
          <form onSubmit={register} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <input className={field} type="email" placeholder="User's registered email" value={email}
              onChange={e => setEmail(e.target.value)} />
            <select className={field} value={state} onChange={e => setState(e.target.value)}>
              <option value="">Select state</option>
              {states.map(s => (
                <option key={s} value={s} disabled={covered.has(s)}>{s}{covered.has(s) ? ' (assigned)' : ''}</option>
              ))}
            </select>
            <Button type="submit" disabled={busy}>Register</Button>
          </form>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">The person must already have a DICO account.</p>
        </CardContent>
      </Card>

      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardContent className="p-4 space-y-3">
          <h2 className="font-bold text-ink dark:text-white">Register many distributors at once</h2>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">One per line: <code>email, state</code>. Each person must already have a DICO account.</p>
          <textarea className={`${field} h-28 py-2 font-mono`} placeholder={'name@example.com, Lagos\nother@example.com, Kano'} value={bulk} onChange={e => setBulk(e.target.value)} />
          <Button variant="outline" disabled={busy} onClick={bulkRegister}>Register all</Button>
          {bulkResult.length > 0 && <pre className="text-xs whitespace-pre-wrap text-ink dark:text-white">{bulkResult.join('\n')}</pre>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.length === 0 && (
          <Card className="col-span-full dark:bg-[#11241b] dark:border-[#1f3a2c]">
            <CardContent className="py-12 text-center text-muted dark:text-[#c0d0c4]">No distributors yet.</CardContent>
          </Card>
        )}
        {list.map(d => (
          <Card key={d.id} className={`${d.vgi_active ? '' : 'border-gold'} dark:bg-[#11241b] dark:border-[#1f3a2c]`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-ink dark:text-white truncate">{d.users?.full_name || 'Unknown user'}</p>
                  <p className="text-xs text-muted dark:text-[#c0d0c4] truncate">{d.users?.email}</p>
                </div>
                <Badge variant={d.vgi_active ? 'default' : 'secondary'}>{d.vgi_active ? 'VGI active' : 'Awaiting payment'}</Badge>
              </div>
              <p className="text-sm text-ink dark:text-white">{d.state} · <span className="capitalize">{d.level}</span> Distributor</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Balance</p>
                  <p className="font-bold text-ink dark:text-white">₦ {(d.balance_naira ?? 0).toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Voucher cap</p>
                  <p className="font-bold text-ink dark:text-white">₡ {d.voucher_credit.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted">SMS units</p>
                  <p className="font-bold text-ink dark:text-white">{d.sms_units.toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border dark:border-[#1f3a2c] p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-muted">Payment account (shown to buyers)</p>
                {d.bank_verified_at ? (
                  <p className="text-sm text-ink dark:text-white">{d.account_name}<br /><span className="text-xs text-muted">{d.bank_name} · {d.account_number}</span></p>
                ) : (
                  <p className="text-xs text-red-600">Not set. Buyers cannot see this distributor until it is.</p>
                )}
                <select className={field} value={bankSel[d.id] || ''} onChange={e => setBankSel(prev => ({ ...prev, [d.id]: e.target.value }))}>
                  <option value="">{d.bank_verified_at ? 'Change bank' : 'Select bank'}</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input className={field} inputMode="numeric" maxLength={10} placeholder="10-digit account number" value={acct[d.id] || ''} onChange={e => setAcct(prev => ({ ...prev, [d.id]: e.target.value.replace(/\D/g, '') }))} />
                  <Button variant="outline" disabled={busy} onClick={() => saveBank(d)}>Verify &amp; save</Button>
                </div>
              </div>
              {!d.vgi_active ? (
                <Button className="w-full" disabled={busy} onClick={() => activate(d)}>Activate VGI</Button>
              ) : (
                <div className="flex gap-2">
                  <input className={field} type="number" min={1} placeholder="Raise CIVICT cap"
                    value={topUp[d.id] || ''} onChange={e => setTopUp(prev => ({ ...prev, [d.id]: e.target.value }))} />
                  <Button variant="outline" disabled={busy} onClick={() => addCredit(d)}>Fund</Button>
                </div>
              )}
              {d.vgi_active && (
                <div className="rounded-lg border border-border dark:border-[#1f3a2c] p-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Record payment received (₦)</p>
                  <div className="flex gap-2">
                    <input className={field} type="number" min={1} placeholder="Amount paid" value={payAmt[d.id] || ''} onChange={e => setPayAmt(prev => ({ ...prev, [d.id]: e.target.value }))} />
                    <select className={`${field} w-32`} value={payKind[d.id] || 'voucher_credit'} onChange={e => setPayKind(prev => ({ ...prev, [d.id]: e.target.value }))}>
                      <option value="voucher_credit">Voucher credit</option>
                      <option value="vgi_fee">VGI fee</option>
                    </select>
                    <Button variant="outline" disabled={busy} onClick={() => recordPayment(d)}>Record</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
