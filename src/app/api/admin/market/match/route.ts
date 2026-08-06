import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { sell_id, buy_id } = await req.json()

    // 1. Fetch both listings
    const { data: sellOrder } = await supabaseServer.from('civict_market_listings').select('*').eq('id', sell_id).single()
    const { data: buyOrder } = await supabaseServer.from('civict_market_listings').select('*').eq('id', buy_id).single()

    if (!sellOrder || !buyOrder) throw new Error('Order not found')
    if (buyOrder.amount_civict < sellOrder.amount_civict) throw new Error('Buy order amount is less than sell order')

    // 2. Credit CIVICT to the Buyer
    const { data: buyer } = await supabaseServer.from('users').select('civict_balance').eq('id', buyOrder.user_id).single()
    await supabaseServer.from('users').update({ 
      civict_balance: (buyer?.civict_balance || 0) + sellOrder.amount_civict 
    }).eq('id', buyOrder.user_id)

    // 3. Record transaction for Buyer
    await supabaseServer.from('civict_transactions').insert({
      user_id: buyOrder.user_id,
      type: 'trade_buy',
      amount: sellOrder.amount_civict,
      description: `Purchased ${sellOrder.amount_civict} CIVICT from Market`
    })

    // 4. Update both listings to 'matched'
    await supabaseServer.from('civict_market_listings').update({ 
      status: 'matched', 
      matched_with: buyOrder.user_id 
    }).eq('id', sell_id)
    
    await supabaseServer.from('civict_market_listings').update({ 
      status: 'matched', 
      matched_with: sellOrder.user_id 
    }).eq('id', buy_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Trade matching error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}