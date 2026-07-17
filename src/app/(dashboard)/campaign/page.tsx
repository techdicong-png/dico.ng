// src/app/(dashboard)/dashboard/campaign/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CampaignDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'campaign_team') redirect('/dashboard')

  const { data: memberships } = await supabaseAdmin.from('campaign_team_members')
    .select('*, candidates(id, full_name, party, office, state, reputation_score)')
    .eq('user_id', payload.userId)

  const [sessions, polls, reports] = await Promise.all([
    supabaseAdmin.from('live_sessions')
      .select('id, title, scheduled_at, status, viewer_count')
      .eq('status', 'scheduled').order('scheduled_at').limit(5),
    supabaseAdmin.from('polls')
      .select('id, question, total_votes, closes_at')
      .eq('is_active', true).limit(5),
    supabaseAdmin.from('reports')
      .select('id, title, category, ward, created_at')
      .eq('status', 'submitted').limit(5),
  ])

  const mList = (memberships || []) as any[]
  const sList = (sessions.data || []) as any[]
  const pList = (polls.data || []) as any[]
  const rList = (reports.data || []) as any[]

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Campaign Team
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Team Dashboard</h1>
        <p className="text-sm text-muted-text">Manage sessions, track engagement, support your candidate.</p>
      </div>

      {mList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mList.map((m: any) => (
            <Card key={m.id} className="border-forest">
              <CardContent className="pt-6">
                <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Your Candidate</p>
                <h3 className="font-serif text-lg font-bold text-ink">{m.candidates?.full_name}</h3>
                <p className="text-sm text-muted-text">{m.candidates?.party} · {m.candidates?.office} · {m.candidates?.state}</p>
                <div className="flex gap-2 mt-3">
                  <Link href="/analytics"><Button size="sm" className="bg-forest hover:bg-forest-mid">Analytics</Button></Link>
                  <Link href={`/candidates/${m.candidates?.id}`}><Button size="sm" variant="outline">Profile</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">📡 Upcoming Sessions</CardTitle>
              <Link href="/sessions"><Button size="sm" variant="outline">Schedule</Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            {sList.length === 0 ? <p className="text-sm text-muted-text text-center py-4">None scheduled.</p>
              : sList.map(s => (
                <div key={s.id} className="flex justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-ink">{s.title}</p>
                    <p className="text-xs text-muted-text">{s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : ''}</p>
                  </div>
                  <Badge variant="secondary">{s.status}</Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">🗳️ Active Polls</CardTitle>
              <Link href="/polls"><Button size="sm" variant="outline">Create</Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            {pList.length === 0 ? <p className="text-sm text-muted-text text-center py-4">No active polls.</p>
              : pList.map(p => (
                <div key={p.id} className="py-2 border-b last:border-0">
                  <p className="text-sm font-semibold text-ink">{p.question}</p>
                  <p className="text-xs text-muted-text">{p.total_votes} votes</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">📋 Pending Reports</CardTitle></CardHeader>
        <CardContent>
          {rList.length === 0 ? <p className="text-sm text-muted-text text-center py-4">No pending reports.</p>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-[10px] font-bold tracking-wider uppercase text-muted-text">
                      <th className="pb-2 pr-4">Title</th>
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4">Ward</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rList.map((r: any) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium text-ink">{r.title}</td>
                        <td className="py-3 pr-4"><Badge variant="outline">{r.category}</Badge></td>
                        <td className="py-3 pr-4 text-xs text-muted-text">{r.ward || '–'}</td>
                        <td className="py-3"><Button size="sm" variant="outline">Respond</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </CardContent>
      </Card>
    </div>
  )
}
