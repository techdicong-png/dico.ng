import { NextResponse } from 'next/server'
import { z } from 'zod'
import axios from 'axios'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

const schema = z.object({
  bankCode: z.string().min(2).max(10),
  bankName: z.string().min(2).max(100),
  accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
})

// Admin saves a Sole Distributor's bank account. The account name is looked up from the bank
// (via Paystack), so what end users see is what the bank says, not what someone typed.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { bankCode, bankName, accountNumber } = parsed.data

  let accountName: string
  try {
    const { data } = await axios.get('https://api.paystack.co/bank/resolve', {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      params: { account_number: accountNumber, bank_code: bankCode },
    })
    accountName = data.data.account_name
  } catch (err: any) {
    return NextResponse.json({ error: err.response?.data?.message || 'Could not verify that account' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .update({
      bank_name: bankName, bank_code: bankCode, account_number: accountNumber,
      account_name: accountName, bank_verified_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('level', 'sole')
    .select()
    .maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Sole distributor not found' }, { status: 404 })
  return NextResponse.json({ success: true, distributor: data })
}
