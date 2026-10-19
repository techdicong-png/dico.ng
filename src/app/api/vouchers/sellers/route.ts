import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public. Lists only the states that currently have an active, bank-verified Sole Distributor.
// (Payment details are shown only to someone who has started an order.)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('distributors').select('state')
    .eq('level', 'sole').eq('vgi_active', true).eq('is_active', true).not('bank_verified_at', 'is', null)
  if (error) return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  return NextResponse.json({ states: (data ?? []).map(d => d.state).sort() })
}
