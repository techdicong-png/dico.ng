import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { SmsCampaignManager } from '@/components/dashboard/SmsCampaignManager'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function SmsCampaignsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) redirect('/login')

  const { data: candidate } = await supabaseServer.from('candidates')
    .select('id, full_name, state, lga').eq('user_id', payload.userId).single()

  if (!candidate) {
    return <div className="bg-white dark:bg-[#11241b] p-8 text-center rounded-xl">Profile Pending</div>
  }

  const { data: campaigns } = await supabaseServer.from('sms_campaigns')
    .select('*').eq('candidate_id', candidate.id).order('created_at', { ascending: false })

  return <SmsCampaignManager candidateName={candidate.full_name} initialCampaigns={campaigns || []} />
}