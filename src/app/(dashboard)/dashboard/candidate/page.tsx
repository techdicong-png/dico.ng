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
  if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) redirect('/dashboard')

  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  // Fetch the candidate profile linked to this user
  const { data: candidate } = await supabaseServer
    .from('candidates')
    .select('id, full_name')
    .eq('user_id', payload.userId)
    .single()

  if (!candidate) {
    return (
      <div className="bg-white border border-border rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Profile Pending</h2>
        <p className="text-muted">Your candidate profile is still under review. Please check back later.</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      <CandidateHub candidateId={candidate.id} initialName={candidate.full_name} />
    </div>
  )
}