import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'
import { NIGERIA_DATA } from '@/data/nigeria'

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
  level: z.enum(['sole', 'major', 'area']),   // state, LGA, ward
  state: z.string().min(2),
  lga: z.string().optional(),
  ward: z.string().optional(),
})

// Register an existing user as a distributor.
//   sole  = State Sole Distributor
//   major = LGA distributor (reports to the state's Sole Distributor)
//   area  = Ward distributor (reports to the LGA distributor)
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { email, level, state, lga, ward } = parsed.data

  if (level !== 'sole') {
    if (!lga || !NIGERIA_DATA[state]?.[lga]) return NextResponse.json({ error: 'Choose a valid LGA for that state' }, { status: 400 })
    if (level === 'area' && (!ward || !NIGERIA_DATA[state][lga].includes(ward)))
      return NextResponse.json({ error: 'Choose a valid ward for that LGA' }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('email', email.toLowerCase()).maybeSingle()
  if (!user) return NextResponse.json({ error: 'No user with that email. They must register first.' }, { status: 404 })

  // find who they report to
  let parentId: string | null = null
  if (level === 'major') {
    const { data: sole } = await supabaseAdmin.from('distributors').select('id')
      .eq('level', 'sole').eq('state', state).eq('is_active', true).maybeSingle()
    if (!sole) return NextResponse.json({ error: `Register the Sole Distributor for ${state} first.` }, { status: 400 })
    parentId = sole.id
  } else if (level === 'area') {
    const { data: major } = await supabaseAdmin.from('distributors').select('id')
      .eq('level', 'major').eq('state', state).eq('lga', lga!).eq('is_active', true).maybeSingle()
    if (!major) return NextResponse.json({ error: `Register the LGA distributor for ${lga} first.` }, { status: 400 })
    parentId = major.id
  }

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .insert({ user_id: user.id, level, state, lga: lga ?? null, ward: level === 'area' ? ward : null, parent_id: parentId })
    .select()
    .single()
  if (error) {
    const msg = error.code === '23505'
      ? (error.message.includes('user_id')
          ? 'This user is already registered as a distributor. Remove that entry first.'
          : 'That state, LGA or ward already has an active distributor.')
      : error.code === '23514' ? 'Level, LGA and ward combination is invalid'
      : 'Failed to create distributor'
    return NextResponse.json({ error: msg }, { status: 409 })
  }
  return NextResponse.json({ success: true, distributor: data })
}
