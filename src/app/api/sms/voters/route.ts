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
      .select('id, state, lga, office').eq('user_id', payload.userId).single()

    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // 🔴 SMART LOGOGIC: Match by State for Senatorial/Governor, LGA for local races
    let query = supabaseAdmin.from('users')
      .select('full_name, phone, lga')
      .eq('role', 'voter')
      .not('phone', 'is', null)

    const office = (candidate.office || '').toLowerCase()
    if (office.includes('senator') || office.includes('governor') || office.includes('president') || office.includes('rep')) {
      // State/National level: Fetch all voters in the state
      query = query.eq('state', candidate.state)
    } else {
      // LGA/Ward level: Fetch only voters in that specific LGA
      query = query.eq('lga', candidate.lga)
    }

    const { data: voters, error } = await query

    if (error) throw error

    return NextResponse.json({ 
      voters: voters || [], 
      count: voters?.length || 0,
      lga: candidate.lga,
      state: candidate.state
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}