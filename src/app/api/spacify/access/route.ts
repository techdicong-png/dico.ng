import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServiceAccess } from '@/lib/service-access'

// Does this browser have Spacify access, and what do the vouchers buy?
export async function GET(req: Request) {
  const access = await getServiceAccess(req, 'spacify')
  const [rules, prices] = await Promise.all([
    supabaseAdmin.from('service_access_rules').select('denomination, days').eq('service', 'spacify').order('denomination'),
    supabaseAdmin.from('voucher_pricing').select('denomination, end_user_price').eq('is_active', true),
  ])
  const price = new Map((prices.data ?? []).map(p => [p.denomination, p.end_user_price]))
  const plans = (rules.data ?? []).map(r => ({ denomination: r.denomination, days: r.days, price: price.get(r.denomination) ?? null }))
  return NextResponse.json({ ...access, plans }, { headers: { 'Cache-Control': 'no-store' } })
}
