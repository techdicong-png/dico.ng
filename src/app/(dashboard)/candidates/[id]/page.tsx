// src/app/(dashboard)/candidates/[id]/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  await verifyToken(token)

  const { data: candidate } = await supabaseAdmin.from('candidates')
    .select('*, users!inner(email, created_at)')
    .eq('id', (await params).id).single()

  if (!candidate) return <Card><CardContent className="py-12 text-center">Candidate not found.</CardContent></Card>

  const [qas, sessions] = await Promise.all([
    supabaseAdmin.from('questions')
      .select('id, question_text, answer_text, created_at, upvote_count, users(full_name, ward)')
      .eq('candidate_id', (await params).id).not('answer_text', 'is', null)
      .order('upvote_count', { ascending: false }).limit(5),
    supabaseAdmin.from('live_sessions')
      .select('id, title, scheduled_at, status, viewer_count, topic')
      .eq('candidate_id', (await params).id).gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at').limit(3),
  ])

  const c = candidate as any

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#071E12] to-[#0F5438] rounded-xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/40 text-gold font-serif text-3xl font-black flex items-center justify-center shrink-0">
            {c.full_name?.[0] || '?'}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-black">{c.full_name}</h1>
            <p className="text-white/60 text-sm">{c.party} · {c.office} · {c.state}{c.lga ? ` / ${c.lga}` : ''}</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl font-black text-gold">{(c.reputation_score || 0).toLocaleString()}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-white/40">Reputation</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Followers', value: (c.follower_count || 0).toLocaleString() },
          { label: 'Q&As', value: c.qa_count || 0 },
          { label: 'Reputation', value: (c.reputation_score || 0).toLocaleString() },
          { label: 'Verified', value: c.is_verified ? '✓ Yes' : 'Pending' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <p className="font-serif text-xl font-black text-forest">{s.value}</p>
              <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bio */}
        <Card>
          <CardHeader><CardTitle className="text-base">🧾 About</CardTitle></CardHeader>
          <CardContent>
            {c.bio ? <p className="text-sm text-muted-text">{c.bio}</p> : <p className="text-sm text-muted-text">No bio provided.</p>}
            {c.manifesto && (
              <div className="mt-4 p-3 bg-forest-faint rounded-lg text-sm">
                <strong className="text-forest">Manifesto:</strong> {c.manifesto}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        <Card>
          <CardHeader><CardTitle className="text-base">📅 Upcoming Sessions</CardTitle></CardHeader>
          <CardContent>
            {(!sessions.data || sessions.data.length === 0) ? (
              <p className="text-sm text-muted-text">No upcoming sessions.</p>
            ) : (
              <div className="space-y-3">
                {(sessions.data as any[]).map(s => (
                  <Link key={s.id} href={`/sessions/${s.id}`} className="block border-b border-border-light pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={s.status === 'live' ? 'destructive' : 'secondary'} className="text-[10px]">{s.status}</Badge>
                      <span className="text-sm font-semibold text-ink">{s.title}</span>
                    </div>
                    <p className="text-xs text-muted-text">{new Date(s.scheduled_at).toLocaleDateString()} · {s.viewer_count || 0} viewers</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Q&As */}
      <Card>
        <CardHeader><CardTitle className="text-base">❓ Recent Q&As</CardTitle></CardHeader>
        <CardContent>
          {(!qas.data || qas.data.length === 0) ? (
            <p className="text-sm text-muted-text">No answered questions yet.</p>
          ) : (
            <div className="space-y-4">
              {(qas.data as any[]).map(q => (
                <div key={q.id} className="border-l-4 border-forest pl-4">
                  <p className="text-sm font-semibold text-ink">Q: {q.question_text}</p>
                  {q.answer_text && (
                    <p className="text-sm text-muted-text bg-forest-faint p-3 rounded mt-2">A: {q.answer_text}</p>
                  )}
                  <p className="text-xs text-muted-text mt-2">
                    by {q.users?.full_name || 'Voter'} {q.users?.ward ? `· ${q.users.ward}` : ''} · ▲ {q.upvote_count || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
