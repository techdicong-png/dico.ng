import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public: end users need to see denominations and prices.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('voucher_pricing')
    .select('denomination, end_user_price')
    .eq('is_active', true)
    .order('denomination')
  if (error) return NextResponse.json({ error: 'Failed to load pricing' }, { status: 500 })
  return NextResponse.json({ pricing: data })
}
