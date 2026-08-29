import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// 🔴 Reusing the exact same classification logic from the Voter Dashboard
function classifyCandidate(office: string): 'national' | 'state' | 'lga' | 'ward' | 'other' {
  const o = (office || '').toLowerCase()
  if (o.includes('president') || o.includes('senator') || o.includes('rep')) return 'national'
  if (o.includes('governor') || o.includes('assembly')) return 'state'
  if (o.includes('chairman') || o.includes('lga')) return 'lga'
  if (o.includes('councillor') || o.includes('ward')) return 'ward'
  return 'other'
}

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
      .select('id, state, lga, ward, office').eq('user_id', payload.userId).single()

    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    const level = classifyCandidate(candidate.office)
    let query = supabaseAdmin.from('users')
      .select('full_name, phone, lga, ward')
      .eq('role', 'voter')
      .not('phone', 'is', null)

    let regionName = 'your constituency'

    // 🔴 Target audience based on exact political level
    if (level === 'national' || level === 'state') {
      query = query.eq('state', candidate.state)
      regionName = `${candidate.state} State`
    } else if (level === 'lga') {
      query = query.eq('lga', candidate.lga)
      regionName = `${candidate.lga} LGA`
    } else if (level === 'ward') {
      query = query.eq('ward', candidate.ward)
      regionName = `${candidate.ward} Ward`
    } else {
      query = query.eq('lga', candidate.lga)
      regionName = `${candidate.lga} LGA`
    }

    const { data: voters, error } = await query

    if (error) throw error

    return NextResponse.json({ 
      voters: voters || [], 
      count: voters?.length || 0,
      regionName: regionName
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}