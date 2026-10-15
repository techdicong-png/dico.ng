import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rpcError } from '@/lib/voucher-auth'

// Public, no signup. Light per-IP throttle (best effort: in-memory, resets per server instance).
const attempts = new Map<string, { n: number; reset: number }>()
function throttled(ip: string) {
  const now = Date.now()
  const a = attempts.get(ip)
  if (!a || a.reset < now) { attempts.set(ip, { n: 1, reset: now + 10 * 60_000 }); return false }
  a.n += 1
  return a.n > 10
}

const schema = z.object({
  code: z.string().trim().min(8).max(32),
  phone: z.string().regex(/^(0|234)\d{10}$/, 'Enter a valid Nigerian phone number'),
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { data, error } = await supabaseAdmin.rpc('redeem_voucher', {
    p_code: parsed.data.code,
    p_phone: parsed.data.phone,
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) }, { status: 400 })

  // TODO: deliver the service for `data.denomination` once the service catalogue is defined.
  return NextResponse.json({ success: true, denomination: data.denomination })
}
