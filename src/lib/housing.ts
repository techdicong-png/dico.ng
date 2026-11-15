import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServiceAccess, getAccessToken } from '@/lib/service-access'

export const LIVE = ['pending_payment', 'awaiting_confirmation', 'paid', 'supplied']

// Housing is a voucher service: viewers need Housing access (admins can look around but cannot place orders).
export async function housingGate(req: Request): Promise<NextResponse | null> {
  const a = await getServiceAccess(req, 'housing')
  return a.active ? null : NextResponse.json({ error: 'The Housing Contractor service needs a voucher.', locked: true }, { status: 402 })
}

export async function housingToken(): Promise<string | null> {
  return (await getAccessToken('housing')) ?? null
}

export async function contractorId(token: string): Promise<string | null> {
  const { data } = await supabaseAdmin.rpc('service_access_id', { p_token: token, p_service: 'housing' })
  return (data as string) ?? null
}
