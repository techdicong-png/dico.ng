import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, getMyDistributor, rpcError } from '@/lib/voucher-auth'

const schema = z.object({ childId: z.string().uuid() })

// Take back every unused voucher from one of your own direct distributors.
export async function POST(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = await getMyDistributor(session.userId)
  if (!me) return NextResponse.json({ error: 'Not a distributor' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('recall_all_vouchers', {
    p_parent: me.id, p_child: parsed.data.childId, p_user: session.userId,
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, moved: data })
}
