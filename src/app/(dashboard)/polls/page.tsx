// src/app/(dashboard)/polls/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Civic Polls · +10 CIVICT per vote
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Community Polls</h1>
        <p className="text-sm text-muted-text max-w-lg">Vote on live constituency issues and earn CIVICT.</p>
      </div>

      {list.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-text">No active polls right now.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(poll => {
            const total = poll.total_votes || 0
            const voted = !!poll.user_vote
            const closed = new Date(poll.closes_at) < new Date()
            return (
              <Card key={poll.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-2 mb-3">
                    <Badge variant={closed ? 'destructive' : voted ? 'secondary' : 'default'}>
                      {closed ? 'Closed' : voted ? 'Voted' : 'Active'}
                    </Badge>
                    <Badge variant="outline">{poll.scope}</Badge>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink mb-4">{poll.question}</h3>

                  {(poll.poll_options || []).map((opt: { id: string; option_text: string; vote_count: number }) => {
                    const pct = total ? Math.round((opt.vote_count / total) * 100) : 0
                    const isVoted = poll.user_vote === opt.id
                    return (
                      <div key={opt.id} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isVoted ? 'font-bold text-forest' : 'text-ink'}>{opt.option_text}{isVoted ? ' ✓' : ''}</span>
                          <span className="text-muted-text">{pct}% ({opt.vote_count})</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full">
                          <div className={`h-1.5 rounded-full transition-all ${isVoted ? 'bg-forest' : 'bg-gold'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-border-light text-xs text-muted-text">
                    <span>{total.toLocaleString()} votes</span>
                    {!voted && !closed && (
                      <Link href={`/api/polls/${poll.id}/vote`}>
                        <Button size="sm" className="bg-forest hover:bg-forest-mid">Vote +10 ₡</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
