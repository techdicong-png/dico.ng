// src/app/api/team/candidate/[candidateId]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: Promise<{ candidateId: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { data } = await supabaseAdmin.from('campaign_team_members')
    .select('*, users!inner(id, full_name, email, ward, lga)')
    .eq('candidate_id', (await params).candidateId)

  return NextResponse.json({ team: data || [] })
}
