import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export type Session = { userId: string; role: string }

// Accepts the same two styles the existing routes use: `token` cookie or Bearer header.
export async function getSession(req: Request): Promise<Session | null> {
  const header = req.headers.get('authorization')
  const bearer = header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined
  const token = bearer || (await cookies()).get('token')?.value
  if (!token) return null
  return (await verifyToken(token)) ?? null
}

export async function getMyLeader(userId: string) {
  const { data } = await supabaseAdmin
    .from('leaders').select('id').eq('user_id', userId).eq('is_active', true).limit(1).maybeSingle()
  return data
}

export async function getMyDistributor(userId: string) {
  const { data } = await supabaseAdmin
    .from('distributors')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()
  return data
}

// Postgres `raise exception` messages from our functions are safe to show; anything else is not.
const SAFE = /^(State code missing|Unknown state|Transaction reference|Insufficient balance|Exceeds funded CIVICT|Quantity must|Invalid denomination|VGI|Distributor not found|Sole distributor|Amount must|Invalid or already used)/
export function rpcError(message: string) {
  return SAFE.test(message) ? message : 'Request failed'
}
