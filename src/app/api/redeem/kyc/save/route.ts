// src/app/api/redeem/kyc/save/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabaseAdmin.from('user_kyc').upsert({
    user_id: payload.userId,
    account_number: body.account_number,
    bank_code: body.bank_code,
    bank_name: body.bank_name,
    account_name: body.account_name,
    bvn: body.bvn || null,
    nin: body.nin || null,
    kyc_status: 'verified',
    verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select().single()

  if (error) return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  return NextResponse.json({ kyc: data })
}
