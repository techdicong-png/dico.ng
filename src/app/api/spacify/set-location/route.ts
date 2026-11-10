import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'
import { NIGERIA_DATA } from '@/data/nigeria'

const schema = z.object({ state: z.string(), lga: z.string(), ward: z.string() })

// A signed-in user saves their own state, LGA and ward (these decide which candidates they see).
export async function POST(req: Request) {
  const session = await getSession(req)
  if (!session) return NextResponse.json({ error: 'Please sign in to save your location.' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Choose a state, LGA and ward' }, { status: 400 })
  const { state, lga, ward } = parsed.data
  if (!NIGERIA_DATA[state]?.[lga]?.includes(ward)) return NextResponse.json({ error: 'That ward is not in the official list' }, { status: 400 })

  const { error } = await supabaseAdmin.from('users').update({ state, lga, ward }).eq('id', session.userId)
  if (error) return NextResponse.json({ error: 'Could not save your location' }, { status: 500 })
  return NextResponse.json({ success: true })
}
