// src/app/api/civict/balance/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const [user, transactions] = await Promise.all([
    supabaseAdmin.from('users').select('civict_balance, civict_rank').eq('id', payload.userId).single(),
    supabaseAdmin.from('civict_transactions')
      .select('type, amount, description, created_at')
      .eq('user_id', payload.userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return NextResponse.json({
    balance: user.data?.civict_balance ?? 0,
    rank: user.data?.civict_rank ?? 'observer',
    transactions: transactions.data ?? [],
  })
}
