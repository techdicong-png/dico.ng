import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getCandidateTargetAreas } from '@/lib/political-mapping'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const user = await getAuthUser(payload.userId)
  if (!user) return NextResponse.json({ campaigns: [] })

  // 1. Fetch ALL active campaigns in the voter's state
  const { data: campaigns } = await supabaseAdmin.from('sms_campaigns')
    .select('*, candidates(full_name, state, lga, ward, senatorial_district, federal_constituency, office)')
    .eq('status', 'active')
    .eq('target_state', user.state) 
    .order('created_at', { ascending: false })

  // 2. Filter them in JS using our Political Mapping
  const availableCampaigns = (campaigns || []).filter(c => {
    if (!c.candidates) return false
    const target = getCandidateTargetAreas(c.candidates)
    
    if (target.scope === 'all') return true 
    if (target.scope === 'state') return true 
    if (target.scope === 'lgas') return target.lgas.includes(user.lga)
    if (target.scope === 'lga') return c.candidates.lga === user.lga
    if (target.scope === 'ward') return c.candidates.lga === user.lga && c.candidates.ward === user.ward
    return false
  })

  // 3. Remove campaigns the voter already completed
  const { data: completedTasks } = await supabaseAdmin.from('sms_tasks')
    .select('campaign_id').eq('voter_id', payload.userId)
  const completedIds = (completedTasks || []).map(t => t.campaign_id)

  const finalCampaigns = availableCampaigns.filter(c => !completedIds.includes(c.id))

  return NextResponse.json({ campaigns: finalCampaigns })
}