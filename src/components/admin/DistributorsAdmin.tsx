'use client'

import { useState } from 'react'
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
  users: { full_name: string; email: string; phone: string | null } | null
}

const field =
  'h-9 w-full rounded-lg border border-border bg-white dark:bg-[#0f1d16] dark:border-[#1f3a2c] dark:text-white px-3 text-sm outline-none focus:border-gold'

export function DistributorsAdmin({ initialData, states }: { initialData: Distributor[]; states: string[] }) {
  const [list, setList] = useState<Distributor[]>(initialData)
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [busy, setBusy] = useState(false)
  const [topUp, setTopUp] = useState<Record<string, string>>({})

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
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Voucher credit</p>
                  <p className="font-bold text-ink dark:text-white">₡ {d.voucher_credit.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-black/5 dark:bg-[#0f1d16] py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted">SMS units</p>
                  <p className="font-bold text-ink dark:text-white">{d.sms_units.toLocaleString()}</p>
                </div>
              </div>
              {!d.vgi_active ? (
                <Button className="w-full" disabled={busy} onClick={() => activate(d)}>Activate VGI</Button>
              ) : (
                <div className="flex gap-2">
                  <input className={field} type="number" min={1} placeholder="Add CIVICT credit"
                    value={topUp[d.id] || ''} onChange={e => setTopUp(prev => ({ ...prev, [d.id]: e.target.value }))} />
                  <Button variant="outline" disabled={busy} onClick={() => addCredit(d)}>Fund</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
