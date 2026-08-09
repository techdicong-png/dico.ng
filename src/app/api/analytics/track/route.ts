import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { path, is_authed } = await req.json()

    let userId = null
    
    // If user is logged in, verify their token to get their ID
    if (is_authed) {
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        const payload = await verifyToken(token)
        if (payload) userId = payload.userId
      }
    }

    // Insert the page view event
    await supabaseServer.from('analytics_events').insert({
      event_type: 'page_view',
      path: path || '/',
      is_authenticated: is_authed || false,
      user_id: userId
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}