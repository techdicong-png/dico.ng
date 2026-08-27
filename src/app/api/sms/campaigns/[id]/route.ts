import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!['active', 'paused', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Verify ownership
  const { data: candidate } = await supabaseAdmin.from('candidates')
    .select('id').eq('user_id', payload.userId).single()
  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin.from('sms_campaigns')
    .update({ status })
    .eq('id', id)
    .eq('candidate_id', candidate.id)

  if (error) return NextResponse.json({ error: 'Failed to update.' }, { status: 500 })

  return NextResponse.json({ success: true })
}