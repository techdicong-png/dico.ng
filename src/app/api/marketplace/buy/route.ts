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

    const { itemId } = await req.json()

    // 1. Fetch the item
    const { data: item, error: itemErr } = await supabaseServer
      .from('marketplace_items')
      .select('*, seller_id')
      .eq('id', itemId)
      .single()

    if (itemErr || !item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    if (item.is_sold) return NextResponse.json({ error: 'Item already sold' }, { status: 400 })
    if (item.seller_id === payload.userId) return NextResponse.json({ error: 'You cannot buy your own item' }, { status: 400 })

    // 2. Fetch buyer's balance
    const { data: buyer, error: buyerErr } = await supabaseServer
      .from('users')
      .select('civict_balance, full_name')
      .eq('id', payload.userId)
      .single()

    if (buyerErr) throw buyerErr
    if (buyer.civict_balance < item.price_civict) {
      return NextResponse.json({ error: 'Insufficient CIVICT balance' }, { status: 400 })
    }

    // 3. Fetch seller's balance
    const { data: seller, error: sellerErr } = await supabaseServer
      .from('users')
      .select('civict_balance, full_name')
      .eq('id', item.seller_id)
      .single()

    if (sellerErr) throw sellerErr

    // 4. Deduct from buyer
    await supabaseServer.from('users').update({ 
      civict_balance: buyer.civict_balance - item.price_civict 
    }).eq('id', payload.userId)

    // 5. Add to seller
    await supabaseServer.from('users').update({ 
      civict_balance: (seller.civict_balance || 0) + item.price_civict 
    }).eq('id', item.seller_id)

    // 6. Record transactions for both
    await supabaseServer.from('civict_transactions').insert([
      {
        user_id: payload.userId,
        type: 'purchase',
        amount: -item.price_civict,
        description: `Purchased: ${item.title}`
      },
      {
        user_id: item.seller_id,
        type: 'sale',
        amount: item.price_civict,
        description: `Sold: ${item.title}`
      }
    ])

    // 7. Mark item as sold
    await supabaseServer.from('marketplace_items').update({ is_sold: true }).eq('id', itemId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}