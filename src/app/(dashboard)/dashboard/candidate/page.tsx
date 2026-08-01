import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight, MessageCircle, Video, FileText, Star, Users, BarChart3 } from 'lucide-react'

export default async function CandidateDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  if (!['candidate', 'campaign_team'].includes(payload.role)) redirect('/dashboard')

  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  const { data: cands } = await supabaseAdmin.from('candidates')
    .select('*').eq('user_id', payload.userId).maybeSingle()

  const [questions, sessions, reports] = await Promise.all([
    supabaseAdmin.from('questions')
      .select('*, users(full_name, ward)')
      .eq('candidate_id', cands?.id || '').is('answer_text', null)
      .order('upvote_count', { ascending: false }).limit(6),
    supabaseAdmin.from('live_sessions')
      .select('*').eq('candidate_id', cands?.id || '')
      .order('scheduled_at', { ascending: false }).limit(5),
    supabaseAdmin.from('reports')
      .select('*, users(full_name)')
      .eq('lga', user.lga || '').eq('status', 'submitted')
      .limit(5),
  ])

  const c = cands as any
  const qList = (questions.data || []) as any[]
  const sList = (sessions.data || []) as any[]
  const rList = (reports.data || []) as any[]

  const stats = [
    { icon: Star, label: 'Reputation', value: (c?.reputation_score || 0).toLocaleString(), gold: true },
    { icon: Users, label: 'Followers', value: (c?.follower_count || 0).toLocaleString() },
    { icon: MessageCircle, label: 'Q&As Answered', value: c?.qa_count || 0 },
    { icon: Video, label: 'Sessions', value: sList.filter(s => s.status === 'ended').length },
  ]

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Candidate Command Centre
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">
          Welcome, <span className="text-gold">{user.full_name?.split(' ')[0]}</span> 🎙️
        </h1>
      </div>

      {/* ==================== ACTION BUTTONS ==================== */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/sessions" className="bg-forest hover:bg-forest-mid text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all inline-flex items-center gap-2">
          <Video className="h-4 w-4" /> Schedule Live Session
        </Link>
        <Link href="/polls" className="border border-border dark:border-[#1f3a2c] text-ink dark:text-white hover:bg-sand dark:hover:bg-[#1b3a2b] font-semibold text-sm px-5 py-2.5 rounded-lg transition-all inline-flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Create Poll
        </Link>
        <Link href="/profile" className="border border-border dark:border-[#1f3a2c] text-ink dark:text-white hover:bg-sand dark:hover:bg-[#1b3a2b] font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
          Edit Profile
        </Link>
      </div>

      {/* ==================== STAT CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5 hover:border-forest dark:hover:border-gold/30 hover:-translate-y-0.5 transition-all">
            <div className={`w-9 h-9 rounded-lg ${s.gold ? 'bg-gold/10' : 'bg-mint dark:bg-[#1b3a2b]'} flex items-center justify-center mb-3`}>
              <s.icon className={`h-[18px] w-[18px] ${s.gold ? 'text-gold' : 'text-forest dark:text-forest-700'}`} />
            </div>
            <p className={`font-serif text-2xl font-black ${s.gold ? 'text-gold' : 'text-ink dark:text-white'}`}>{s.value}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ==================== MAIN GRID ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PENDING QUESTIONS */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="font-serif text-base font-bold text-ink dark:text-white flex items-center gap-2">
              ❓ Pending Questions
              {qList.length > 0 && (
                <span className="text-[10px] font-bold bg-forest-light dark:bg-[#1b3a2b] text-forest-800 dark:text-[#d4ebdf] px-2 py-0.5 rounded">{qList.length}</span>
              )}
            </h3>
          </div>
          <div className="px-5">
            {qList.length === 0 ? (
              <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-8">No pending questions. Great work! 🎉</p>
            ) : (
              qList.map((q: any) => (
                <div key={q.id} className="py-3.5 border-b border-border-light dark:border-[#1f3a2c] last:border-0">
                  <p className="text-sm text-ink dark:text-white font-medium mb-1">{q.question_text}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted dark:text-[#c0d0c4]">by {q.users?.full_name || 'Voter'} · ▲ {q.upvote_count || 0}</p>
                    <Link href={`/sessions/${q.session_id || ''}`}
                      className="text-xs font-semibold text-forest-800 dark:text-forest-700 hover:text-forest dark:hover:text-white transition-colors">
                      Answer (+20 RP)
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MY SESSIONS */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="font-serif text-base font-bold text-ink dark:text-white flex items-center gap-2">📅 My Sessions</h3>
            <Link href="/sessions" className="text-xs font-semibold text-gold flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5">
            {sList.length === 0 ? (
              <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-8">No sessions yet. Schedule one.</p>
            ) : (
              sList.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-3.5 border-b border-border-light dark:border-[#1f3a2c] last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">{s.title}</p>
                    <p className="text-xs text-muted dark:text-[#c0d0c4] mt-0.5">
                      {s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                      {' · '}{s.viewer_count || 0} viewers
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    s.status === 'live' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300' 
                    : s.status === 'ended' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  }`}>{s.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==================== REPORTS TABLE ==================== */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="font-serif text-base font-bold text-ink dark:text-white">📋 Community Reports — Awaiting Response</h3>
        </div>
        {rList.length === 0 ? (
          <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-8">No pending reports in your area.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-[#1f3a2c] text-left text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">
                  <th className="px-5 py-3">Title</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Ward</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {rList.map((r: any) => (
                  <tr key={r.id} className="border-b border-border-light dark:border-[#1f3a2c] last:border-0">
                    <td className="px-5 py-3 font-medium text-ink dark:text-white">{r.title}</td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold bg-forest-light dark:bg-[#1b3a2b] text-forest-800 dark:text-[#d4ebdf] px-2 py-0.5 rounded">{r.category}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted dark:text-[#c0d0c4]">{r.ward || '–'}</td>
                    <td className="py-3 pr-4 text-xs text-muted dark:text-[#c0d0c4]">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="py-3 pr-5">
                      <Link href={`/reports/${r.id}`} className="text-xs font-semibold text-forest-800 dark:text-forest-700 hover:text-forest dark:hover:text-white border border-border dark:border-[#1f3a2c] px-3 py-1.5 rounded-lg transition-all">
                        Respond
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
