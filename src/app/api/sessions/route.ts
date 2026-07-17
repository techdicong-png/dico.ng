// src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabaseAdmin.from('live_sessions')
    .select('*, candidates(id, full_name, party, state)')
    .order('scheduled_at', { ascending: false })
    .limit(30)

  if (status) query = query.eq('status', status)

  const { data } = await query
  return NextResponse.json({ sessions: data || [] })
}
