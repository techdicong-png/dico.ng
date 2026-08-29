import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function classifyCandidate(office: string): 'national' | 'state' | 'lga' | 'ward' | 'other' {
  const o = (office || '').toLowerCase()
  if (o.includes('president') || o.includes('senator') || o.includes('rep')) return 'national'
  if (o.includes('governor') || o.includes('assembly')) return 'state'
  if (o.includes('chairman') || o.includes('lga')) return 'lga'
  if (o.includes('councillor') || o.includes('ward')) return 'ward'
  return 'other'
}

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

    const { data: candidate, error: candErr } = await supabaseAdmin.from('candidates')
      .select('id, full_name, state, lga, ward, office')
      .eq('user_id', payload.userId)
      .single()

    if (candErr || !candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // 1. Smart Targeting
    const level = classifyCandidate(candidate.office)
    let query = supabaseAdmin.from('users')
      .select('phone')
      .eq('role', 'voter')
      .not('phone', 'is', null)

    let regionName = 'your constituency'

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

    const { data: voters, error: votersErr } = await query

    if (votersErr) throw votersErr
    if (!voters || voters.length === 0) {
      return NextResponse.json({ 
        error: `No voters with phone numbers found in ${regionName} yet.` 
      }, { status: 400 })
    }

    // 2. Format message
    const candidateFirstName = candidate.full_name?.split(' ')[0] || 'DICO';
    const fullMessage = `${candidateFirstName}: ${message.trim()}`

    // 3. Format phone numbers (convert 0801... to 234801...)
    const formatPhone = (p: string | null) => {
      if (!p) return null;
      let num = p.replace(/\D/g, '');
      if (num.startsWith('0')) num = '234' + num.slice(1);
      if (num.startsWith('234') && num.length === 13) return num; 
      return null;
    }

    const formattedPhones = voters
      .map(v => formatPhone(v.phone))
      .filter((n): n is string => n !== null)
    
    if (formattedPhones.length === 0) {
      return NextResponse.json({ error: 'No valid phone numbers found for voters in your constituency.' }, { status: 400 })
    }

    // 4. Call the SMS API (BulkSMSNigeria V2 Real Mode)
    const smsApiUrl = process.env.SMS_API_URL || 'https://www.bulksmsnigeria.com/api/v2/sms'
    const apiToken = process.env.SMS_API_TOKEN

    if (!apiToken) {
      console.warn('⚠️ SMS_API_TOKEN is missing in .env file. Running in MOCK MODE.')
      console.log(`[MOCK DIRECT SMS] Sending to ${formattedPhones.length} voters in ${regionName}.`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
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
          gateway: 'direct-refund'
        })
      })

      const smsData = await smsResponse.json()

      if (!smsResponse.ok || smsData.status === 'error') {
        console.error('SMS API Error:', smsData)
        throw new Error(smsData.error?.message || 'Failed to send SMS via provider.')
      }
    }
    
    const sentCount = formattedPhones.length;

    // 5. Record the direct campaign
    await supabaseAdmin.from('sms_campaigns').insert({
      candidate_id: candidate.id,
      message: message.trim(),
      reward_civict: 0,
      target_state: candidate.state,
      target_lga: candidate.lga,
      status: 'completed'
    })

    return NextResponse.json({ 
      success: true, 
      message: `SMS blast sent successfully to ${sentCount} voters in ${regionName}!`,
      recipients: sentCount
    })

  } catch (err: any) {
    console.error('Direct SMS Send Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}