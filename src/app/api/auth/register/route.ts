import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  state: z.string().optional(),
  lga: z.string().optional(),
  ward: z.string().optional(),
  role: z.string(),
  ref: z.string().uuid().nullable().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { full_name, email, password, state, lga, ward, role, ref } = parsed.data

    // 1. Create Supabase Auth User (Triggers confirmation email automatically)
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: role || 'voter'
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      throw authError
    }
    
    const userId = authData.user?.id
    if (!userId) throw new Error('Failed to create user account.')

    // 2. Insert into custom users table
    const { error: dbError } = await supabaseServer
      .from('users')
      .insert({
        id: userId,
        email,
        full_name,
        role: role || 'voter',
        state: state || null,
        lga: lga || null,
        ward: ward || null,
        is_active: true,
        civict_balance: 100, // Sign-up bonus
        password_hash: 'managed_by_supabase_auth',
        referred_by: ref || null
      })

    if (dbError) throw dbError

    // 3. Record the sign-up bonus transaction
    await supabaseServer.from('civict_transactions').insert({
      user_id: userId,
      type: 'earn',
      amount: 100,
      description: 'Sign-Up Bonus'
    })

    // 4. Referral Bonus Logic
    if (ref) {
      const { data: referrer } = await supabaseServer.from('users').select('id, civict_balance, full_name').eq('id', ref).single()
      if (referrer) {
        await supabaseServer.from('users').update({ civict_balance: 100 + 50 }).eq('id', userId)
        await supabaseServer.from('civict_transactions').insert({
          user_id: userId, type: 'earn', amount: 50, description: `Referral Bonus from ${referrer.full_name}`
        })

        await supabaseServer.from('users').update({ civict_balance: referrer.civict_balance + 50 }).eq('id', referrer.id)
        await supabaseServer.from('civict_transactions').insert({
          user_id: referrer.id, type: 'earn', amount: 50, description: `Referral Bonus for inviting ${full_name}`
        })
      }
    }

    // 5. NEW: Return success message instead of logging them in
    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account before logging in.' 
    })

  } catch (err: any) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}