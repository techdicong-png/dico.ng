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
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await req.json()
    
    const { data, error } = await supabaseServer
      .from('marketplace_items')
      .insert({
        seller_id: payload.userId,
        title: body.title,
        description: body.description,
        price_civict: body.price_civict,
        image_url: body.image_url,
        category: body.category,
        target_lgas: body.target_lgas || null
      })

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}