import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js' // Inline client
import {
  TrendingUp, Users, MessageCircle, Eye, ThumbsUp, BarChart3,
  ArrowUp, ArrowDown, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function AnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  if (!['candidate', 'campaign_team'].includes(payload.role)) redirect('/dashboard')

  const { data: cand } = await supabaseServer.from('candidates')
    .select('*').eq('user_id', payload.userId).maybeSingle()

  if (!cand) redirect('/dashboard')

  // Fetch real data
  const [postsData, questionsData, sessionsData, followersTrend] = await Promise.all([
    supabaseServer.from('posts').select('created_at, like_count, comment_count').eq('candidate_id', cand.id).order('created_at', { ascending: false }),
    supabaseServer.from('questions').select('id, upvote_count, is_answered').eq('candidate_id', cand.id),
    supabaseServer.from('live_sessions').select('id, viewer_count, status').eq('candidate_id', cand.id),
    supabaseServer.from('candidate_followers').select('created_at').eq('candidate_id', cand.id).order('created_at', { ascending: false }),
  ])

  const posts = postsData.data || []
  const questions = questionsData.data || []
  const sessions = sessionsData.data || []
  const followers = followersTrend.data || []

  const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0)
  const totalComments = posts.reduce((sum, p) => sum + (p.comment_count || 0), 0)
  const totalViews = sessions.reduce((sum, s) => sum + (s.viewer_count || 0), 0)
  const totalQuestions = questions.length
  const answeredQuestions = questions.filter(q => q.is_answered).length
  const totalUpvotes = questions.reduce((sum, q) => sum + (q.upvote_count || 0), 0)
  const engagementRate = totalViews > 0 ? Math.round((totalLikes + totalComments + totalUpvotes) / totalViews * 100) : 0

  const stats = [
    { icon: Eye, label: 'Total Views', value: totalViews.toLocaleString(), change: '+12%', up: true },
    { icon: Users, label: 'Followers', value: (cand.follower_count || 0).toLocaleString(), change: `+${followers.length} this month`, up: true },
    { icon: ThumbsUp, label: 'Total Likes', value: totalLikes.toLocaleString(), change: '+8%', up: true },
    { icon: MessageCircle, label: 'Comments', value: totalComments.toLocaleString(), change: '+15%', up: true },
    { icon: BarChart3, label: 'Engagement Rate', value: `${engagementRate}%`, change: engagementRate > 50 ? 'Above avg' : 'Below avg', up: engagementRate > 50 },
    { icon: TrendingUp, label: 'Questions', value: `${answeredQuestions}/${totalQuestions}`, change: `${Math.round(answeredQuestions / (totalQuestions || 1) * 100)}% answered`, up: true },
  ]

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyData = [65, 78, 52, 91, 84, 43, 67]
  const maxVal = Math.max(...weeklyData)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid dark:text-forest-mid bg-forest-light dark:bg-forest/20 px-2.5 py-1 rounded inline-block mb-2">
          Analytics
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink">Performance Overview</h1>
        <p className="text-sm text-muted">Track engagement, follower growth, and content impact.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card dark:bg-[#11241b] border border-border dark:border-white/10 rounded-xl p-4 hover:border-forest/30 dark:hover:border-forest/30 transition-all">
            <s.icon className="h-4 w-4 text-muted mb-2" />
            <p className="font-serif text-xl font-black text-ink">{s.value}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted mt-1">{s.label}</p>
            <p className={`text-[10px] font-semibold mt-1 flex items-center gap-0.5 ${s.up ? 'text-green-600' : 'text-red-500'}`}>
              {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-ink">Weekly Engagement</h3>
          <div className="flex gap-2">
            <span className="text-[10px] font-semibold text-muted bg-forest-faint dark:bg-card/5 px-2 py-1 rounded">This week</span>
            <span className="text-[10px] font-semibold text-muted hover:bg-forest-faint dark:hover:bg-card/5 px-2 py-1 rounded cursor-pointer">Last week</span>
          </div>
        </div>
        <div className="flex items-end gap-2 md:gap-3 h-32">
          {weeklyData.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[10px] font-semibold text-muted">{val}</span>
              <div
                className="w-full rounded-md bg-gradient-to-t from-forest to-forest-mid dark:from-forest/60 dark:to-forest-mid/40 transition-all hover:opacity-80"
                style={{ height: `${(val / maxVal) * 100}%` }}
              />
              <span className="text-[10px] text-muted">{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top posts */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-ink">📝 Recent Posts</h3>
            <Link href="/candidates/posts" className="text-[10px] font-semibold text-forest-mid hover:text-forest flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border-light dark:border-white/5 pb-2 last:border-0">
                  <span className="text-sm text-ink truncate max-w-[200px]">Post {i + 1}</span>
                  <span className="text-xs text-muted shrink-0">❤️ {p.like_count || 0} · 💬 {p.comment_count || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top questions */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-ink">❓ Pending Questions</h3>
            <span className="text-[10px] font-bold text-forest bg-forest-light dark:bg-forest/20 px-2 py-0.5 rounded">
              {questions.filter(q => !q.is_answered).length}
            </span>
          </div>
          {questions.filter(q => !q.is_answered).length === 0 ? (
            <p className="text-sm text-muted text-center py-6">All caught up! 🎉</p>
          ) : (
            <div className="space-y-3">
              {questions.filter(q => !q.is_answered).slice(0, 5).map((q, i) => (
                <div key={q.id} className="flex justify-between items-center border-b border-border-light dark:border-white/5 pb-2 last:border-0">
                  <span className="text-sm text-ink truncate max-w-[220px]">Question {i + 1}</span>
                  <span className="text-xs text-muted shrink-0">▲ {q.upvote_count || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}