import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendAdminAlert } from '@/lib/mail'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await req.json()
    
    const { data, error } = await supabaseServer
      .from('advertisements')
      .insert({
        advertiser_id: payload.userId,
        business_name: body.business_name,
        description: body.description || null,
        target_states: body.target_states, // Array
        target_lgas: body.target_lgas,     // Array
        image_url: body.image_url,
        link_url: body.link_url,
        status: 'pending'
      })

    if (error) throw error

    // NEW: Send Admin Email Alert
    await sendAdminAlert(
      'New Advertisement Submitted',
      `A new ad for "${body.business_name}" has been submitted and is awaiting approval.`
    )

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}