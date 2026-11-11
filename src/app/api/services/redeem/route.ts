import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rpcError } from '@/lib/voucher-auth'
import { ACCESS_COOKIE } from '@/lib/service-access'

// Public, no account needed. Redeems a voucher for a service and opens access on this browser.
// The same code + phone number can reopen access on up to 3 devices while it is still valid.
const hits = new Map<string, { n: number; reset: number }>()
function throttled(ip: string) {
  const now = Date.now(); const a = hits.get(ip)
  if (!a || a.reset < now) { hits.set(ip, { n: 1, reset: now + 10 * 60_000 }); return false }
  a.n += 1
  return a.n > 10
}

const SERVICES = ['spacify'] as const
const schema = z.object({
  code: z.string().trim().min(8).max(32),
  phone: z.string().min(10).max(20),
  service: z.enum(SERVICES),
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter your voucher code and phone number' }, { status: 400 })

  let phone = parsed.data.phone.replace(/\D/g, '')
  if (phone.startsWith('234')) phone = '0' + phone.slice(3)
  if (!/^0\d{10}$/.test(phone)) return NextResponse.json({ error: 'Enter a valid Nigerian phone number' }, { status: 400 })

  const token = randomBytes(24).toString('hex')
  const { data, error } = await supabaseAdmin.rpc('redeem_for_service', {
    p_code: parsed.data.code, p_phone: phone, p_service: parsed.data.service, p_token: token,
  })
  const row = Array.isArray(data) ? data[0] : data
  if (error || !row) return NextResponse.json({ error: rpcError(error?.message ?? '') }, { status: 400 })

  const res = NextResponse.json({ success: true, service: parsed.data.service, expires_at: row.expires_at, days: row.days, denomination: row.denomination, restored: row.restored })
  res.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production',
    maxAge: Math.max(60, Math.floor((new Date(row.expires_at).getTime() - Date.now()) / 1000)),
  })
  return res
}
