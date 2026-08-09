import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { status } = await req.json() // 'approved' or 'rejected'

    // 1. Fetch the transfer request
    const { data: transfer, error: fetchErr } = await supabaseServer
      .from('civict_transfers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !transfer) throw new Error('Transfer not found')
    if (transfer.status !== 'pending') throw new Error('Transfer already processed')

    // 2. Fetch sender and recipient details
    const { data: sender } = await supabaseServer.from('users').select('id, full_name, civict_balance').eq('id', transfer.sender_id).single()
    const { data: recipient } = await supabaseServer.from('users').select('id, full_name, civict_balance').eq('id', transfer.recipient_id).single()

    if (!sender || !recipient) throw new Error('Sender or recipient not found')

    if (status === 'approved') {
      // 3a. Credit recipient
      await supabaseServer.from('users').update({ 
        civict_balance: (recipient.civict_balance || 0) + transfer.amount 
      }).eq('id', recipient.id)

      // Record transaction for recipient
      await supabaseServer.from('civict_transactions').insert({
        user_id: recipient.id,
        type: 'transfer_received',
        amount: transfer.amount,
        description: `Received from ${sender.full_name}`
      })

    } else if (status === 'rejected') {
      // 3b. Refund sender
      await supabaseServer.from('users').update({ 
        civict_balance: (sender.civict_balance || 0) + transfer.amount 
      }).eq('id', sender.id)

      // Record refund transaction for sender
      await supabaseServer.from('civict_transactions').insert({
        user_id: sender.id,
        type: 'refund',
        amount: transfer.amount,
        description: `Transfer to ${recipient.full_name} rejected - Refunded`
      })
    }

    // 4. Update transfer status
    await supabaseServer.from('civict_transfers').update({ status }).eq('id', id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}