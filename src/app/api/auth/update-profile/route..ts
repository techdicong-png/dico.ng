import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await req.json()
    
    const { data, error } = await supabaseServer
      .from('users')
      .update({
        full_name: body.full_name,
        phone: body.phone,
        state: body.state,
        lga: body.lga,
        ward: body.ward,
        bio: body.bio,
        avatar_url: body.avatar_url
      })
      .eq('id', payload.userId)
      .select('id, full_name, email, role, phone, state, lga, ward, bio, avatar_url, civict_balance')
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })

  } catch (err: any) {
    console.error('Profile update API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Also add a GET route so the profile page can load the user data
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { data, error } = await supabaseServer
      .from('users')
      .select('id, full_name, email, role, phone, state, lga, ward, bio, avatar_url, civict_balance')
      .eq('id', payload.userId)
      .single()

    if (error) throw error

    return NextResponse.json({ user: data })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}