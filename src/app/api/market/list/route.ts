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

    const { type, amount_civict, rate_naira } = await req.json()

    if (type === 'sell') {
      // Check if user has enough balance
      const { data: userData, error: userErr } = await supabaseServer
        .from('users')
        .select('civict_balance')
        .eq('id', payload.userId)
        .single()

      if (userErr) throw userErr
      if (userData.civict_balance < amount_civict) {
        return NextResponse.json({ error: 'Insufficient CIVICT balance' }, { status: 400 })
      }

      // Deduct balance immediately for sell orders to prevent double-spending
      await supabaseServer
        .from('users')
        .update({ civict_balance: userData.civict_balance - amount_civict })
        .eq('id', payload.userId)
    }

    // Insert the listing
    const { error: listErr } = await supabaseServer
      .from('civict_market_listings')
      .insert({
        user_id: payload.userId,
        type,
        amount_civict,
        rate_naira,
        status: 'open'
      })

    if (listErr) throw listErr

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}