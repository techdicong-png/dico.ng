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

    // 1. Get candidate's location and office
    const { data: candidate, error: candErr } = await supabaseAdmin.from('candidates')
      .select('id, full_name, state, lga, office')
      .eq('user_id', payload.userId)
      .single()

    if (candErr || !candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // 2. SMART LOGIC: Fetch voters based on office level
    let query = supabaseAdmin.from('users')
      .select('phone')
      .eq('role', 'voter')
      .not('phone', 'is', null)

    const office = (candidate.office || '').toLowerCase()
    
    // If they are running for State/National office, target the whole State
    if (office.includes('senator') || office.includes('governor') || office.includes('president') || office.includes('rep')) {
      query = query.eq('state', candidate.state)
    } else {
      // If they are running for local office, target only their LGA
      query = query.eq('lga', candidate.lga)
    }

    const { data: voters, error: votersErr } = await query

    if (votersErr) throw votersErr
    if (!voters || voters.length === 0) {
      return NextResponse.json({ 
        error: `No voters with phone numbers found in your ${office.includes('senator') ? 'State' : 'LGA'} yet.` 
      }, { status: 400 })
    }

    // 3. Format the message (e.g., "Henry: Vote for progress!")
    const candidateFirstName = candidate.full_name?.split(' ')[0] || 'DICO';
    const fullMessage = `${candidateFirstName}: ${message.trim()}`

    // 4. Format phone numbers (convert 0801... to 234801...)
    const formatPhone = (p: string | null) => {
      if (!p) return null;
      let num = p.replace(/\D/g, ''); // remove spaces/symbols
      if (num.startsWith('0')) num = '234' + num.slice(1);
      if (num.startsWith('234') && num.length === 13) return num; // valid 234 format
      return null;
    }

    const formattedPhones = voters
      .map(v => formatPhone(v.phone))
      .filter((n): n is string => n !== null) // Remove any null/invalid numbers
    
    if (formattedPhones.length === 0) {
      return NextResponse.json({ error: 'No valid phone numbers found for voters in your constituency.' }, { status: 400 })
    }

    // 5. Call the SMS API (Real API if configured, Mock Mode if not)
    const smsApiUrl = process.env.SMS_API_URL
    const apiToken = process.env.SMS_API_TOKEN
    
    if (apiToken && smsApiUrl) {
      // 🔴 REAL SMS MODE
      const recipients = formattedPhones.join(',')
      
      const smsResponse = await fetch(smsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          from: process.env.SMS_SENDER_ID || 'DICO',
          to: recipients,
          body: fullMessage,
          gateway: 'direct-refund' // Recommended for BulkSMSNigeria
        })
      })

      const smsData = await smsResponse.json()

      if (!smsResponse.ok || smsData.status === 'error') {
        console.error('SMS API Error:', smsData)
        throw new Error(smsData.error?.message || 'Failed to send SMS via provider.')
      }
    } else {
      // 🟡 MOCK SMS MODE (For testing/presentation if no API token is set)
      console.log(`[MOCK DIRECT SMS] Sending to ${formattedPhones.length} voters:`);
      console.log(`[MOCK DIRECT SMS] Message: ${fullMessage}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    }
    
    const sentCount = formattedPhones.length;

    // 6. Record the direct campaign in the database
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
      message: `SMS blast sent successfully to ${sentCount} voters in ${candidate.lga || candidate.state}!`,
      recipients: sentCount
    })

  } catch (err: any) {
    console.error('Direct SMS Send Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}