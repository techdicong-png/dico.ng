import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { Play, Calendar, Clock, Users, ChevronRight, Video, MessageCircle } from 'lucide-react'

export default async function SessionsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  const { data: cand } = await supabaseAdmin.from('candidates')
    .select('id').eq('user_id', payload.userId).maybeSingle()

  const isCandidate = ['candidate', 'campaign_team'].includes(payload.role)

  const [liveData, upcomingData, pastData] = await Promise.all([
    supabaseAdmin.from('live_sessions')
      .select('*, candidates(full_name, party, office)')
      .eq('status', 'live').order('scheduled_at', { ascending: false }).limit(3),
    supabaseAdmin.from('live_sessions')
      .select('*, candidates(full_name, party, office)')
      .in('status', ['scheduled']).gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true }).limit(6),
    supabaseAdmin.from('live_sessions')
      .select('*, candidates(full_name, party, office)')
      .eq('status', 'ended').order('scheduled_at', { ascending: false }).limit(6),
  ])

  const liveSessions = (liveData.data || []) as any[]
  const upcoming = (upcomingData.data || []) as any[]
  const past = (pastData.data || []) as any[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Live Sessions
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Digital Town Halls</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">Join live Q&A sessions with candidates in your constituency.</p>
      </div>

      {/* LIVE NOW */}
      {liveSessions.length > 0 && (
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-red-400 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-card animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Live Now</span>
          </div>
          {liveSessions.map(s => (
            <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-black">{s.title}</h2>
                <p className="text-white/80 text-sm mt-1">
                  {s.candidates?.full_name} · {s.candidates?.party} · {s.candidates?.office}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-white/60">
                  <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {s.viewer_count || 0} watching</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {s.question_count || 0} questions</span>
                </div>
              </div>
              <Link href={`/sessions/${s.id}`}
                className="bg-card text-red-600 font-bold px-6 py-3 rounded-lg text-sm hover:bg-red-50 transition-all inline-flex items-center gap-2 shrink-0">
                <Play className="h-4 w-4" /> Join Live
              </Link>
            </div>
          ))}
        </div>
      )}

      {liveSessions.length === 0 && (
        <div className="bg-gradient-to-br from-forest to-forest-mid rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">No live sessions right now</span>
          </div>
          <p className="text-white/70 text-sm">Check the upcoming schedule below for the next town hall.</p>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-ink dark:text-white">📅 Upcoming Sessions</h2>
          {isCandidate && (
            <Link href="/sessions/create"
              className="text-[10px] font-semibold bg-forest hover:bg-forest-mid text-white px-3 py-1.5 rounded-lg transition-all">
              + Schedule Session
            </Link>
          )}
        </div>
        {upcoming.length === 0 ? (
          <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-10 text-center">
            <Calendar className="h-8 w-8 text-muted dark:text-[#c0d0c4] mx-auto mb-2" />
            <p className="text-sm text-muted dark:text-[#c0d0c4]">No upcoming sessions scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map(s => (
              <div key={s.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5 hover:border-forest/30 dark:hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-[10px] font-bold text-forest-800 dark:text-[#d4ebdf] bg-forest-light dark:bg-[#1b3a2b] px-2 py-0.5 rounded w-fit mb-3">
                  <Clock className="h-3 w-3" />
                  {new Date(s.scheduled_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
                <h3 className="text-sm font-bold text-ink dark:text-white mb-1">{s.title}</h3>
                <p className="text-xs text-muted dark:text-[#c0d0c4]">{s.candidates?.full_name} · {s.candidates?.office}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted dark:text-[#c0d0c4]">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {s.viewer_count || 0}</span>
                  <Link href={`/sessions/${s.id}`}
                    className="ml-auto text-forest-800 dark:text-forest-700 font-semibold hover:text-forest dark:hover:text-white flex items-center gap-1">
                    Set Reminder <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-ink dark:text-white">📼 Past Replays</h2>
        </div>
        {past.length === 0 ? (
          <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-10 text-center">
            <p className="text-sm text-muted dark:text-[#c0d0c4]">No past sessions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {past.map(s => (
              <div key={s.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden hover:border-forest/30 dark:hover:border-gold/30 transition-all group">
                <div className="h-28 bg-forest-faint dark:bg-[#1b3a2b] flex items-center justify-center relative">
                  <div className="w-10 h-10 rounded-full bg-card/80 dark:bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-4 w-4 text-forest dark:text-forest-700 ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded">
                    {new Date(s.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-ink dark:text-white truncate">{s.title}</h3>
                  <p className="text-xs text-muted dark:text-[#c0d0c4]">{s.candidates?.full_name}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted dark:text-[#c0d0c4]">
                    <span>👁️ {s.viewer_count || 0}</span>
                    <Link href={`/sessions/${s.id}`} className="ml-auto text-forest-800 dark:text-forest-700 font-semibold hover:text-forest dark:hover:text-white">Watch replay</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
