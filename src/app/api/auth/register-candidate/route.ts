import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const { 
      full_name, email, password, phone, 
      state_of_origin, lga_of_origin, home_address,
      state_constituency, lga_constituency, ward, senatorial_district, federal_constituency,
      party, office_level, campaign_slogan, manifesto_summary, avatar_url,
      date_of_birth, gender,
      doc_id_card, doc_party_membership, doc_nomination_form, doc_cert_return, doc_other
    } = body

    if (!full_name || !email || !password || !phone || !state_constituency || !lga_constituency || !party || !office_level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email, 
      password, 
      options: { data: { full_name, role: 'candidate' } }
    })

    let userId = authData.user?.id
    let isAlreadyVerified = false

    // Handle "Already Registered" live candidates gracefully
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
              role: 'candidate', 
              is_active: true, 
              civict_balance: 0, 
              password_hash: 'managed_by_supabase_auth', 
              email_verified: false
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

    // 2. Upsert candidate_registrations
    const { error: insertErr } = await supabaseServer.from('candidate_registrations').upsert({
      user_id: userId, 
      full_name, 
      avatar_url: avatar_url || null, 
      date_of_birth: date_of_birth || null, 
      gender: gender || null,
      phone, 
      email, 
      home_address: home_address || null, 
      state_of_origin: state_of_origin || null, 
      lga_of_origin: lga_of_origin || null,
      state_constituency, 
      lga_constituency, 
      ward: ward || null, 
      senatorial_district: senatorial_district || null, 
      federal_constituency: federal_constituency || null,
      party, 
      position: office_level, 
      level: office_level, 
      campaign_slogan: campaign_slogan || null, 
      manifesto_summary: manifesto_summary || null,
      doc_id_card: doc_id_card || null, 
      doc_party_membership: doc_party_membership || null, 
      doc_nomination_form: doc_nomination_form || null,
      doc_cert_return: doc_cert_return || null, 
      doc_other: doc_other || null, 
      status: 'pending'
    }, { onConflict: 'user_id' })

    if (insertErr) {
      console.error('Candidate registration insert error:', insertErr)
      return NextResponse.json({ error: `Database Error: ${insertErr.message}` }, { status: 500 })
    }

    // 3. Trigger OTP Email ONLY IF NOT ALREADY VERIFIED
    if (!isAlreadyVerified) {
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
    }

    return NextResponse.json({ 
      success: true, 
      message: isAlreadyVerified ? 'Application submitted! You can now log in.' : 'Application submitted! Check your email.'
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}