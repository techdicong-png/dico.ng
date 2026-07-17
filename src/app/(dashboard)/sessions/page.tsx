// src/app/(dashboard)/sessions/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SessionsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  const [live, upcoming, past] = await Promise.all([
    supabaseAdmin.from('live_sessions')
      .select('*, candidates(full_name, party, state)')
      .eq('status', 'live').limit(10),
    supabaseAdmin.from('live_sessions')
      .select('*, candidates(full_name, party, state)')
      .eq('status', 'scheduled').order('scheduled_at').limit(10),
    supabaseAdmin.from('live_sessions')
      .select('*, candidates(full_name, party, state)')
      .eq('status', 'ended').order('scheduled_at', { ascending: false }).limit(10),
  ])

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Town Hall Sessions
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Live Sessions</h1>
        <p className="text-sm text-muted-text">Join live constituency sessions and earn CIVICT.</p>
      </div>

      {/* Live Now */}
      {live.data && live.data.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />🔴 Live Now
          </h2>
          <div className="space-y-3">
            {live.data.map(s => <SessionCard key={s.id} session={s as any} />)}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.data && upcoming.data.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-ink mb-3">📅 Upcoming</h2>
          <div className="space-y-3">
            {upcoming.data.map(s => <SessionCard key={s.id} session={s as any} />)}
          </div>
        </div>
      )}

      {/* Past */}
      {past.data && past.data.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-ink mb-3">📁 Past Sessions</h2>
          <div className="space-y-3">
            {past.data.slice(0, 5).map(s => <SessionCard key={s.id} session={s as any} />)}
          </div>
        </div>
      )}

      {(!live.data?.length && !upcoming.data?.length && !past.data?.length) && (
        <Card><CardContent className="py-12 text-center text-muted-text">No sessions yet.</CardContent></Card>
      )}
    </div>
  )
}

function SessionCard({ session }: { session: any }) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="hover:border-forest transition-colors">
        <CardContent className="py-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex gap-2 mb-2">
                <Badge variant={session.status === 'live' ? 'destructive' : session.status === 'scheduled' ? 'secondary' : 'outline'}>
                  {session.status === 'live' ? '● LIVE' : session.status}
                </Badge>
                {session.demand_topic && <Badge variant="secondary" className="bg-gold-pale text-gold-foreground">📈 {session.demand_topic}</Badge>}
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">{session.title}</h3>
              <p className="text-sm text-muted-text mt-1">
                🎙️ {session.candidates?.full_name || 'DICO'} · {session.candidates?.party || ''} · {session.candidates?.state || ''}
              </p>
              <div className="flex gap-4 text-xs text-muted-text mt-2">
                <span>👁️ {(session.viewer_count || 0).toLocaleString()}</span>
                <span>❓ {session.question_count || 0} questions</span>
                {session.scheduled_at && <span>📅 {new Date(session.scheduled_at).toLocaleDateString()}</span>}
              </div>
            </div>
            <Button variant={session.status === 'live' ? 'default' : 'outline'} className="shrink-0">
              {session.status === 'live' ? 'Join Now' : 'View'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
