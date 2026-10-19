import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'
import { resolveBankAccount } from '@/lib/paystack'

const schema = z.object({
  bankCode: z.string().min(2).max(10),
  bankName: z.string().min(2).max(100),
  accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
  skipVerify: z.boolean().optional(),                 // admin types the name instead of asking the bank
  accountName: z.string().trim().min(3).max(100).optional(),
})

// Admin saves a Sole Distributor's bank account. Normally the account name comes from the bank
// (via Paystack). If the bank check is unavailable, the admin can enter the name by hand; those
// accounts are flagged as not checked.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { bankCode, bankName, accountNumber, skipVerify, accountName: typedName } = parsed.data

  let accountName: string
  if (skipVerify) {
    if (!typedName) return NextResponse.json({ error: 'Enter the account name exactly as the bank shows it' }, { status: 400 })
    accountName = typedName
  } else {
    const r = await resolveBankAccount(accountNumber, bankCode)
    if ('error' in r) return NextResponse.json({ error: r.error }, { status: 400 })
    accountName = r.name
  }

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .update({
      bank_name: bankName, bank_code: bankCode, account_number: accountNumber,
      account_name: accountName, bank_verified_at: new Date().toISOString(), bank_verified_manually: !!skipVerify,
    })
    .eq('id', id)
    .eq('level', 'sole')
    .select()
    .maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Sole distributor not found' }, { status: 404 })
  return NextResponse.json({ success: true, distributor: data })
}
