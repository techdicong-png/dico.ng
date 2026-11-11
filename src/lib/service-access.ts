import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

export const ACCESS_COOKIE = 'spacify_access'
export type Access = { active: boolean; expires_at: string | null; via: 'voucher' | 'admin' | null }

// Is the caller allowed to use a voucher-gated service? Admins always are; everyone else needs a
// valid access token from redeeming a voucher (kept in an httpOnly cookie).
export async function getServiceAccess(req: Request, service: string): Promise<Access> {
  const session = await getSession(req).catch(() => null)
  if (session?.role === 'admin') return { active: true, expires_at: null, via: 'admin' }
  const token = (await cookies()).get(ACCESS_COOKIE)?.value
  if (!token) return { active: false, expires_at: null, via: null }
  const { data } = await supabaseAdmin.rpc('check_service_access', { p_token: token, p_service: service })
  return data ? { active: true, expires_at: data as string, via: 'voucher' } : { active: false, expires_at: null, via: null }
}
