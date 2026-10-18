'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

type Entry = { id: number; txn_ref: string; role: string; amount_naira: number; state: string | null; lga: string | null; ward: string | null; created_at: string }
type Data = { total: number; byRole: Record<string, number>; transactions: number; recent: Entry[] }

const LABEL: Record<string, string> = { ward: 'Ward', lga: 'LGA', state: 'State', zonal: 'Zonal', national: 'National' }
const naira = (n: number) => '₦' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })

export function MyRoyalty() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/royalty').then(r => r.ok ? r.json() : Promise.reject()).then(setData).catch(() => setError(true))
  }, [])

  if (error) return <p className="text-sm text-red-600">Could not load your royalty.</p>
  if (!data) return <p className="text-sm text-muted">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c] col-span-2 lg:col-span-1">
          <CardContent className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted">Total earned</p>
            <p className="text-2xl font-black text-ink dark:text-white">{naira(data.total)}</p></CardContent></Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted">Transactions</p>
            <p className="text-2xl font-black text-ink dark:text-white">{data.transactions.toLocaleString()}</p></CardContent></Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted">By level</p>
            <p className="text-sm text-ink dark:text-white">
              {Object.keys(data.byRole).length === 0 ? 'None yet' : Object.entries(data.byRole).map(([r, a]) => `${LABEL[r] ?? r} ${naira(a)}`).join(' · ')}
            </p></CardContent></Card>
      </div>

      <div className="space-y-2">
        <h2 className="font-bold text-ink dark:text-white">Recent</h2>
        {data.recent.length === 0 && <p className="text-sm text-muted py-6 text-center">No royalty yet. It appears here when transactions happen in your area.</p>}
        {data.recent.map(e => (
          <Card key={e.id} className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink dark:text-white">{LABEL[e.role] ?? e.role} royalty</p>
                <p className="text-xs text-muted truncate">{[e.ward, e.lga, e.state].filter(Boolean).join(', ')} · {new Date(e.created_at).toLocaleDateString()}</p>
              </div>
              <p className="font-bold text-ink dark:text-white shrink-0">+{naira(e.amount_naira)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
