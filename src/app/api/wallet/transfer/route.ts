import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { recipientEmail, amount } = await req.json()

    // 1. Find recipient
    const { data: recipient, error: recErr } = await supabaseServer.from('users').select('id, full_name').eq('email', recipientEmail.toLowerCase()).single()
    if (recErr || !recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

    // 2. Check sender balance
    const { data: sender, error: senderErr } = await supabaseServer.from('users').select('civict_balance').eq('id', payload.userId).single()
    if (senderErr) throw senderErr
    if (sender.civict_balance < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

    // 3. Deduct from sender immediately (Escrow)
    await supabaseServer.from('users').update({ civict_balance: sender.civict_balance - amount }).eq('id', payload.userId)

    // 4. Record transaction for sender
    await supabaseServer.from('civict_transactions').insert({
      user_id: payload.userId,
      type: 'transfer_sent',
      amount: -amount,
      description: `Transfer to ${recipient.full_name} (Pending Admin Approval)`
    })

    // 5. Create pending transfer record
    await supabaseServer.from('civict_transfers').insert({
      sender_id: payload.userId,
      recipient_id: recipient.id,
      amount,
      status: 'pending'
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}