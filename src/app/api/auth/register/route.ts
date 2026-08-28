import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { sendOTPEmail } from '@/lib/mail'

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
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "Local Government Area is required"),
  ward: z.string().optional(),
  role: z.string(),
  ref: z.string().uuid().nullable().optional(),
  phone: z.string().min(11, "Phone number is required").max(12, "Phone number is too long"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { full_name, email, password, state, lga, ward, role, ref, phone } = parsed.data

    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: { data: { full_name, role: role || 'voter' } }
    })

    let userId = authData.user?.id
    let isAlreadyVerified = false

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        const { data: existingDbUser } = await supabaseServer
          .from('users')
          .select('id, email_verified')
          .eq('email', email)
          .maybeSingle()
        
        if (existingDbUser) {
          userId = existingDbUser.id
          if (existingDbUser.email_verified) isAlreadyVerified = true
        } else {
          // BULLETPROOF ZOMBIE RECOVERY:
          const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({ email, password })
          
          if (!signInError && signInData.user) {
            userId = signInData.user.id
            await supabaseAuth.auth.signOut()
            
            await supabaseServer.from('users').insert({
              id: userId, 
              email, 
              full_name, 
              role: role || 'voter', 
              state: state || null, 
              lga: lga || null, 
              ward: ward || null,
              is_active: true, 
              civict_balance: 100, 
              password_hash: 'managed_by_supabase_auth', 
              referred_by: ref || null, 
              email_verified: false,
              phone: phone,
            })
            
            await supabaseServer.from('civict_transactions').insert({ 
              user_id: userId, 
              type: 'earn', 
              amount: 100, 
              description: 'Sign-Up Bonus' 
            })
          } else {
            return NextResponse.json({ 
              error: 'This email is blocked by Supabase. Please use a completely new email address.' 
            }, { status: 400 })
          }
        }
      } else {
        return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 400 })
      }
    }

    if (!userId) return NextResponse.json({ error: 'Failed to create auth account.' }, { status: 500 })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)
    const otpHash = await bcrypt.hash(otp, 10)

    const { error: otpInsertErr } = await supabaseServer.from('email_otp').insert({
      user_id: userId, 
      email, 
      otp_hash: otpHash, 
      purpose: 'verify_email', 
      expires_at: expiresAt.toISOString(), 
      used: false
    })

    if (otpInsertErr) return NextResponse.json({ error: 'Failed to generate verification code.' }, { status: 500 })

    await sendOTPEmail(email, otp, full_name)

    return NextResponse.json({ 
      success: true, 
      message: isAlreadyVerified ? 'Account already exists. Please log in.' : 'Account created! Check your email.',
      email: email
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}