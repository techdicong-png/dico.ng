// src/app/(dashboard)/candidates/[id]/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  await verifyToken(token)

  const { data: candidate } = await supabaseAdmin.from('candidates')
    .select('*, users!inner(email, created_at)')
    .eq('id', (await params).id).single()

  if (!candidate) return (
    <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
      <p className="text-sm text-muted dark:text-[#c0d0c4]">Candidate not found.</p>
    </div>
  )

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
          <div key={s.label} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
            <div className="pt-4 pb-4 text-center">
              <p className="font-serif text-xl font-black text-forest dark:text-forest-700">{s.value}</p>
              <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bio */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
          <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="text-base font-bold text-ink dark:text-white">🧾 About</h3>
          </div>
          <div className="px-5 py-4">
            {c.bio ? (
              <p className="text-sm text-muted dark:text-[#c0d0c4]">{c.bio}</p>
            ) : (
              <p className="text-sm text-muted dark:text-[#c0d0c4]">No bio provided.</p>
            )}
            {c.manifesto && (
              <div className="mt-4 p-3 bg-forest-faint dark:bg-[#1b3a2b] rounded-lg text-sm">
                <strong className="text-forest dark:text-forest-700">Manifesto:</strong>{' '}
                <span className="text-muted dark:text-[#c0d0c4]">{c.manifesto}</span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
          <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
            <h3 className="text-base font-bold text-ink dark:text-white">📅 Upcoming Sessions</h3>
          </div>
          <div className="px-5 py-4">
            {(!sessions.data || sessions.data.length === 0) ? (
              <p className="text-sm text-muted dark:text-[#c0d0c4]">No upcoming sessions.</p>
            ) : (
              <div className="space-y-3">
                {(sessions.data as any[]).map(s => (
                  <Link key={s.id} href={`/sessions/${s.id}`} className="block border-b border-border-light dark:border-[#1f3a2c] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      {s.status === 'live' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">{s.status}</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-light dark:bg-[#1b3a2b] text-forest-800 dark:text-[#d4ebdf]">{s.status}</span>
                      )}
                      <span className="text-sm font-semibold text-ink dark:text-white">{s.title}</span>
                    </div>
                    <p className="text-xs text-muted dark:text-[#c0d0c4]">
                      {new Date(s.scheduled_at).toLocaleDateString()} · {s.viewer_count || 0} viewers
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Q&As */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="text-base font-bold text-ink dark:text-white">❓ Recent Q&As</h3>
        </div>
        <div className="px-5 py-4">
          {(!qas.data || qas.data.length === 0) ? (
            <p className="text-sm text-muted dark:text-[#c0d0c4]">No answered questions yet.</p>
          ) : (
            <div className="space-y-4">
              {(qas.data as any[]).map(q => (
                <div key={q.id} className="border-l-4 border-forest dark:border-forest-700 pl-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Q: {q.question_text}</p>
                  {q.answer_text && (
                    <p className="text-sm text-muted dark:text-[#c0d0c4] bg-forest-faint dark:bg-[#1b3a2b] p-3 rounded mt-2">A: {q.answer_text}</p>
                  )}
                  <p className="text-xs text-muted dark:text-[#c0d0c4] mt-2">
                    by {q.users?.full_name || 'Voter'} {q.users?.ward ? `· ${q.users.ward}` : ''} · ▲ {q.upvote_count || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
