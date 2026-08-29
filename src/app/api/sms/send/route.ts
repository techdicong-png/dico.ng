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
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { campaignId, phoneNumbers } = await req.json()

    if (!campaignId || !phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length < 5) {
      return NextResponse.json({ error: 'Please enter at least 5 valid phone numbers.' }, { status: 400 })
    }

    const { data: campaign } = await supabaseAdmin.from('sms_campaigns')
      .select('*, candidates(full_name)')
      .eq('id', campaignId)
      .single()

    if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    if (campaign.status !== 'active') return NextResponse.json({ error: 'This campaign is no longer active.' }, { status: 400 })

    const { data: existingTask } = await supabaseAdmin.from('sms_tasks')
      .select('id').eq('campaign_id', campaignId).eq('voter_id', payload.userId).maybeSingle()

    if (existingTask) return NextResponse.json({ error: 'You have already participated in this campaign.' }, { status: 400 })

    // 🔴 UPDATED MESSAGE FORMAT: "Full Name via DICO: Message"
    const candidateFullName = campaign.candidates?.full_name || 'DICO';
    const fullMessage = `${candidateFullName} via DICO: ${campaign.message}`;

    // 🔴 ADDED PHONE FORMATTING: Convert 0801... to 234801...
    const formatPhone = (p: string) => {
      let num = p.replace(/\D/g, '');
      if (num.startsWith('0')) num = '234' + num.slice(1);
      if (num.startsWith('234') && num.length === 13) return num; 
      return null;
    }

    const formattedPhones = phoneNumbers.map(formatPhone).filter((n): n is string => n !== null)
    
    if (formattedPhones.length < 5) {
      return NextResponse.json({ error: 'Please enter at least 5 valid Nigerian phone numbers.' }, { status: 400 })
    }

    // 🔴 REAL SMS MODE (BulkSMSNigeria)
    const smsApiUrl = process.env.SMS_API_URL || 'https://www.bulksmsnigeria.com/api/v2/sms'
    const apiToken = process.env.SMS_API_TOKEN

    if (!apiToken) {
      console.warn('⚠️ SMS_API_TOKEN is missing. Running in MOCK MODE.')
      console.log(`[MOCK SMS] Sending to ${formattedPhones.length} numbers: ${formattedPhones.join(', ')}`);
      console.log(`[MOCK SMS] Message: ${fullMessage}`);
      await new Promise(resolve => setTimeout(resolve, 800));
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
          gateway: 'direct-corporate'
        })
      })

      const smsData = await smsResponse.json()

      if (!smsResponse.ok || smsData.status === 'error') {
        console.error('SMS API Error:', smsData)
        const errMsg = smsData.error?.message || 'Failed to send SMS via provider.'
        if (smsResponse.status === 402 || errMsg.toLowerCase().includes('insufficient') || errMsg.toLowerCase().includes('balance')) {
          return NextResponse.json({ error: 'Insufficient SMS credits. Please top up the campaign SMS wallet.' }, { status: 402 })
        }
        throw new Error(errMsg)
      }
    }
    
    // Record the task
    await supabaseAdmin.from('sms_tasks').insert({
      campaign_id: campaignId,
      voter_id: payload.userId,
      phone_numbers: phoneNumbers,
      status: 'sent',
      reward_given: true
    })

    // Award CIVICT
    await supabaseAdmin.from('civict_transactions').insert({
      user_id: payload.userId,
      type: 'sms_campaign',
      amount: campaign.reward_civict,
      description: `Shared SMS campaign for ${campaign.candidates?.full_name}`
    })

    const { data: user } = await supabaseAdmin.from('users').select('civict_balance').eq('id', payload.userId).single()
    if (user) {
      await supabaseAdmin.from('users').update({ 
        civict_balance: (user.civict_balance || 0) + campaign.reward_civict 
      }).eq('id', payload.userId)
    }

    return NextResponse.json({ 
      success: true, 
      message: `SMS sent successfully! You earned ${campaign.reward_civict} CIVICT.`
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}