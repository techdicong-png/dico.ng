import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: Request) {
  try {
    let userId: string | undefined = undefined;

    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const payload = await verifyToken(token)
      if (payload) userId = payload.userId;
    }

    if (!userId) {
      const cookieStore = await cookies()
      const cookieToken = cookieStore.get('token')?.value
      if (cookieToken) {
        const payload = await verifyToken(cookieToken)
        if (payload) userId = payload.userId;
      }
    }

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseServer
      .from('civict_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ transactions: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}