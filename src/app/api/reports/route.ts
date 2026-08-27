import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await req.json()
    const { title, description, category, ward, lga, state, image_url } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 })
    }

    // 1. Insert the report
    const { data: report, error: insertErr } = await supabaseAdmin.from('reports').insert({
      user_id: payload.userId,
      title,
      description: description || null,
      category,
      ward: ward || null,
      lga: lga || null,
      state: state || null,
      image_url: image_url || null,
      status: 'submitted'
    }).select().single()

    if (insertErr) throw insertErr

    // 2. Award 15 CIVICT to the voter
    await supabaseAdmin.from('civict_transactions').insert({
      user_id: payload.userId,
      type: 'report_submitted',
      amount: 15,
      description: 'Submitted a community infrastructure report'
    })

    // 3. Safely increment their balance
    const { data: user } = await supabaseAdmin.from('users').select('civict_balance').eq('id', payload.userId).single()
    if (user) {
      await supabaseAdmin.from('users').update({ 
        civict_balance: (user.civict_balance || 0) + 15 
      }).eq('id', payload.userId)
    }

    return NextResponse.json({ success: true, report })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}