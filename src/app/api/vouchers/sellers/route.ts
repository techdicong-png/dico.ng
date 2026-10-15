import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public. Only active, bank-verified Sole Distributors are ever returned.
//   GET /api/vouchers/sellers          -> { states: [...] } states that currently have a seller
//   GET /api/vouchers/sellers?state=X  -> { seller } payment details for that state
export async function GET(req: Request) {
  const state = new URL(req.url).searchParams.get('state')

  if (!state) {
    const { data, error } = await supabaseAdmin
      .from('distributors').select('state')
      .eq('level', 'sole').eq('vgi_active', true).not('bank_verified_at', 'is', null)
    if (error) return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
    return NextResponse.json({ states: (data ?? []).map(d => d.state).sort() })
  }

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .select('state, bank_name, account_number, account_name, users:user_id(full_name, phone)')
    .eq('level', 'sole').eq('vgi_active', true).not('bank_verified_at', 'is', null)
    .eq('state', state)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  if (!data) return NextResponse.json({ seller: null })

  const u: any = Array.isArray(data.users) ? data.users[0] : data.users
  return NextResponse.json({
    seller: {
      state: data.state,
      name: u?.full_name ?? null,
      phone: u?.phone ?? null,
      bank_name: data.bank_name,
      account_number: data.account_number,
      account_name: data.account_name,
    },
  })
}
