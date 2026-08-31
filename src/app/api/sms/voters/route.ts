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

    const target = getCandidateTargetAreas(candidate)
    
    // 🔴 PAGINATION LOGIC TO BYPASS SUPABASE 1000 ROW LIMIT
    let allVoters: any[] = []
    const batchSize = 1000
    let currentStart = 0
    let hasMore = true

    while (hasMore) {
      // Build a fresh query for each batch
      let batchQuery = supabaseAdmin.from('users')
        .select('id, full_name, phone, lga')
        .eq('role', 'voter')
        .not('phone', 'is', null)

      if (target.scope === 'state') batchQuery = batchQuery.eq('state', target.state)
      else if (target.scope === 'lgas') batchQuery = batchQuery.in('lga', target.lgas)
      else if (target.scope === 'lga') batchQuery = batchQuery.eq('lga', target.lga)
      else if (target.scope === 'ward') batchQuery = batchQuery.eq('lga', target.lga).eq('ward', target.ward)

      // Fetch this specific batch using .range()
      const { data: batch, error } = await batchQuery.range(currentStart, currentStart + batchSize - 1)
      
      if (error) throw error

      if (batch && batch.length > 0) {
        allVoters = allVoters.concat(batch)
      }

      // If the batch was smaller than 1000, we've reached the end
      if (!batch || batch.length < batchSize) {
        hasMore = false
      } else {
        currentStart += batchSize
      }
    }

    const regionName = target.scope === 'state' ? `${target.state} State` 
                     : target.scope === 'lga' ? `${target.lga} LGA` 
                     : target.scope === 'ward' ? `${target.ward} Ward` 
                     : 'your constituency'

    return NextResponse.json({ 
      voters: allVoters, 
      count: allVoters.length,
      regionName
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}