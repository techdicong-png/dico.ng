import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

async function requireAdmin(req: Request) {
  const s = await getSession(req)
  return s && s.role === 'admin' ? s : null
}

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await supabaseAdmin
    .from('distributors')
    .select('*, users:user_id(full_name, email, phone)')
    .order('state')
  if (error) return NextResponse.json({ error: 'Failed to load distributors' }, { status: 500 })
  return NextResponse.json({ distributors: data })
}

const schema = z.object({
  email: z.string().email(),
  level: z.enum(['sole', 'major', 'area', 'spv']),
  state: z.string().min(2),
  lga: z.string().optional(),
  ward: z.string().optional(),
  parentId: z.string().uuid().optional(),
})

// Register an existing user as a distributor (admin registers Sole Distributors; lower levels come later).
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { email, level, state, lga, ward, parentId } = parsed.data

  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('email', email.toLowerCase()).maybeSingle()
  if (!user) return NextResponse.json({ error: 'No user with that email. They must register first.' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .insert({ user_id: user.id, level, state, lga, ward, parent_id: parentId ?? null })
    .select()
    .single()
  if (error) {
    const msg = error.code === '23505' ? 'That user, state, LGA or ward already has a distributor'
      : error.code === '23514' ? 'Level, parent, LGA and ward combination is invalid'
      : 'Failed to create distributor'
    return NextResponse.json({ error: msg }, { status: 409 })
  }
  return NextResponse.json({ success: true, distributor: data })
}
