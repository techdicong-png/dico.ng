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
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded inline-block mb-2">
          Finance
        </span>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">Reward Pool & Rate Manager</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gold/5 border-gold/20 dark:bg-[#11241b] dark:border-gold/30">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">Pool Balance</p>
            <p className="font-serif text-3xl font-black text-gold">₦{(data?.pool_balance_naira || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">CIVICT Rate</p>
            <p className="font-serif text-3xl font-black text-forest dark:text-forest-700">{data?.civict_rate || 0}</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">Paid Out</p>
            <p className="font-serif text-3xl font-black text-forest dark:text-forest-700">₦{(data?.total_paid_out_naira || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">Pending</p>
            <p className="font-serif text-3xl font-black text-forest dark:text-forest-700">{data?.pending_redemptions || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardHeader><CardTitle className="text-base text-ink dark:text-white">⚙️ Platform Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {SETTINGS.map(s => (
              <div key={s.key}>
                <label className="text-xs font-semibold text-ink dark:text-white">{s.label}</label>
                <div className="flex gap-2">
                  <Input id={`cfg_${s.key}`} defaultValue={data?.[s.key] || ''} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
                  <Button variant="outline" size="sm" className="dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" onClick={() => saveSetting(s.key)}>Save</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardHeader><CardTitle className="text-base text-ink dark:text-white">💳 Credit Reward Pool</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="number" placeholder="Amount (₦)" value={creditAmt} onChange={e => setCreditAmt(e.target.value)} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            <Input placeholder="Description" value={creditDesc} onChange={e => setCreditDesc(e.target.value)} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            <Button onClick={creditPool} className="bg-gold hover:bg-gold/90 text-ink font-bold">Add to Pool</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardHeader><CardTitle className="text-base text-ink dark:text-white">💸 Redemption Requests</CardTitle></CardHeader>
        <CardContent>
          {rdms.length === 0 ? (
            <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-4">None yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-[#1f3a2c] text-left text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">
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
                    <tr key={r.id} className="border-b border-border-light dark:border-[#1f3a2c]">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-ink dark:text-white">{r.users?.full_name || '–'}</p>
                        <p className="text-xs text-muted dark:text-[#c0d0c4]">{r.users?.email || ''}</p>
                      </td>
                      <td className="py-3 pr-4 font-bold text-forest dark:text-forest-700">₡ {r.civict_amount?.toLocaleString()}</td>
                      <td className="py-3 pr-4 font-medium text-ink dark:text-white">{r.naira_net_display}</td>
                      <td className="py-3 pr-4 text-xs text-muted dark:text-[#c0d0c4]">{r.requested_at ? new Date(r.requested_at).toLocaleDateString() : ''}</td>
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