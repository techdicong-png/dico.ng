import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: candidate } = await supabaseAdmin.from('candidates')
    .select('id').eq('user_id', payload.userId).single()

  if (!candidate) return NextResponse.json({ campaigns: [] })

  const { data: campaigns } = await supabaseAdmin.from('sms_campaigns')
    .select('*')
    .eq('candidate_id', candidate.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ campaigns: campaigns || [] })
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { message } = await req.json()

  if (!message || message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
  }
  if (message.length > 160) {
    return NextResponse.json({ error: 'Message must be 160 characters or less.' }, { status: 400 })
  }

  const { data: candidate } = await supabaseAdmin.from('candidates')
    .select('id, state, lga').eq('user_id', payload.userId).single()

  if (!candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

  const { data: campaign, error } = await supabaseAdmin.from('sms_campaigns').insert({
    candidate_id: candidate.id,
    message: message.trim(),
    reward_civict: 15,
    target_state: candidate.state,
    target_lga: candidate.lga,
    status: 'active'
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to create campaign.' }, { status: 500 })

  return NextResponse.json({ campaign })
}