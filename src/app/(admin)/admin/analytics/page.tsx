import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/login')

  // 1. Get Total Hits
  const { count: totalHits } = await supabaseServer
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'page_view')

  // 2. Get "In House" (Logged In) Hits
  const { count: authedHits } = await supabaseServer
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'page_view')
    .eq('is_authenticated', true)

  // 3. Get Guest Hits
  const { count: guestHits } = await supabaseServer
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'page_view')
    .eq('is_authenticated', false)

  // 4. Get Top 5 Most Visited Pages
  const { data: topPages } = await supabaseServer
    .from('analytics_events')
    .select('path')
    .eq('event_type', 'page_view')

  // Tally up the paths manually in JS (since Supabase doesn't do GROUP BY easily without RPC)
  const pageCounts: Record<string, number> = {}
  topPages?.forEach(event => {
    const path = event.path || '/'
    pageCounts[path] = (pageCounts[path] || 0) + 1
  })
  
  const sortedPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const stats = [
    { label: 'Total Page Views', value: totalHits || 0, color: 'text-forest' },
    { label: 'In-House Users', value: authedHits || 0, color: 'text-gold' },
    { label: 'Guest Visitors', value: guestHits || 0, color: 'text-muted' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Platform Analytics</h1>
        <p className="text-sm text-muted">Monitor page views and visitor frequency.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className={`font-serif text-3xl md:text-4xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
              <p className="text-xs font-bold tracking-wider uppercase text-muted mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4">Top 5 Most Visited Pages</h3>
          <div className="space-y-3">
            {sortedPages.length === 0 && <p className="text-sm text-muted text-center py-4">No data yet. Start clicking around the app!</p>}
            {sortedPages.map(([path, count]) => (
              <div key={path} className="flex justify-between items-center border-b border-border-light pb-2 last:border-0">
                <span className="text-sm font-medium text-ink truncate">{path}</span>
                <span className="text-sm font-bold text-muted">{count} views</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}