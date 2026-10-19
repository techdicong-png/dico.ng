'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { NIGERIA_DATA } from '@/data/nigeria'

type Distributor = {
  id: string
  level: string
  parent_id: string | null
  state: string
  lga: string | null
  ward: string | null
  is_active?: boolean
  vgi_active: boolean
  voucher_credit: number
  sms_units: number
  balance_naira: number
  bank_name: string | null
  account_number: string | null
  account_name: string | null
  bank_verified_at: string | null
  bank_verified_manually?: boolean
  users: { full_name: string; email: string; phone: string | null } | null
}

type Bank = { name: string; code: string }

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'
const box = 'dark:bg-[#11241b] dark:border-[#1f3a2c]'
const active = (d: Distributor) => d.is_active !== false

export function DistributorsAdmin({ initialData, states }: { initialData: Distributor[]; states: string[] }) {
  const [list, setList] = useState<Distributor[]>(initialData)
  const [busy, setBusy] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])

  // register a Sole Distributor
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  // register an LGA or ward distributor
  const [subLevel, setSubLevel] = useState<'major' | 'area'>('major')
  const [subState, setSubState] = useState('')
  const [subLga, setSubLga] = useState('')
  const [subWard, setSubWard] = useState('')
  const [subEmail, setSubEmail] = useState('')
  // bulk
  const [bulk, setBulk] = useState('')
  const [bulkResult, setBulkResult] = useState<string[]>([])
  // per-card inputs
  const [topUp, setTopUp] = useState<Record<string, string>>({})
  const [payAmt, setPayAmt] = useState<Record<string, string>>({})
  const [payKind, setPayKind] = useState<Record<string, string>>({})
  const [bankSel, setBankSel] = useState<Record<string, string>>({})
  const [acct, setAcct] = useState<Record<string, string>>({})
  const [manual, setManual] = useState<Record<string, boolean>>({})
  const [manualName, setManualName] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/redeem/banks').then(r => r.json()).then(d => setBanks(d.banks || [])).catch(() => {})
  }, [])

  const soles = list.filter(d => d.level === 'sole')
  const majors = list.filter(d => d.level === 'major')
  const areas = list.filter(d => d.level === 'area')
  const coveredStates = new Set(soles.filter(active).map(d => d.state))
  const nameOf = (id: string | null) => list.find(d => d.id === id)?.users?.full_name || '—'

  async function reload() {
    const res = await fetch('/api/admin/distributors')
    if (res.ok) setList((await res.json()).distributors)
  }

  async function send(url: string, method: string, body: object | null, ok: string | ((d: any) => string)) {
    setBusy(true)
    const t = toast.loading('Working...')
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      toast.success(typeof ok === 'function' ? ok(data) : ok, { id: t })
      await reload()
      return true
    } catch (err: any) {
      toast.error(err.message, { id: t })
      return false
    } finally {
      setBusy(false)
    }
  }
  const call = (url: string, body: object, ok: string) => send(url, 'POST', body, ok)

  async function registerSole(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !state) return toast.error('Enter the user email and choose a state')
    if (await call('/api/admin/distributors', { email, state, level: 'sole' }, 'Sole Distributor registered')) { setEmail(''); setState('') }
  }

  async function registerSub(e: React.FormEvent) {
    e.preventDefault()
    if (!subEmail || !subState || !subLga || (subLevel === 'area' && !subWard)) return toast.error('Fill in the email, state, LGA' + (subLevel === 'area' ? ' and ward' : ''))
    const done = await call('/api/admin/distributors', { email: subEmail, level: subLevel, state: subState, lga: subLga, ward: subLevel === 'area' ? subWard : undefined },
      subLevel === 'major' ? 'LGA distributor registered' : 'Ward distributor registered')
    if (done) { setSubEmail(''); setSubWard('') }
  }

  async function removeDist(d: Distributor) {
    const where = d.level === 'sole' ? d.state : d.level === 'major' ? `${d.lga}, ${d.state}` : `${d.ward}, ${d.lga}`
    if (!confirm(`Remove ${d.users?.full_name} (${where})?\n\nIf they have no vouchers, payments or sub-distributors they are deleted. Otherwise they are deactivated and kept for the records.`)) return
    await send(`/api/admin/distributors/${d.id}`, 'DELETE', null, r => r.result === 'deleted' ? 'Removed' : `Deactivated (they have ${r.reason} on record)`)
  }

  const restore = (d: Distributor) => send(`/api/admin/distributors/${d.id}`, 'PATCH', {}, 'Restored')

  async function activate(d: Distributor) {
    if (!confirm(`Activate VGI for ${d.users?.full_name} (${d.state})?\nThis sets 100,000 CIVICT voucher credit and allocates 1,000 SMS units.`)) return
    await call(`/api/admin/distributors/${d.id}/activate`, {}, 'VGI activated')
  }

  async function addCredit(d: Distributor) {
    const amount = parseInt(topUp[d.id] || '', 10)
    if (!amount || amount <= 0) return toast.error('Enter a valid CIVICT amount')
    if (await call(`/api/admin/distributors/${d.id}/credit`, { amount }, `Added ${amount} CIVICT credit`)) setTopUp(p => ({ ...p, [d.id]: '' }))
  }

  async function recordPayment(d: Distributor) {
    const amount = parseInt(payAmt[d.id] || '', 10)
    if (!amount || amount <= 0) return toast.error('Enter the amount paid in naira')
    const kind = payKind[d.id] || 'voucher_credit'
    if (!confirm(`Record ₦${amount.toLocaleString()} (${kind === 'vgi_fee' ? 'VGI fee' : 'voucher credit'}) for ${d.users?.full_name}? Only do this after the money is in the DICO bank account.`)) return
    if (await call(`/api/admin/distributors/${d.id}/payment`, { kind, amount }, 'Payment recorded')) setPayAmt(p => ({ ...p, [d.id]: '' }))
  }

  async function saveBank(d: Distributor) {
    const bank = banks.find(b => b.code === bankSel[d.id])
    if (!bank || !/^\d{10}$/.test(acct[d.id] || '')) return toast.error('Choose a bank and enter a 10-digit account number')
    const skip = !!manual[d.id]
    if (skip && (manualName[d.id] || '').trim().length < 3) return toast.error('Enter the account name exactly as the bank shows it')
    const done = await call(`/api/admin/distributors/${d.id}/bank`,
      { bankCode: bank.code, bankName: bank.name, accountNumber: acct[d.id], skipVerify: skip, accountName: skip ? manualName[d.id].trim() : undefined },
      skip ? 'Account saved (name entered by you, not checked with the bank)' : 'Bank account verified and saved')
    if (done) setAcct(p => ({ ...p, [d.id]: '' }))
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

  // choices for the LGA / ward form
  const subStates = [...coveredStates].sort()
  const subLgas = subState ? Object.keys(NIGERIA_DATA[subState] || {}).sort() : []
  const subWards = subState && subLga ? NIGERIA_DATA[subState]?.[subLga] || [] : []
  const takenLga = (l: string) => majors.some(m => active(m) && m.state === subState && m.lga === l)
  const takenWard = (w: string) => areas.some(a => active(a) && a.state === subState && a.lga === subLga && a.ward === w)

  const Header = ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-bold text-ink dark:text-white mt-2">{children}</h2>
  )

  function PersonHeader({ d }: { d: Distributor }) {
    return (
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-ink dark:text-white truncate">{d.users?.full_name || 'Unknown user'}</p>
          <p className="text-xs text-muted dark:text-[#c0d0c4] truncate">{d.users?.email}{d.users?.phone ? ` · ${d.users.phone}` : ''}</p>
        </div>
        {!active(d)
          ? <Badge variant="secondary">Inactive</Badge>
          : d.level === 'sole' && <Badge variant={d.vgi_active ? 'default' : 'secondary'}>{d.vgi_active ? 'VGI active' : 'Awaiting payment'}</Badge>}
      </div>
    )
  }

  function RemoveRow({ d }: { d: Distributor }) {
    return active(d)
      ? <Button size="sm" variant="outline" disabled={busy} onClick={() => removeDist(d)}>Remove</Button>
      : <Button size="sm" variant="outline" disabled={busy} onClick={() => restore(d)}>Restore</Button>
  }

  return (
    <div className="space-y-6">
      <Card className={box}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink dark:text-white">Register State Sole Distributor</h2>
            <span className="text-xs text-muted dark:text-[#c0d0c4]">{coveredStates.size} of {states.length} states covered</span>
          </div>
          <form onSubmit={registerSole} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <input className={field} type="email" placeholder="User's registered email" value={email} onChange={e => setEmail(e.target.value)} />
            <select className={field} value={state} onChange={e => setState(e.target.value)}>
              <option value="">Select state</option>
              {states.map(s => <option key={s} value={s} disabled={coveredStates.has(s)}>{s}{coveredStates.has(s) ? ' (assigned)' : ''}</option>)}
            </select>
            <Button type="submit" disabled={busy}>Register</Button>
          </form>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">The person must already have a DICO account.</p>
        </CardContent>
      </Card>

      <Card className={box}>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-bold text-ink dark:text-white">Register LGA or Ward distributor</h2>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">
            An LGA distributor reports to the state&apos;s Sole Distributor. A ward distributor reports to the LGA distributor, so register the LGA first.
          </p>
          {subStates.length === 0 ? (
            <p className="text-sm text-red-600">Register a State Sole Distributor first.</p>
          ) : (
            <form onSubmit={registerSub} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select className={field} value={subLevel} onChange={e => { setSubLevel(e.target.value as 'major' | 'area'); setSubWard('') }}>
                <option value="major">LGA distributor</option>
                <option value="area">Ward distributor</option>
              </select>
              <select className={field} value={subState} onChange={e => { setSubState(e.target.value); setSubLga(''); setSubWard('') }}>
                <option value="">State</option>
                {subStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className={field} value={subLga} onChange={e => { setSubLga(e.target.value); setSubWard('') }} disabled={!subState}>
                <option value="">LGA</option>
                {subLgas.map(l => {
                  const noParent = subLevel === 'area' && !majors.some(m => active(m) && m.state === subState && m.lga === l)
                  const taken = subLevel === 'major' && takenLga(l)
                  return <option key={l} value={l} disabled={noParent || taken}>{l}{taken ? ' (assigned)' : noParent ? ' (no LGA distributor yet)' : ''}</option>
                })}
              </select>
              <select className={field} value={subWard} onChange={e => setSubWard(e.target.value)} disabled={subLevel !== 'area' || !subLga}>
                <option value="">{subLevel === 'area' ? 'Ward' : 'Ward (not needed)'}</option>
                {subLevel === 'area' && subWards.map(w => <option key={w} value={w} disabled={takenWard(w)}>{w}{takenWard(w) ? ' (assigned)' : ''}</option>)}
              </select>
              <input className={field} type="email" placeholder="User's registered email" value={subEmail} onChange={e => setSubEmail(e.target.value)} />
              <Button type="submit" disabled={busy}>Register</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className={box}>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-bold text-ink dark:text-white">Register many Sole Distributors at once</h2>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">One per line: <code>email, state</code>. Each person must already have a DICO account.</p>
          <textarea className={`${field} h-28 py-2 font-mono`} placeholder={'name@example.com, Lagos\nother@example.com, Kano'} value={bulk} onChange={e => setBulk(e.target.value)} />
          <Button variant="outline" disabled={busy} onClick={bulkRegister}>Register all</Button>
          {bulkResult.length > 0 && <pre className="text-xs whitespace-pre-wrap text-ink dark:text-white">{bulkResult.join('\n')}</pre>}
        </CardContent>
      </Card>

      <Header>State Sole Distributors ({soles.length})</Header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {soles.length === 0 && <Card className={`col-span-full ${box}`}><CardContent className="py-10 text-center text-muted dark:text-[#c0d0c4]">No Sole Distributors yet.</CardContent></Card>}
        {soles.map(d => (
          <Card key={d.id} className={`${active(d) ? (d.vgi_active ? '' : 'border-gold') : 'opacity-60'} ${box}`}>
            <CardContent className="p-4 space-y-3">
              <PersonHeader d={d} />
              <p className="text-sm text-ink dark:text-white">{d.state} · Sole Distributor</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2"><p className="text-[10px] uppercase tracking-wide text-muted">Balance</p><p className="font-bold text-ink dark:text-white">₦ {(d.balance_naira ?? 0).toLocaleString()}</p></div>
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2"><p className="text-[10px] uppercase tracking-wide text-muted">Voucher cap</p><p className="font-bold text-ink dark:text-white">₡ {d.voucher_credit.toLocaleString()}</p></div>
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2"><p className="text-[10px] uppercase tracking-wide text-muted">SMS units</p><p className="font-bold text-ink dark:text-white">{d.sms_units.toLocaleString()}</p></div>
              </div>

              <div className="rounded-lg border border-border dark:border-[#1f3a2c] p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-muted">Payment account (shown to buyers)</p>
                {d.bank_verified_at ? (
                  <p className="text-sm text-ink dark:text-white">{d.account_name}<br /><span className="text-xs text-muted">{d.bank_name} · {d.account_number}{d.bank_verified_manually ? ' · name entered by hand, not checked with the bank' : ''}</span></p>
                ) : <p className="text-xs text-red-600">Not set. Buyers cannot see this distributor until it is.</p>}
                <select className={field} value={bankSel[d.id] || ''} onChange={e => setBankSel(p => ({ ...p, [d.id]: e.target.value }))}>
                  <option value="">{d.bank_verified_at ? 'Change bank' : 'Select bank'}</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
                <input className={field} inputMode="numeric" maxLength={10} placeholder="10-digit account number" value={acct[d.id] || ''} onChange={e => setAcct(p => ({ ...p, [d.id]: e.target.value.replace(/\D/g, '') }))} />
                <label className="flex items-center gap-2 text-xs text-muted dark:text-[#c0d0c4]">
                  <input type="checkbox" checked={!!manual[d.id]} onChange={e => setManual(p => ({ ...p, [d.id]: e.target.checked }))} />
                  Enter the account name myself (use only if the bank check fails)
                </label>
                {manual[d.id] && <input className={field} placeholder="Account name exactly as the bank shows it" value={manualName[d.id] || ''} onChange={e => setManualName(p => ({ ...p, [d.id]: e.target.value }))} />}
                <Button variant="outline" disabled={busy} onClick={() => saveBank(d)}>{manual[d.id] ? 'Save account' : 'Verify & save'}</Button>
              </div>

              {!d.vgi_active ? (
                <Button className="w-full" disabled={busy || !active(d)} onClick={() => activate(d)}>Activate VGI</Button>
              ) : (
                <div className="flex gap-2">
                  <input className={field} type="number" min={1} placeholder="Raise CIVICT cap" value={topUp[d.id] || ''} onChange={e => setTopUp(p => ({ ...p, [d.id]: e.target.value }))} />
                  <Button variant="outline" disabled={busy} onClick={() => addCredit(d)}>Fund</Button>
                </div>
              )}
              {d.vgi_active && (
                <div className="rounded-lg border border-border dark:border-[#1f3a2c] p-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Record payment received (₦)</p>
                  <div className="flex gap-2">
                    <input className={field} type="number" min={1} placeholder="Amount paid" value={payAmt[d.id] || ''} onChange={e => setPayAmt(p => ({ ...p, [d.id]: e.target.value }))} />
                    <select className={`${field} w-32`} value={payKind[d.id] || 'voucher_credit'} onChange={e => setPayKind(p => ({ ...p, [d.id]: e.target.value }))}>
                      <option value="voucher_credit">Voucher credit</option>
                      <option value="vgi_fee">VGI fee</option>
                    </select>
                    <Button variant="outline" disabled={busy} onClick={() => recordPayment(d)}>Record</Button>
                  </div>
                </div>
              )}
              <div className="flex justify-end"><RemoveRow d={d} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Header>LGA distributors ({majors.length})</Header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {majors.length === 0 && <Card className={`col-span-full ${box}`}><CardContent className="py-8 text-center text-muted dark:text-[#c0d0c4]">No LGA distributors yet.</CardContent></Card>}
        {majors.map(d => (
          <Card key={d.id} className={`${active(d) ? '' : 'opacity-60'} ${box}`}>
            <CardContent className="p-4 space-y-2">
              <PersonHeader d={d} />
              <p className="text-sm text-ink dark:text-white">{d.lga}, {d.state}</p>
              <p className="text-xs text-muted dark:text-[#c0d0c4]">Reports to {nameOf(d.parent_id)}</p>
              <div className="flex justify-end"><RemoveRow d={d} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Header>Ward distributors ({areas.length})</Header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {areas.length === 0 && <Card className={`col-span-full ${box}`}><CardContent className="py-8 text-center text-muted dark:text-[#c0d0c4]">No ward distributors yet.</CardContent></Card>}
        {areas.map(d => (
          <Card key={d.id} className={`${active(d) ? '' : 'opacity-60'} ${box}`}>
            <CardContent className="p-4 space-y-2">
              <PersonHeader d={d} />
              <p className="text-sm text-ink dark:text-white">{d.ward}, {d.lga}, {d.state}</p>
              <p className="text-xs text-muted dark:text-[#c0d0c4]">Reports to {nameOf(d.parent_id)}</p>
              <div className="flex justify-end"><RemoveRow d={d} /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
