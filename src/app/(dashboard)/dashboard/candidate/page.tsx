import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { CandidateHub } from '@/components/dashboard/CandidateHub'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function CandidateDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) redirect('/login')

  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  const { data: candidate } = await supabaseServer
    .from('candidates')
    .select('id, full_name, lga, avatar_url')
    .eq('user_id', payload.userId)
    .single()

  // 🔴 NEW: Show a Pending Approval screen instead of redirecting!
  if (!candidate) {
    return (
      <div className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-8 text-center max-w-md mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2 text-ink dark:text-white">Profile Pending</h2>
        <p className="text-muted dark:text-[#c0d0c4]">Your candidate profile is currently under review by our admin team. You will be notified by email once it is approved. Please check back later.</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      <CandidateHub 
        candidateId={candidate.id} 
        initialName={candidate.full_name} 
        candidateLga={candidate.lga || 'Unknown'} 
        avatarUrl={candidate.avatar_url}
      />
    </div>
  )
}