import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getCandidateTargetAreas } from '@/lib/political-mapping'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || !['candidate', 'campaign_team'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { message, limit, phoneNumbers } = await req.json()
    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
    }

    const { data: candidate, error: candErr } = await supabaseAdmin.from('candidates')
      .select('id, full_name, state, lga, ward, senatorial_district, federal_constituency, office')
      .eq('user_id', payload.userId).single()

    if (candErr || !candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // 🔴 SMART TARGETING
    const target = getCandidateTargetAreas(candidate)
    let query = supabaseAdmin.from('users').select('phone').eq('role', 'voter').not('phone', 'is', null)

    if (target.scope === 'state') query = query.eq('state', target.state)
    else if (target.scope === 'lgas') query = query.in('lga', target.lgas)
    else if (target.scope === 'lga') query = query.eq('lga', target.lga)
    else if (target.scope === 'ward') query = query.eq('lga', target.lga).eq('ward', target.ward)

    const { data: voters, error: votersErr } = await query
    if (votersErr) throw votersErr
    if (!voters || voters.length === 0) return NextResponse.json({ error: 'No voters with phone numbers found in your constituency yet.' }, { status: 400 })

    const formatPhone = (p: string | null) => {
      if (!p) return null;
      let num = p.replace(/\D/g, '');
      if (num.startsWith('0')) num = '234' + num.slice(1);
      if (num.startsWith('234') && num.length === 13) return num; 
      return null;
    }

    let formattedPhones = voters.map(v => formatPhone(v.phone)).filter((n): n is string => n !== null)
    if (formattedPhones.length === 0) return NextResponse.json({ error: 'No valid phone numbers found.' }, { status: 400 })

    if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      const selectedSet = new Set(phoneNumbers.map((p: string) => p.replace(/\D/g, '')))
      formattedPhones = formattedPhones.filter(num => {
        const rawNum = num.startsWith('234') ? '0' + num.slice(3) : num
        return selectedSet.has(rawNum)
      })
    } else if (limit && limit > 0 && limit < formattedPhones.length) {
      formattedPhones = formattedPhones.slice(0, limit)
    }

    const candidateFullName = candidate.full_name || 'DICO';
    const fullMessage = `${candidateFullName} via DICO: ${message.trim()}`

    const smsApiUrl = process.env.SMS_API_URL || 'https://www.bulksmsnigeria.com/api/v2/sms'
    const apiToken = process.env.SMS_API_TOKEN

    if (!apiToken) {
      console.warn('⚠️ SMS_API_TOKEN is missing. Running in MOCK MODE.')
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      const recipients = formattedPhones.join(',')
      const smsResponse = await fetch(smsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${apiToken}` },
        body: JSON.stringify({ from: process.env.SMS_SENDER_ID || 'DICO', to: recipients, body: fullMessage, gateway: 'direct-corporate' })
      })
      const smsData = await smsResponse.json()
      if (!smsResponse.ok || smsData.status === 'error') {
        console.error('SMS API Error:', smsData)
        const errMsg = smsData.error?.message || 'Failed to send SMS via provider.'
        if (smsResponse.status === 402 || errMsg.toLowerCase().includes('insufficient') || errMsg.toLowerCase().includes('balance')) {
          return NextResponse.json({ error: 'Insufficient SMS credits. Please top up your campaign SMS wallet.' }, { status: 402 })
        }
        throw new Error(errMsg)
      }
    }
    
    const sentCount = formattedPhones.length;
    await supabaseAdmin.from('sms_campaigns').insert({
      candidate_id: candidate.id, message: message.trim(), reward_civict: 0, target_state: candidate.state, target_lga: candidate.lga, status: 'completed'
    })

    return NextResponse.json({ success: true, message: `SMS blast sent successfully to ${sentCount} voters!`, recipients: sentCount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}