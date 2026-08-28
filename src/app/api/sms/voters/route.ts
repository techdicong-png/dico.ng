import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: candidate } = await supabaseAdmin.from('candidates')
      .select('id, state, lga').eq('user_id', payload.userId).single()

    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // Fetch voters in the candidate's LGA who have a phone number
    const { data: voters, error } = await supabaseAdmin.from('users')
      .select('full_name, phone')
      .eq('role', 'voter')
      .eq('lga', candidate.lga)
      .not('phone', 'is', null)

    if (error) throw error

    return NextResponse.json({ 
      voters: voters || [], 
      count: voters?.length || 0,
      lga: candidate.lga 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}