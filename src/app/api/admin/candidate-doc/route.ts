import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Initialize inline safely for server-only usage
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

    const { data, error } = await supabaseServer.storage.from('candidate-docs').createSignedUrl(path, 60)
    if (error) throw error

    return NextResponse.json({ url: data.signedUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}