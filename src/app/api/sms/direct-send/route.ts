import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
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

    // 1. Get candidate's location
    const { data: candidate } = await supabaseAdmin.from('candidates')
      .select('id, full_name, state, lga').eq('user_id', payload.userId).single()

    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // 2. Fetch all voters in that LGA who have a phone number
    const { data: voters, error: votersErr } = await supabaseAdmin.from('users')
      .select('phone')
      .eq('role', 'voter')
      .eq('lga', candidate.lga)
      .not('phone', 'is', null)

    if (votersErr) throw votersErr
    if (!voters || voters.length === 0) {
      return NextResponse.json({ error: 'No voters with phone numbers found in your constituency yet.' }, { status: 400 })
    }

    // 3. Format message
    const candidateFirstName = candidate.full_name?.split(' ')[0] || 'DICO';
    const fullMessage = `${candidateFirstName}: ${message}`
    const phoneNumbers = voters.map(v => v.phone).filter(Boolean) as string[]

    // 🟡 MOCK SMS MODE (For Presentation)
    console.log(`[MOCK DIRECT SMS] Sending to ${phoneNumbers.length} voters in ${candidate.lga}:`);
    console.log(`[MOCK DIRECT SMS] Message: ${fullMessage}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // 4. Record the direct campaign
    await supabaseAdmin.from('sms_campaigns').insert({
      candidate_id: candidate.id,
      message: message.trim(),
      reward_civict: 0, // No reward for direct blasts
      target_state: candidate.state,
      target_lga: candidate.lga,
      status: 'completed' // Mark as completed immediately since it was a one-time blast
    })

    return NextResponse.json({ 
      success: true, 
      message: `SMS blast sent successfully to ${phoneNumbers.length} voters in ${candidate.lga}!`,
      recipients: phoneNumbers.length
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}