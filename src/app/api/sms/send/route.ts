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

    const candidateFirstName = campaign.candidates?.full_name?.split(' ')[0] || 'DICO';
    const fullMessage = `${candidateFirstName}: ${campaign.message}`

    // 🟡 MOCK SMS MODE (For Presentation)
    console.log(`[MOCK SMS] Sending to ${phoneNumbers.length} numbers: ${phoneNumbers.join(', ')}`);
    console.log(`[MOCK SMS] Message: ${fullMessage}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
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