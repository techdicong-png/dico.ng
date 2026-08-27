import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const user = await getAuthUser(payload.userId)
  if (!user) return NextResponse.json({ campaigns: [] })

  const { data: campaigns } = await supabaseAdmin.from('sms_campaigns')
    .select('*, candidates(full_name)')
    .eq('status', 'active')
    .or(`target_state.eq.${user.state},target_lga.eq.${user.lga}`)
    .order('created_at', { ascending: false })

  const { data: completedTasks } = await supabaseAdmin.from('sms_tasks')
    .select('campaign_id').eq('voter_id', payload.userId)

  const completedIds = (completedTasks || []).map(t => t.campaign_id)
  const availableCampaigns = (campaigns || []).filter(c => !completedIds.includes(c.id))

  return NextResponse.json({ campaigns: availableCampaigns })
}