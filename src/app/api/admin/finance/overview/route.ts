// src/app/api/admin/finance/overview/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: settings } = await supabaseAdmin.from('platform_settings').select('key, value')
  const s: Record<string, string> = {}
  ;(settings || []).forEach(r => { s[r.key] = r.value })

  const { data: rdms } = await supabaseAdmin.from('civict_redemptions')
    .select('status, net_naira_kobo, civict_amount').limit(50)

  return NextResponse.json({
    pool_balance_naira: parseInt(s.reward_pool_balance || '0') / 100,
    civict_rate: parseInt(s.civict_to_naira_rate || '1000'),
    min_redeem_civict: parseInt(s.min_redeem_civict || '5000'),
    max_daily_naira: parseInt(s.max_redeem_naira_daily || '50000'),
    platform_fee_pct: parseInt(s.platform_fee_pct || '5'),
    redemption_enabled: s.redemption_enabled === 'true',
    total_paid_out_naira: (rdms || []).filter(r => r.status === 'completed').reduce((a, r) => a + (r.net_naira_kobo || 0), 0) / 100,
    pending_redemptions: (rdms || []).filter(r => r.status === 'pending').length,
  })
}
