import { NextResponse } from 'next/server'
import { z } from 'zod'
import axios from 'axios'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

async function requireAdmin(req: Request) {
  const s = await getSession(req)
  return s && s.role === 'admin' ? s : null
}

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data } = await supabaseAdmin.from('dico_bank_account').select('*').maybeSingle()
  return NextResponse.json({ account: data })
}

const schema = z.object({
  bankCode: z.string().min(2).max(10),
  bankName: z.string().min(2).max(100),
  accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
})

// Admin sets DICO's payment account. The account name comes from the bank (via Paystack).
export async function POST(req: Request) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
    .from('dico_bank_account')
    .upsert({
      id: true, bank_name: bankName, bank_code: bankCode, account_number: accountNumber,
      account_name: accountName, verified_at: new Date().toISOString(), updated_by: session.userId,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Failed to save account' }, { status: 500 })
  return NextResponse.json({ success: true, account: data })
}
