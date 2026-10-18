import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

const ZONES = ['North Central', 'North East', 'North West', 'South East', 'South South', 'South West'] as const
const FUNCTIONS = ['activation_logistics', 'admin_finance', 'sales'] as const

const schema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('zonal_director'), email: z.string().email(), zone: z.enum(ZONES) }),
  z.object({ role: z.literal('national_director'), email: z.string().email(), function: z.enum(FUNCTIONS) }),
])

export async function POST(req: Request) {
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the email and the zone or function' }, { status: 400 })
  const input = parsed.data

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('email', input.email.toLowerCase()).maybeSingle()
  if (!user) return NextResponse.json({ error: 'No user with that email. They must register first.' }, { status: 404 })

  const row: Record<string, string> = input.role === 'zonal_director'
    ? { user_id: user.id, role: input.role, zone: input.zone }
    : { user_id: user.id, role: input.role, function: input.function }
  const { data, error } = await supabaseAdmin.from('leaders').insert(row).select().single()
  if (error) {
    const msg = error.code === '23505' ? 'That zone or function already has an active director, or this user already holds the role' : 'Failed to add leader'
    return NextResponse.json({ error: msg }, { status: 409 })
  }
  return NextResponse.json({ success: true, leader: data })
}

// Deactivate (kept for history): DELETE /api/admin/leaders?id=<leader id>
export async function DELETE(req: Request) {
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const { error } = await supabaseAdmin.from('leaders').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to remove leader' }, { status: 500 })
  return NextResponse.json({ success: true })
}
