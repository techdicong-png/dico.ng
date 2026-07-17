// src/app/api/redeem/kyc/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { data } = await supabaseAdmin.from('user_kyc')
    .select('bank_name, bank_code, account_number, account_name, kyc_status, verified_at')
    .eq('user_id', payload.userId).maybeSingle()

  return NextResponse.json({ kyc: data || null })
}
