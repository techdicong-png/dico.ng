import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { InviteLink } from '@/components/dashboard/InviteLink'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Vote, Video, CircleDollarSign, FileText, ChevronRight, MapPin } from 'lucide-react'
import Image from 'next/image'
import {SmsTaskWidget} from '@/components/dashboard/SmsTaskWidget'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// 🔴 NEW: Classify each candidate into EXACTLY ONE bucket so nobody appears twice
function classifyCandidate(office: string): 'national' | 'state' | 'lga' | 'ward' | 'other' {
  const o = (office || '').toLowerCase()
  if (o.includes('president') || o.includes('senator') || o.includes('rep')) return 'national'
  if (o.includes('governor') || o.includes('assembly')) return 'state'
  if (o.includes('chairman') || o.includes('lga')) return 'lga'
  if (o.includes('councillor') || o.includes('ward')) return 'ward'
  return 'other'
}

export default async function VoterDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  
  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  // Fetch user's CIVICT balance
  const { data: userData } = await supabaseServer.from('users').select('civict_balance').eq('id', user.id).single()
  const balance = userData?.civict_balance ?? 0

  // 🔴 FIXED: ONE single query (replaces BOTH old queries)
  const locationFilters: string[] = []
  if (user.state) locationFilters.push(`state.eq.${user.state}`)
  if (user.lga) locationFilters.push(`lga.eq.${user.lga}`)
  if (user.ward) locationFilters.push(`ward.eq.${user.ward}`)

  let candidatesQuery = supabaseServer
    .from('candidates')
    .select('id, full_name, party, office, avatar_url, state, lga, ward')
    .eq('is_active', true)

  if (locationFilters.length > 0) {
    candidatesQuery = candidatesQuery.or(locationFilters.join(','))
  } else {
    candidatesQuery = candidatesQuery.limit(10)
  }

  const { data: rawCandidates } = await candidatesQuery

  // 🔴 NEW: Safety net — dedupe by ID in case duplicate rows exist in the DB
  const candidates = Array.from(
    new Map((rawCandidates || []).map(c => [c.id, c])).values()
  )

  // 🔴 FIXED: Mutually exclusive grouping — each candidate lands in ONE section only
  const nationalReps = candidates.filter(c => classifyCandidate(c.office) === 'national')
  const stateReps = candidates.filter(c => classifyCandidate(c.office) === 'state')
  const lgaReps = candidates.filter(c => classifyCandidate(c.office) === 'lga')
  const wardReps = candidates.filter(c => classifyCandidate(c.office) === 'ward')

  const stats = [
    { icon: Vote, label: 'Polls Voted', value: '0', change: 'Participate to earn', href: '/polls' },
    { icon: Video, label: 'Townhalls', value: '0', change: 'Join live sessions', href: '/sessions' },
    { icon: CircleDollarSign, label: 'CIVICT Balance', value: `₡ ${balance.toLocaleString()}`, change: 'Redeem for Naira', href: '/wallet', gold: true },
    { icon: FileText, label: 'Reports Filed', value: '0', change: 'Earn 15 CIVICT', href: '/reports' },
  ]

  const lgaSlug = user.lga?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Voter Dashboard
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">
          Welcome back, <span className="text-gold">{user.full_name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">
          {user.lga ? `${user.lga} LGA` : ''} {user.state ? `· ${user.state} State` : ''}
        </p>
      </div>

      {/* LGA HUB LINK */}
      {user.lga && (
        <Link href={`/lga/${lgaSlug}`} className="bg-forest text-white rounded-xl p-5 flex items-center justify-between hover:bg-forest-mid transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-bold text-sm">View {user.lga} LGA Hub</h3>
              <p className="text-xs text-white/70">See local services, ads, and community updates</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-white/50 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* INVITE FRIENDS LINK */}
      <InviteLink userId={user.id} />

      {/* Nag users to complete their location */}
      {(!user.state || !user.lga) && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation text-gold"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink dark:text-white">Complete Your Profile</h3>
              <p className="text-xs text-muted dark:text-[#c0d0c4]">Please set your State and LGA to see representatives in your constituency.</p>
            </div>
          </div>
          <Link href="/profile" className="bg-gold hover:bg-gold-hover text-ink text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap">
            Update Location
          </Link>
        </div>
      )}

      <SmsTaskWidget />

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5 hover:border-forest dark:hover:border-gold/30 hover:-translate-y-0.5 transition-all block">
            <div className={`w-9 h-9 rounded-lg ${s.gold ? 'bg-gold-light dark:bg-[rgba(212,169,63,0.16)]' : 'bg-mint dark:bg-[#1b3a2b]'} flex items-center justify-center mb-3`}>
              <s.icon className={`h-[18px] w-[18px] ${s.gold ? 'text-gold' : 'text-forest dark:text-forest-700'}`} />
            </div>
            <p className="font-serif text-2xl font-black text-ink dark:text-white">{s.value}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mt-1">{s.label}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{s.change}</p>
          </Link>
        ))}
      </div>

      {/* MY REPRESENTATIVES */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="font-serif text-base font-bold text-ink dark:text-white">Your Representatives</h3>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">Candidates running in your constituency across all levels</p>
        </div>
        
        <div className="divide-y divide-border-light dark:divide-[#1f3a2c]">
          {/* National & Senatorial */}
          {nationalReps.length > 0 && (
            <div className="px-5 py-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#c0d0c4] mb-3">National & Senatorial</h4>
              <div className="space-y-3">
                {nationalReps.map((c: any) => (
                  <Link href={`/candidates/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-forest-faint dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {c.avatar_url ? <Image src={c.avatar_url} alt={c.full_name} width={40} height={40} className="w-full h-full object-cover" /> : c.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink dark:text-white">{c.full_name}</p>
                      <p className="text-xs text-muted dark:text-[#c0d0c4]">{c.office} · {c.party}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted dark:text-[#c0d0c4]" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* State Level */}
          {stateReps.length > 0 && (
            <div className="px-5 py-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#c0d0c4] mb-3">State Level</h4>
              <div className="space-y-3">
                {stateReps.map((c: any) => (
                  <Link href={`/candidates/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-forest-faint dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {c.avatar_url ? <Image src={c.avatar_url} alt={c.full_name} width={40} height={40} className="w-full h-full object-cover" /> : c.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink dark:text-white">{c.full_name}</p>
                      <p className="text-xs text-muted dark:text-[#c0d0c4]">{c.office} · {c.party}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted dark:text-[#c0d0c4]" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* LGA Level */}
          {lgaReps.length > 0 && (
            <div className="px-5 py-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#c0d0c4] mb-3">Local Government (LGA)</h4>
              <div className="space-y-3">
                {lgaReps.map((c: any) => (
                  <Link href={`/candidates/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-forest-faint dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {c.avatar_url ? <Image src={c.avatar_url} alt={c.full_name} width={40} height={40} className="w-full h-full object-cover" /> : c.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink dark:text-white">{c.full_name}</p>
                      <p className="text-xs text-muted dark:text-[#c0d0c4]">{c.office} · {c.party}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted dark:text-[#c0d0c4]" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ward Level */}
          {wardReps.length > 0 && (
            <div className="px-5 py-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#c0d0c4] mb-3">Ward Level</h4>
              <div className="space-y-3">
                {wardReps.map((c: any) => (
                  <Link href={`/candidates/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-forest-faint dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {c.avatar_url ? <Image src={c.avatar_url} alt={c.full_name} width={40} height={40} className="w-full h-full object-cover" /> : c.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink dark:text-white">{c.full_name}</p>
                      <p className="text-xs text-muted dark:text-[#c0d0c4]">{c.office} · {c.party}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted dark:text-[#c0d0c4]" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {candidates.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted dark:text-[#c0d0c4]">No candidates have registered in your specific constituency yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}