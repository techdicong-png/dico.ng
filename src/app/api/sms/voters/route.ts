import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getCandidateTargetAreas } from '@/lib/political-mapping'

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
      .select('id, state, lga, ward, senatorial_district, federal_constituency, office')
      .eq('user_id', payload.userId)
      .single()

    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // 🔴 SMART TARGETING
    const target = getCandidateTargetAreas(candidate)
    let query = supabaseAdmin.from('users')
      .select('full_name, phone, lga')
      .eq('role', 'voter')
      .not('phone', 'is', null)

    if (target.scope === 'state') query = query.eq('state', target.state)
    else if (target.scope === 'lgas') query = query.in('lga', target.lgas)
    else if (target.scope === 'lga') query = query.eq('lga', target.lga)
    else if (target.scope === 'ward') query = query.eq('lga', target.lga).eq('ward', target.ward)

    const { data: voters, error } = await query
    if (error) throw error

    // 🔴 TS FIX: Safely determine the region name based on scope
    const regionName = target.scope === 'state' ? `${target.state} State` 
                     : target.scope === 'lga' ? `${target.lga} LGA` 
                     : target.scope === 'ward' ? `${target.ward} Ward` 
                     : 'your constituency';

    return NextResponse.json({ 
      voters: voters || [], 
      count: voters?.length || 0,
      regionName
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}