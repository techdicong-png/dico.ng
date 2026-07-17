// src/app/(dashboard)/dashboard/voter/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type SessionRow = { id: string; title: string; status: string; scheduled_at: string | null; candidates: { full_name: string }[] | null }
type PollRow = { id: string; question: string; total_votes: number; closes_at: string; user_vote?: string }
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-[#0F5438] bg-[#E8F3EE] px-2.5 py-1 rounded inline-block mb-2">
          Voter Dashboard
        </span>
        <h1 className="font-serif text-2xl font-black text-[#0D1B12]">
          Welcome back, {user.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-[#3D5246] max-w-lg">
          Your constituency activity at a glance. Participate, earn CIVICT, and make your voice matter.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">CIVICT Balance</p>
            <p className="font-serif text-3xl font-black text-[#C8960A]">₡ {balance.toLocaleString()}</p>
            <p className="text-xs text-[#3D5246] mt-1 capitalize">{rank.replace(/_/g, ' ')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Your Rank</p>
            <p className="font-serif text-3xl font-black text-[#0A3D2B] capitalize">{rank.replace(/_/g, ' ')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Questions Asked</p>
            <p className="font-serif text-3xl font-black text-[#0A3D2B]">–</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Reports Filed</p>
            <p className="font-serif text-3xl font-black text-[#0A3D2B]">–</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions + Polls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base text-[#0D1B12]">🔴 Live & Upcoming Sessions</CardTitle></CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-[#3D5246] text-center py-8">No sessions scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s: any) => (
                  <div key={s.id} className="border-b border-[#EAF0EB] pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={s.status === 'live' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {s.status === 'live' ? '● LIVE' : s.status}
                      </Badge>
                      <span className="text-sm font-semibold text-[#0D1B12]">{s.title}</span>
                    </div>
                    <p className="text-xs text-[#3D5246]">
                      {s.candidates?.[0]?.full_name ?? 'DICO'} · {s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base text-[#0D1B12]">🗳️ Active Polls</CardTitle></CardHeader>
          <CardContent>
            {polls.length === 0 ? (
              <p className="text-sm text-[#3D5246] text-center py-8">No active polls right now.</p>
            ) : (
              <div className="space-y-3">
                {polls.map(p => (
                  <div key={p.id} className="border-b border-[#EAF0EB] pb-3 last:border-0">
                    <p className="text-sm font-semibold text-[#0D1B12] mb-1">{p.question}</p>
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
                      <span className="text-xs text-[#3D5246]">{p.total_votes} votes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ward Index */}
      <Card>
        <CardHeader><CardTitle className="text-base text-[#0D1B12]">🏆 Ward Civic Index</CardTitle></CardHeader>
        <CardContent>
          {wards.length === 0 ? (
            <p className="text-sm text-[#3D5246] text-center py-8">No ward data yet.</p>
          ) : (
            <div className="space-y-3">
              {wards.map((w, i) => (
                <div key={w.ward} className="flex items-center gap-3">
                  <span className="font-serif text-sm font-black text-[#5A6E62] w-5 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0D1B12]">{w.ward} · {w.lga}</p>
                    <div className="h-1.5 bg-[#D8E4DC] rounded-full mt-1">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-[#0A3D2B] to-[#C8960A]" style={{ width: `${w.index_score}%` }} />
                    </div>
                  </div>
                  <span className="font-serif text-base font-black text-[#0A3D2B]">{w.index_score}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
