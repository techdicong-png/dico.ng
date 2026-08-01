// src/app/(dashboard)/candidates/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
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
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Candidates
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Find Your Representatives</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4] max-w-lg">Browse candidates, ask questions, follow their progress.</p>
      </div>

      {(!candidates || candidates.length === 0) ? (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
          <p className="text-sm text-muted dark:text-[#c0d0c4]">No candidates found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(candidates as any[]).map(c => (
            <div key={c.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl hover:border-forest dark:hover:border-gold/30 transition-colors overflow-hidden">
              <div className="pt-6 px-5 pb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-white font-serif text-lg font-black shrink-0">
                    {c.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-ink dark:text-white truncate">{c.full_name}</h3>
                      {c.is_verified && (
                        <span className="text-[10px] font-bold bg-forest-light dark:bg-[#1b3a2b] text-forest-800 dark:text-[#d4ebdf] px-1.5 py-0.5 rounded">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-muted dark:text-[#c0d0c4]">{c.party} · {c.office}</p>
                    <p className="text-xs text-muted dark:text-[#c0d0c4]">📍 {c.state}{c.lga ? ` · ${c.lga}` : ''}</p>
                  </div>
                </div>

                {c.bio && <p className="text-sm text-muted dark:text-[#c0d0c4] line-clamp-2 mb-4">{c.bio}</p>}

                <div className="flex gap-4 py-3 border-y border-border-light dark:border-[#1f3a2c] mb-4">
                  {[
                    { label: 'Rep Score', value: (c.reputation_score || 0).toLocaleString() },
                    { label: 'Followers', value: (c.follower_count || 0).toLocaleString() },
                    { label: 'Q&As', value: c.qa_count || 0 },
                  ].map(stat => (
                    <div key={stat.label} className="text-center flex-1">
                      <p className="font-serif text-sm font-bold text-forest dark:text-forest-700">{stat.value}</p>
                      <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <Link href={`/candidates/${c.id}`}
                  className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-forest hover:bg-forest-mid text-white transition-all">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
