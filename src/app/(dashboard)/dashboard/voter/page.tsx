import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { Vote, Video, CircleDollarSign, FileText, ChevronRight } from 'lucide-react'

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
  const polls = (pollsData.data ?? []) as any[]
  const wards = (wardsData.data ?? []) as any[]

  const stats = [
    { icon: Vote, label: 'Polls Voted', value: '18', change: '+3 this week', href: '/polls' },
    { icon: Video, label: 'Townhalls Joined', value: '7', change: '+2 this month', href: '/sessions' },
    { icon: CircleDollarSign, label: 'CIVICT Earned', value: `₡ ${balance.toLocaleString()}`, change: '+₡ 340 earned', href: '/civict', gold: true },
    { icon: FileText, label: 'Reports Filed', value: '3', change: '1 resolved', href: '/reports' },
  ]

  const feedItems = [
    { dot: 'bg-green-500', text: 'You voted in "Edo Governorship Poll"', time: '2 hours ago' },
    { dot: 'bg-gold', text: 'Earned ₦80 CIVICT for attending town hall', time: 'Yesterday' },
    { dot: 'bg-red-500', text: 'Report filed: "Potholes on Lekki-Epe Expressway"', time: '2 days ago' },
    { dot: 'bg-blue-500', text: 'Joined Surulere constituency live session', time: '4 days ago' },
  ]

  const reportCategories = [
    { cat: 'Roads', title: 'Severe Potholes on Lekki-Epe Expwy', status: 'In Progress', statusClass: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30' },
    { cat: 'Water', title: 'Borehole Breakdown in Ward 7', status: 'Under Review', statusClass: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30' },
    { cat: 'Electricity', title: 'Fallen Transformer Pole on Admiralty', status: 'Resolved ✓', statusClass: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30' },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-forest-800 bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Voter Dashboard
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">
          Welcome back, <span className="text-gold dark:text-gold">{user.full_name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">Your constituency at a glance.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5 hover:border-forest dark:hover:border-gold/30 hover:-translate-y-0.5 transition-all">
            <div className={`w-9 h-9 rounded-lg ${s.gold ? 'bg-gold-light dark:bg-[rgba(212,169,63,0.16)]' : 'bg-mint dark:bg-[#1b3a2b]'} flex items-center justify-center mb-3`}>
              <s.icon className={`h-[18px] w-[18px] ${s.gold ? 'text-gold dark:text-gold' : 'text-forest dark:text-forest-700'}`} />
            </div>
            <p className="font-serif text-2xl font-black text-ink dark:text-white">{s.value}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mt-1">{s.label}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{s.change}</p>
          </Link>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ACTIVITY FEED */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="font-serif text-base font-bold text-ink dark:text-white">Recent Activity</h3>
            <Link href="/feed" className="text-xs font-semibold text-gold dark:text-gold flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 py-2">
            {feedItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-border-light dark:border-[#1f3a2c] last:border-0">
                <span className={`w-2 h-2 rounded-full ${item.dot} mt-2 shrink-0`} />
                <div>
                  <p className="text-sm text-ink dark:text-white font-medium">{item.text}</p>
                  <p className="text-xs text-muted dark:text-[#c0d0c4] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SESSIONS */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="font-serif text-base font-bold text-ink dark:text-white">Sessions</h3>
            <Link href="/sessions" className="text-xs font-semibold text-gold dark:text-gold flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-8">No sessions yet.</p>
            ) : (
              sessions.map((s: any) => (
                <Link key={s.id} href={`/sessions/${s.id}`}
                  className="block py-3.5 border-b border-border-light dark:border-[#1f3a2c] last:border-0 hover:bg-forest-faint/30 dark:hover:bg-white/5 -mx-5 px-5 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    {s.status === 'live' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-forest-800 dark:text-forest-800 bg-forest-light dark:bg-[#1b3a2b] px-2 py-0.5 rounded">Upcoming</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-ink dark:text-white">{s.title}</p>
                  <p className="text-xs text-muted dark:text-[#c0d0c4] mt-0.5">
                    {s.candidates?.[0]?.full_name ?? 'DICO'}
                    {s.scheduled_at ? <> · {new Date(s.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</> : ''}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* POLLS */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="font-serif text-base font-bold text-ink dark:text-white">Active Polls</h3>
            <Link href="/polls" className="text-xs font-semibold text-gold dark:text-gold flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5">
            {polls.length === 0 ? (
              <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-8">No active polls.</p>
            ) : (
              polls.map(p => (
                <Link key={p.id} href="/polls"
                  className="block py-3.5 border-b border-border-light dark:border-[#1f3a2c] last:border-0 hover:bg-forest-faint/30 dark:hover:bg-white/5 -mx-5 px-5 transition-colors">
                  <p className="text-sm font-semibold text-ink dark:text-white mb-1">{p.question}</p>
                  <div className="flex items-center gap-3 text-xs text-muted dark:text-[#c0d0c4]">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active</span>
                    <span>{p.total_votes} votes</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* REPORTS */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="font-serif text-base font-bold text-ink dark:text-white">Your Constituency Reports</h3>
            <Link href="/reports" className="text-xs font-semibold text-gold dark:text-gold flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5">
            {reportCategories.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3.5 border-b border-border-light dark:border-[#1f3a2c] last:border-0">
                <div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.statusClass}`}>{r.cat}</span>
                  <p className="text-sm text-ink dark:text-white mt-1">{r.title}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.statusClass}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WARD CIVIC INDEX */}
      <div className="bg-gradient-to-br from-[#0A3D2B] to-[#0F5438] rounded-xl p-6 md:p-8 shadow-md">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 dark:text-white/50 mb-5">🏆 Ward Civic Index — Live Leaderboard</p>
        {wards.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">No ward data yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {wards.map((w: any, i: number) => (
              <div key={w.ward} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-xs text-white/70 font-semibold mb-2">
                  <span className="text-gold dark:text-gold font-black mr-1">{i + 1}.</span> {w.ward} · {w.lga}
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
