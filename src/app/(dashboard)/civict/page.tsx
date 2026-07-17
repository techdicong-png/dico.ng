// src/app/(dashboard)/civict/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RANKS = [
  { label: 'Observer', min: 0 },
  { label: 'Mobilizer', min: 200 },
  { label: 'Ward Influencer', min: 600 },
  { label: 'Ambassador', min: 1500 },
  { label: 'Community Leader', min: 4000 },
]

export default async function CivictPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  const [user, txs, wards] = await Promise.all([
    supabaseAdmin.from('users').select('civict_balance, civict_rank').eq('id', payload.userId).single(),
    supabaseAdmin.from('civict_transactions')
      .select('type, amount, description, created_at')
      .eq('user_id', payload.userId).order('created_at', { ascending: false }).limit(12),
    supabaseAdmin.from('ward_civic_index')
      .select('ward, lga, index_score, weekly_change')
      .order('index_score', { ascending: false }).limit(6),
  ])

  const balance = user.data?.civict_balance ?? 0
  const rank = user.data?.civict_rank ?? 'observer'
  const transactions = txs.data ?? []
  const wardList = wards.data ?? []

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#071E12] to-[#0F5438] rounded-xl p-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#C8960A]/70 mb-2">My CIVICT Wallet</p>
          <p className="font-serif text-5xl font-black text-[#E8C040]">₡ {balance.toLocaleString()}</p>
          <p className="text-sm text-white/40 mt-2 capitalize">{rank.replace(/_/g, ' ')}</p>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12rem] font-black text-[#C8960A]/5 pointer-events-none select-none font-serif">
          ₡
        </div>
      </div>

      {/* Rank progression */}
      <Card>
        <CardHeader><CardTitle className="text-base">🏅 Rank Progression</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {RANKS.map(r => {
              const userRankIndex = RANKS.findIndex(x => x.label.toLowerCase().replace(' ', '_') === rank)
              const rankIndex = RANKS.indexOf(r)
              const isDone = userRankIndex > rankIndex
              const isCurrent = r.label.toLowerCase().replace(' ', '_') === rank
              return (
                <div key={r.label}
                  className={`flex-1 text-center p-3 rounded-lg text-xs font-bold transition-colors ${
                    isCurrent ? 'bg-[#0A3D2B] text-white'
                    : isDone ? 'bg-[#E8F3EE] text-[#0A3D2B]'
                    : 'bg-[#D8E4DC] text-[#5A6E62]'
                  }`}>
                  {r.label}<br />
                  <span className="opacity-60 font-normal">≥{r.min} ₡</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market rates */}
        <Card>
          <CardHeader><CardTitle className="text-base">📈 Live CIVICT Market</CardTitle></CardHeader>
          <CardContent>
            {[
              { action: 'Question', value: '20 ₡' },
              { action: 'Poll Vote', value: '10 ₡' },
              { action: 'Idea', value: '30 ₡', hot: true },
              { action: 'Community Report', value: '15 ₡' },
              { action: 'Follow Candidate', value: '2 ₡' },
            ].map(item => (
              <div key={item.action} className="flex justify-between py-2.5 border-b border-[#EAF0EB] last:border-0">
                <span className="text-sm text-[#0D1B12]">{item.action}</span>
                <span className="font-serif text-sm font-bold text-[#0A3D2B]">
                  {item.value}
                  {item.hot && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-1">🔥 Hot</span>}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card>
          <CardHeader><CardTitle className="text-base">📒 Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-[#5A6E62] text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-1">
                {transactions.map((tx, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-[#EAF0EB] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#0D1B12]">{tx.description || tx.type}</p>
                      <p className="text-xs text-[#5A6E62]">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-serif text-sm font-bold ${tx.amount > 0 ? 'text-[#0A3D2B]' : 'text-[#c0392b]'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} ₡
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ward Index */}
      <Card>
        <CardHeader><CardTitle className="text-base">🗺️ Ward Civic Index</CardTitle></CardHeader>
        <CardContent>
          {wardList.length === 0 ? (
            <p className="text-sm text-[#5A6E62] text-center py-8">No ward data yet.</p>
          ) : (
            <div className="space-y-3">
              {wardList.map((w, i) => (
                <div key={w.ward} className="flex items-center gap-3">
                  <span className="font-serif text-sm font-black text-[#5A6E62] w-5 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0D1B12]">{w.ward} · {w.lga}</p>
                    <div className="h-1.5 bg-[#D8E4DC] rounded-full mt-1">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-[#0A3D2B] to-[#C8960A]" style={{ width: `${w.index_score}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-base font-black text-[#0A3D2B]">{w.index_score}</p>
                    <p className={`text-xs font-bold ${w.weekly_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {w.weekly_change >= 0 ? '▲' : '▼'} {Math.abs(w.weekly_change)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
