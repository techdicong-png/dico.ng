// src/app/api/redeem/info/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabaseAdmin.from('platform_settings').select('key, value')
  const s: Record<string, string> = {}
  ;(data || []).forEach(r => { s[r.key] = r.value })

  const rate = parseInt(s.civict_to_naira_rate || '1000')
  return NextResponse.json({
    rate: { civict_per_naira: rate, example: `1,000 CIVICT = ₦${(1000 / rate).toFixed(2)}` },
    min_civict: parseInt(s.min_redeem_civict || '5000'),
    max_naira_daily: parseInt(s.max_redeem_naira_daily || '50000'),
    pool_balance_naira: Math.floor(parseInt(s.reward_pool_balance || '0') / 100),
    platform_fee_pct: parseInt(s.platform_fee_pct || '5'),
    redemption_enabled: s.redemption_enabled === 'true',
  })
}
