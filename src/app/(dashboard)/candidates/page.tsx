// src/app/(dashboard)/candidates/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CandidatesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  await verifyToken(token)

  const { data: candidates } = await supabaseAdmin.from('candidates')
    .select('*, users!inner(email)')
    .eq('is_active', true)
    .order('reputation_score', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Candidates
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Find Your Representatives</h1>
        <p className="text-sm text-muted-text max-w-lg">Browse candidates, ask questions, follow their progress.</p>
      </div>

      {(!candidates || candidates.length === 0) ? (
        <Card><CardContent className="py-12 text-center text-muted-text">No candidates found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(candidates as any[]).map(c => (
            <Card key={c.id} className="hover:border-forest transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-forest text-white font-serif text-lg font-black flex items-center justify-center shrink-0">
                    {c.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-ink truncate">{c.full_name}</h3>
                      {c.is_verified && <Badge variant="secondary" className="text-[10px] bg-forest-light text-forest">✓ Verified</Badge>}
                    </div>
                    <p className="text-xs text-muted-text">{c.party} · {c.office}</p>
                    <p className="text-xs text-muted-text">📍 {c.state}{c.lga ? ` · ${c.lga}` : ''}</p>
                  </div>
                </div>

                {c.bio && <p className="text-sm text-muted-text line-clamp-2 mb-4">{c.bio}</p>}

                <div className="flex gap-4 py-3 border-y border-border-light mb-4">
                  {[
                    { label: 'Rep Score', value: (c.reputation_score || 0).toLocaleString() },
                    { label: 'Followers', value: (c.follower_count || 0).toLocaleString() },
                    { label: 'Q&As', value: c.qa_count || 0 },
                  ].map(stat => (
                    <div key={stat.label} className="text-center flex-1">
                      <p className="font-serif text-sm font-bold text-forest">{stat.value}</p>
                      <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <Link href={`/candidates/${c.id}`}>
                  <Button className="w-full bg-forest hover:bg-forest-mid">View Profile</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
