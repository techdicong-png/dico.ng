// src/app/(dashboard)/polls/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function PollsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  const { data: polls } = await supabaseAdmin.from('polls')
    .select('*, candidates(full_name, party), poll_options(id, option_text, vote_count)')
    .eq('is_active', true).gte('closes_at', new Date().toISOString())
    .order('created_at', { ascending: false }).limit(20)

  const { data: votes } = await supabaseAdmin
    .from('poll_votes').select('poll_id, option_id')
    .eq('user_id', payload.userId).in('poll_id', (polls || []).map(p => p.id))

  const userVotes: Record<string, string> = {}
  ;(votes || []).forEach(v => { userVotes[v.poll_id] = v.option_id })

  const list = (polls || []).map(p => ({ ...p, user_vote: userVotes[p.id] || null }))

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Civic Polls · +10 CIVICT per vote
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Community Polls</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4] max-w-lg">Vote on live constituency issues and earn CIVICT.</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
          <p className="text-sm text-muted dark:text-[#c0d0c4]">No active polls right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(poll => {
            const total = poll.total_votes || 0
            const voted = !!poll.user_vote
            const closed = new Date(poll.closes_at) < new Date()
            return (
              <div key={poll.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
                <div className="pt-5 px-5 pb-5">
                  <div className="flex gap-2 mb-3">
                    {closed ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Closed</span>
                    ) : voted ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-light dark:bg-[#1b3a2b] text-forest-800 dark:text-[#d4ebdf]">Voted</span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Active</span>
                    )}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-faint dark:bg-[#1b3a2b] text-muted dark:text-[#c0d0c4]">{poll.scope}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-white mb-4">{poll.question}</h3>

                  {(poll.poll_options || []).map((opt: { id: string; option_text: string; vote_count: number }) => {
                    const pct = total ? Math.round((opt.vote_count / total) * 100) : 0
                    const isVoted = poll.user_vote === opt.id
                    return (
                      <div key={opt.id} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isVoted ? 'font-bold text-forest dark:text-forest-700' : 'text-ink dark:text-white'}>{opt.option_text}{isVoted ? ' ✓' : ''}</span>
                          <span className="text-muted dark:text-[#c0d0c4]">{pct}% ({opt.vote_count})</span>
                        </div>
                        <div className="h-1.5 bg-border dark:bg-[#1f3a2c] rounded-full">
                          <div className={`h-1.5 rounded-full transition-all ${isVoted ? 'bg-forest' : 'bg-gold'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-border-light dark:border-[#1f3a2c] text-xs text-muted dark:text-[#c0d0c4]">
                    <span>{total.toLocaleString()} votes</span>
                    {!voted && !closed && (
                      <Link href={`/api/polls/${poll.id}/vote`}
                        className="bg-forest hover:bg-forest-mid text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
                        Vote +10 ₡
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
