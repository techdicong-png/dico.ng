// src/app/(dashboard)/dashboard/candidate/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Candidate Command Centre
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Welcome, {user.full_name?.split(' ')[0]} 🎙️</h1>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href="/sessions"><Button className="bg-forest hover:bg-forest-mid">Schedule Live Session</Button></Link>
        <Link href="/polls"><Button variant="outline">Create Poll</Button></Link>
        <Link href="/profile"><Button variant="outline">Edit Profile</Button></Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Reputation', value: (c?.reputation_score || 0).toLocaleString(), gold: true },
          { label: 'Followers', value: (c?.follower_count || 0).toLocaleString() },
          { label: 'Q&As Answered', value: c?.qa_count || 0 },
          { label: 'Sessions', value: sList.filter(s => s.status === 'ended').length },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">{stat.label}</p>
              <p className={`font-serif text-3xl font-black ${stat.gold ? 'text-gold' : 'text-forest'}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">❓ Pending Questions</CardTitle>
              <Badge variant="secondary">{qList.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {qList.length === 0 ? (
              <p className="text-sm text-muted-text text-center py-4">No pending questions. Great work! 🎉</p>
            ) : (
              <div className="space-y-3">
                {qList.map((q: any) => (
                  <div key={q.id} className="border-b border-border-light pb-3 last:border-0">
                    <p className="text-sm text-ink mb-1">{q.question_text}</p>
                    <p className="text-xs text-muted-text">
                      by {q.users?.full_name || 'Voter'} · ▲ {q.upvote_count || 0}
                    </p>
                    <Link href={`/sessions/${q.session_id || ''}`}>
                      <Button size="sm" variant="outline" className="mt-2 text-xs">Answer (+20 RP)</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">📅 My Sessions</CardTitle></CardHeader>
          <CardContent>
            {sList.length === 0 ? (
              <p className="text-sm text-muted-text text-center py-4">No sessions yet. Schedule one.</p>
            ) : (
              <div className="space-y-3">
                {sList.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex justify-between items-center border-b border-border-light pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-ink">{s.title}</p>
                      <p className="text-xs text-muted-text">{s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : ''} · {s.viewer_count || 0} viewers</p>
                    </div>
                    <Badge variant={s.status === 'live' ? 'destructive' : s.status === 'ended' ? 'default' : 'secondary'}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">📋 Community Reports — Awaiting Response</CardTitle></CardHeader>
        <CardContent>
          {rList.length === 0 ? (
            <p className="text-sm text-muted-text text-center py-4">No pending reports in your area.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] font-bold tracking-wider uppercase text-muted-text">
                    <th className="pb-2 pr-4">Title</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Ward</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rList.map((r: any) => (
                    <tr key={r.id} className="border-b border-border-light">
                      <td className="py-3 pr-4 font-medium text-ink">{r.title}</td>
                      <td className="py-3 pr-4"><Badge variant="outline">{r.category}</Badge></td>
                      <td className="py-3 pr-4 text-xs text-muted-text">{r.ward || '–'}</td>
                      <td className="py-3 pr-4 text-xs text-muted-text">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="py-3"><Button size="sm" variant="outline">Respond</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
