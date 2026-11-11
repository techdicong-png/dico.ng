import { NextResponse } from 'next/server'
import { nearestWards, inNigeria } from '@/lib/spacify'
import { supabaseAdmin } from '@/lib/supabase'
import { getServiceAccess } from '@/lib/service-access'

// Public. Given the caller's coordinates, returns the nearest wards (and nearest polling units once
// polling-unit data has been imported). The coordinates are used for this one lookup only:
// they are not stored, not logged, and not sent to any third party.
const NO_STORE = { 'Cache-Control': 'no-store' }
const hits = new Map<string, { n: number; reset: number }>()
function throttled(ip: string) {
  const now = Date.now(); const a = hits.get(ip)
  if (!a || a.reset < now) { hits.set(ip, { n: 1, reset: now + 60_000 }); return false }
  a.n += 1
  return a.n > 30
}

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429, headers: NO_STORE })

  // DICO Spacify is a paid service: it needs a redeemed voucher (admins are exempt)
  const access = await getServiceAccess(req, 'spacify')
  if (!access.active) return NextResponse.json({ error: 'DICO Spacify needs a voucher.', locked: true }, { status: 402, headers: NO_STORE })

  const sp = new URL(req.url).searchParams
  const lat = Number(sp.get('lat')), lon = Number(sp.get('lon'))
  if (!inNigeria(lat, lon)) return NextResponse.json({ error: 'That location is outside Nigeria.' }, { status: 400, headers: NO_STORE })

  const wards = nearestWards(lat, lon, 5)
  const { data: pollingUnits } = await supabaseAdmin.rpc('nearest_polling_units', { p_lat: lat, p_lon: lon, p_limit: 5 })
  return NextResponse.json({ wards, pollingUnits: pollingUnits ?? [] }, { headers: NO_STORE })
}
