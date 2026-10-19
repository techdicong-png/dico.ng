import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'
import { resolveBankAccount } from '@/lib/paystack'

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
  skipVerify: z.boolean().optional(),
  accountName: z.string().trim().min(3).max(100).optional(),
})

// Admin sets DICO's payment account. The name normally comes from the bank (via Paystack);
// if that check is unavailable the admin can type it, and the account is flagged as not checked.
export async function POST(req: Request) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
    .from('dico_bank_account')
    .upsert({
      id: true, bank_name: bankName, bank_code: bankCode, account_number: accountNumber,
      account_name: accountName, verified_at: new Date().toISOString(), verified_manually: !!skipVerify, updated_by: session.userId,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Failed to save account' }, { status: 500 })
  return NextResponse.json({ success: true, account: data })
}
