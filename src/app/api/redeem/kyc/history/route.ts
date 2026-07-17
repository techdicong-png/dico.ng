// src/app/api/redeem/history/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { data } = await supabaseAdmin.from('civict_redemptions')
    .select('id, civict_amount, naira_amount, net_naira_kobo, platform_fee_kobo, exchange_rate, account_name, bank_code, paystack_ref, status, requested_at, completed_at')
    .eq('user_id', payload.userId)
    .order('requested_at', { ascending: false }).limit(30)

  const formatted = (data || []).map(r => ({
    ...r,
    naira_gross_display: `₦${(r.naira_amount / 100).toFixed(2)}`,
    naira_net_display: `₦${(r.net_naira_kobo / 100).toFixed(2)}`,
    fee_display: `₦${(r.platform_fee_kobo / 100).toFixed(2)}`,
  }))

  return NextResponse.json({ redemptions: formatted })
}
