import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'
import { sendNotification } from '@/lib/notifications'

const schema = z.object({
  voucherCredit: z.number().int().positive().default(100000),
  smsUnits: z.number().int().min(0).default(1000),
})

// Admin activates a state's VGI after the Sole Distributor pays: sets cap + allocates SMS units.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid amounts' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('activate_vgi', {
    p_distributor_id: id,
    p_admin_id: session.userId,
    p_voucher_credit: parsed.data.voucherCredit,
    p_sms_units: parsed.data.smsUnits,
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })

  await sendNotification(
    data.user_id, 'VGI Activated',
    `Your Voucher Generator Interface is active with ${parsed.data.voucherCredit} CIVICT voucher credit and ${parsed.data.smsUnits} bulk SMS units.`,
    '/vouchers', 'civict_earned'
  ).catch(() => {})

  return NextResponse.json({ success: true, distributor: data })
}
