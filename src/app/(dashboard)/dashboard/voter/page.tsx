import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

type SessionRow = { id: string; title: string; status: string; scheduled_at: string | null; candidates: { full_name: string }[] | null }
type PollRow = { id: string; question: string; total_votes: number; closes_at: string }
type WardRow = { ward: string; lga: string; index_score: number }

export default async function VoterDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  const [balanceData, sessionsData, pollsData, wardsData] = await Promise.all([
    supabaseAdmin.from('users').select('civict_balance, civict_rank').eq('id', user.id).single(),
    supabaseAdmin.from('live_sessions')
      .select('id, title, status, scheduled_at, candidates(full_name)')
      .in('status', ['live', 'scheduled']).order('scheduled_at').limit(5),
    supabaseAdmin.from('polls').select('id, question, total_votes, closes_at').eq('is_active', true).limit(5),
    supabaseAdmin.from('ward_civic_index').select('ward, lga, index_score').order('index_score', { ascending: false }).limit(6),
  ])

  const balance = balanceData.data?.civict_balance ?? 0
  const rank = balanceData.data?.civict_rank ?? 'observer'
  const sessions = (sessionsData.data ?? []) as any[]
  const polls = (pollsData.data ?? []) as PollRow[]
  const wards = (wardsData.data ?? []) as WardRow[]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Voter Dashboard
        </span>
        <h1 className="font-serif text-3xl font-black text-ink">
          Welcome back, {user.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-muted">Your constituency at a glance.</p>
      </div>

      {/* Stats Row — Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-xl p-6 hover:border-forest hover:-translate-y-0.5 transition-all shadow-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-2">CIVICT Balance</p>
          <p className="font-serif text-3xl font-black text-gold">₡ {balance.toLocaleString()}</p>
          <p className="text-xs text-muted mt-1 capitalize">{rank.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6 hover:border-forest hover:-translate-y-0.5 transition-all shadow-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-2">Your Rank</p>
          <p className="font-serif text-3xl font-black text-forest capitalize">{rank.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6 hover:border-forest hover:-translate-y-0.5 transition-all shadow-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-2">Questions Asked</p>
          <p className="font-serif text-3xl font-black text-forest">–</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6 hover:border-forest hover:-translate-y-0.5 transition-all shadow-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-2">Reports Filed</p>
          <p className="font-serif text-3xl font-black text-forest">–</p>
        </div>
      </div>

      {/* Sessions — Designer's Live Card Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border-light flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">🔴 Live & Upcoming</h3>
            <Link href="/sessions" className="text-[11px] font-semibold text-forest-mid hover:text-forest">View all</Link>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">No sessions scheduled yet.</p>
          ) : (
            <div className="divide-y divide-border-light">
              {sessions.map((s: any) => (
                <div key={s.id} className="p-5 hover:bg-forest-faint/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    {s.status === 'live' ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-forest-mid bg-forest-light px-2 py-0.5 rounded uppercase">{s.status}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-ink">{s.title}</p>
                  <p className="text-xs text-muted mt-1">
                    {s.candidates?.[0]?.full_name ?? 'DICO'} 
                    {s.scheduled_at ? <> · {new Date(s.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</> : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Polls */}
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border-light flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">🗳️ Active Polls</h3>
            <Link href="/polls" className="text-[11px] font-semibold text-forest-mid hover:text-forest">View all</Link>
          </div>
          {polls.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">No active polls right now.</p>
          ) : (
            <div className="divide-y divide-border-light">
              {polls.map(p => (
                <div key={p.id} className="p-5 hover:bg-forest-faint/30 transition-colors">
                  <p className="text-sm font-semibold text-ink mb-1.5">{p.question}</p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                    <span>{p.total_votes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ward Index — Designer's Leaderboard Style */}
      <div className="bg-gradient-to-br from-[#0A3D2B] to-[#0F5438] rounded-xl p-6 md:p-8 shadow-md">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-5">🏆 Ward Civic Index — Live Leaderboard</p>
        {wards.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">No ward data yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {wards.map((w, i) => (
              <div key={w.ward} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-xs text-white/70 font-semibold mb-2">
                  <span className="text-gold font-black mr-1">{i + 1}.</span> {w.ward} · {w.lga}
                </p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-serif text-2xl font-black text-white">{w.index_score}</span>
                  <span className={`text-xs font-bold ${i < 2 ? 'text-green-400' : 'text-white/40'}`}>
                    {i === 0 ? '+4' : i === 1 ? '+2' : '+1'}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-hover" style={{ width: `${w.index_score}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
