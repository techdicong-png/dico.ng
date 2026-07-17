// src/app/api/redeem/request/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import axios from 'axios'

const PAYSTACK_BASE = 'https://api.paystack.co'
const headers = () => ({ Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' })

async function getSetting(key: string) {
  const { data } = await supabaseAdmin.from('platform_settings').select('value').eq('key', key).single()
  return data?.value
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { civict_amount } = await request.json()

  // Check enabled
  if ((await getSetting('redemption_enabled')) !== 'true')
    return NextResponse.json({ error: 'Redemptions paused' }, { status: 403 })

  // Check min
  const minCivict = parseInt(await getSetting('min_redeem_civict'))
  if (civict_amount < minCivict)
    return NextResponse.json({ error: `Min ${minCivict.toLocaleString()} CIVICT` }, { status: 400 })

  // Check balance
  const { data: user } = await supabaseAdmin.from('users').select('civict_balance').eq('id', payload.userId).single()
  if (!user || user.civict_balance < civict_amount)
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

  // Calculate
  const rate = parseInt(await getSetting('civict_to_naira_rate'))
  const feePct = parseInt(await getSetting('platform_fee_pct'))
  const grossKobo = Math.floor((civict_amount / rate) * 100)
  const feeKobo = Math.floor(grossKobo * feePct / 100)
  const netKobo = grossKobo - feeKobo

  // Check pool
  const poolKobo = parseInt(await getSetting('reward_pool_balance'))
  if (poolKobo < netKobo) return NextResponse.json({ error: 'Pool insufficient' }, { status: 400 })

  // Check KYC
  const { data: kyc } = await supabaseAdmin.from('user_kyc').select('*').eq('user_id', payload.userId).maybeSingle()
  if (!kyc || kyc.kyc_status !== 'verified')
    return NextResponse.json({ error: 'Verify bank first' }, { status: 400 })

  // Lock CIVICT
  await supabaseAdmin.rpc('lock_civict_for_redemption', { uid: payload.userId, amount: civict_amount })

  const reference = `DICO-RDM-${uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()}`

  try {
    // Create recipient & transfer
    const { data: recipient } = await axios.post(`${PAYSTACK_BASE}/transferrecipient`, {
      type: 'nuban', name: kyc.account_name, account_number: kyc.account_number,
      bank_code: kyc.bank_code, currency: 'NGN',
    }, { headers: headers() })

    const { data: transfer } = await axios.post(`${PAYSTACK_BASE}/transfer`, {
      source: 'balance', amount: netKobo, recipient: recipient.recipient_code, reference, reason: `CIVICT Redemption — ${civict_amount.toLocaleString()} CIVICT`,
    }, { headers: headers() })

    // Record redemption
    const { data: redemption } = await supabaseAdmin.from('civict_redemptions').insert({
      user_id: payload.userId, civict_amount, naira_amount: grossKobo,
      platform_fee_kobo: feeKobo, net_naira_kobo: netKobo, exchange_rate: rate,
      bank_code: kyc.bank_code, account_number: kyc.account_number, account_name: kyc.account_name,
      paystack_ref: reference, paystack_tx_id: transfer.transfer_code,
      status: transfer.status === 'success' ? 'completed' : 'processing',
    }).select().single()

    // Debit pool
    await supabaseAdmin.rpc('debit_reward_pool', {
      amount_kobo_in: netKobo, tx_type: 'redemption_debit', ref: reference,
      desc: `Redemption by user ${payload.userId}`, actor: payload.userId,
    })

    return NextResponse.json({
      redemption,
      summary: {
        civict_spent: civict_amount,
        gross_naira: `₦${(grossKobo / 100).toFixed(2)}`,
        platform_fee: `₦${(feeKobo / 100).toFixed(2)} (${feePct}%)`,
        net_naira: `₦${(netKobo / 100).toFixed(2)}`,
        bank: `${kyc.bank_name} — ${kyc.account_number}`,
        status: redemption.status,
        reference,
      }
    })
  } catch (err: any) {
    await supabaseAdmin.rpc('restore_civict', { uid: payload.userId, amount: civict_amount })
    return NextResponse.json({ error: err.response?.data?.message || 'Transfer failed' }, { status: 500 })
  }
}
