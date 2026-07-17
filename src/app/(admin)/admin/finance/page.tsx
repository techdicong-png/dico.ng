// src/app/(admin)/admin/finance/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminFinancePage() {
  const [data, setData] = useState<any>(null)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [creditAmt, setCreditAmt] = useState('')
  const [creditDesc, setCreditDesc] = useState('')
  const [rdms, setRdms] = useState<any[]>([])

  useEffect(() => { load(); loadRdms() }, [])

  async function load() {
    const token = localStorage.getItem('dico_token')
    const res = await fetch('/api/admin/finance/overview', { headers: { 'Authorization': `Bearer ${token}` } })
    const d = await res.json()
    setData(d)
  }

  async function loadRdms() {
    const token = localStorage.getItem('dico_token')
    const res = await fetch('/api/admin/finance/redemptions', { headers: { 'Authorization': `Bearer ${token}` } })
    const d = await res.json()
    setRdms(d.redemptions || [])
  }

  async function saveSetting(key: string) {
    const token = localStorage.getItem('dico_token')
    const value = (document.getElementById(`cfg_${key}`) as HTMLInputElement)?.value
    await fetch('/api/admin/finance/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ key, value }),
    })
  }

  async function creditPool() {
    const token = localStorage.getItem('dico_token')
    await fetch('/api/admin/finance/pool/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ amount_naira: parseFloat(creditAmt), description: creditDesc }),
    })
    load()
  }

  const SETTINGS = [
    { key: 'civict_to_naira_rate', label: 'CIVICT per ₦1' },
    { key: 'min_redeem_civict', label: 'Min Redeem (CIVICT)' },
    { key: 'max_redeem_naira_daily', label: 'Max Daily (₦)' },
    { key: 'platform_fee_pct', label: 'Platform Fee (%)' },
    { key: 'redemption_enabled', label: 'Redemptions Open' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Finance
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Reward Pool & Rate Manager</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gold/5 border-gold/20">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Pool Balance</p>
            <p className="font-serif text-3xl font-black text-gold">₦{(data?.pool_balance_naira || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">CIVICT Rate</p>
            <p className="font-serif text-3xl font-black text-forest">{data?.civict_rate || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Paid Out</p>
            <p className="font-serif text-3xl font-black text-forest">₦{(data?.total_paid_out_naira || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Pending</p>
            <p className="font-serif text-3xl font-black text-forest">{data?.pending_redemptions || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">⚙️ Platform Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {SETTINGS.map(s => (
              <div key={s.key}>
                <label className="text-xs font-semibold">{s.label}</label>
                <div className="flex gap-2">
                  <Input id={`cfg_${s.key}`} defaultValue={data?.[s.key] || ''} />
                  <Button variant="outline" size="sm" onClick={() => saveSetting(s.key)}>Save</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">💳 Credit Reward Pool</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="number" placeholder="Amount (₦)" value={creditAmt} onChange={e => setCreditAmt(e.target.value)} />
            <Input placeholder="Description" value={creditDesc} onChange={e => setCreditDesc(e.target.value)} />
            <Button onClick={creditPool} className="bg-gold hover:bg-gold/90 text-ink font-bold">Add to Pool</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">💸 Redemption Requests</CardTitle></CardHeader>
        <CardContent>
          {rdms.length === 0 ? (
            <p className="text-sm text-muted-text text-center py-4">None yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] font-bold tracking-wider uppercase text-muted-text">
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4">CIVICT</th>
                    <th className="pb-2 pr-4">Net</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rdms.map((r: any) => (
                    <tr key={r.id} className="border-b border-border-light">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-ink">{r.users?.full_name || '–'}</p>
                        <p className="text-xs text-muted-text">{r.users?.email || ''}</p>
                      </td>
                      <td className="py-3 pr-4 font-bold text-forest">₡ {r.civict_amount?.toLocaleString()}</td>
                      <td className="py-3 pr-4 font-medium">{r.naira_net_display}</td>
                      <td className="py-3 pr-4 text-xs text-muted-text">{r.requested_at ? new Date(r.requested_at).toLocaleDateString() : ''}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={r.status === 'completed' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {r.status === 'pending' && <Button variant="destructive" size="sm">Reverse</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
