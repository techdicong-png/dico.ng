import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendNotification } from '@/lib/notifications'
import { createClient } from '@supabase/supabase-js'
import { sendUserAlert } from '@/lib/mail'

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
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { userId, amount } = await req.json()

    // 1. Get current balance
    const { data: user, error: userErr } = await supabaseServer.from('users').select('civict_balance, full_name, email').eq('id', userId).single()
    if (userErr) throw userErr

    // 2. Add to balance
    const newBalance = (user.civict_balance || 0) + parseInt(amount)
    await supabaseServer.from('users').update({ civict_balance: newBalance }).eq('id', userId)

    // 3. Record transaction
    await supabaseServer.from('civict_transactions').insert({
      user_id: userId,
      type: 'admin_fund',
      amount: parseInt(amount),
      description: 'Admin Grant'
    })

        // 4. NEW: Send In-App Notification
    await sendNotification(
      userId, 
      'Account Funded!', 
      `An Admin just granted you ${amount} CIVICT.`, 
      '/wallet',
      'civict_earned'
    )

    // 5. NEW: Send User Email Alert
    if (user.email) {
      await sendUserAlert(
        user.email,
        'Your DICO Account was Funded',
        `Good news! An Admin has just granted you ${amount} CIVICT. Your new balance is ${newBalance} CIVICT.`
      )
    }

    return NextResponse.json({ success: true, newBalance })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}