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

    // 🔴 CHANGED: Added phoneNumbers to the destructured body
    const { message, limit, phoneNumbers } = await req.json()
    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
    }

    // 1. Get candidate's location
    const { data: candidate, error: candErr } = await supabaseAdmin.from('candidates')
      .select('id, full_name, state, lga, office')
      .eq('user_id', payload.userId)
      .single()

    if (candErr || !candidate) return NextResponse.json({ error: 'Candidate profile not found.' }, { status: 404 })

    // 2. Fetch voters strictly in the candidate's LGA
    let query = supabaseAdmin.from('users')
      .select('phone')
      .eq('role', 'voter')
      .eq('lga', candidate.lga)
      .not('phone', 'is', null)

    const { data: voters, error: votersErr } = await query

    if (votersErr) throw votersErr
    if (!voters || voters.length === 0) {
      return NextResponse.json({ 
        error: `No voters with phone numbers found in ${candidate.lga} LGA yet.` 
      }, { status: 400 })
    }

    // 3. Format phone numbers
    const formatPhone = (p: string | null) => {
      if (!p) return null;
      let num = p.replace(/\D/g, '');
      if (num.startsWith('0')) num = '234' + num.slice(1);
      if (num.startsWith('234') && num.length === 13) return num; 
      return null;
    }

    let formattedPhones = voters
      .map(v => formatPhone(v.phone))
      .filter((n): n is string => n !== null)
    
    if (formattedPhones.length === 0) {
      return NextResponse.json({ error: 'No valid phone numbers found for voters in your constituency.' }, { status: 400 })
    }

    // 🔴 NEW: If specific phone numbers were selected in the UI, filter the master list to only those
    if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      // Create a set of the raw numbers the user selected (e.g., "0801...")
      const selectedSet = new Set(phoneNumbers.map((p: string) => p.replace(/\D/g, '')))
      
      // Filter our secure LGA list to only include those selected numbers
      formattedPhones = formattedPhones.filter(num => {
        // num is "234801...", we convert back to "0801..." to check if it's in the user's selection
        const rawNum = num.startsWith('234') ? '0' + num.slice(3) : num
        return selectedSet.has(rawNum)
      })
    } else if (limit && limit > 0 && limit < formattedPhones.length) {
      // If no specific numbers selected, use the Limit dropdown
      formattedPhones = formattedPhones.slice(0, limit)
    }

    // 4. Format message
    const candidateFirstName = candidate.full_name || 'DICO';
    const fullMessage = `${candidateFirstName} via DICO: ${message.trim()}`

    // 5. Call the SMS API
    const smsApiUrl = process.env.SMS_API_URL || 'https://www.bulksmsnigeria.com/api/v2/sms'
    const apiToken = process.env.SMS_API_TOKEN

    if (!apiToken) {
      console.warn('⚠️ SMS_API_TOKEN is missing. Running in MOCK MODE.')
      console.log(`[MOCK DIRECT SMS] Sending to ${formattedPhones.length} voters in ${candidate.lga} LGA.`)
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

      // 🔴 IMPROVED ERROR HANDLING
      if (!smsResponse.ok || smsData.status === 'error') {
        console.error('SMS API Error:', smsData)
        const errMsg = smsData.error?.message || 'Failed to send SMS via provider.'
        
        if (smsResponse.status === 402 || errMsg.toLowerCase().includes('insufficient') || errMsg.toLowerCase().includes('balance')) {
          return NextResponse.json({ 
            error: 'Insufficient SMS credits. Please top up your campaign SMS wallet to send to more voters.' 
          }, { status: 402 })
        }
        
        throw new Error(errMsg)
      }
    }
    
    const sentCount = formattedPhones.length;

    // 6. Record the direct campaign
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
      message: `SMS blast sent successfully to ${sentCount} voters in ${candidate.lga} LGA!`,
      recipients: sentCount
    })

  } catch (err: any) {
    console.error('Direct SMS Send Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}