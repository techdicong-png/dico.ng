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

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json({ error: 'Email already registered. Please log in or request a new code.' }, { status: 409 })
      }
      return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Failed to create auth account.' }, { status: 500 })

    // 2. Insert into public.users table
    const { error: dbUserErr } = await supabaseServer
      .from('users')
      .insert({
        id: userId,
        email,
        full_name,
        role: 'candidate',
        is_active: true,
        civict_balance: 0,
        password_hash: 'managed_by_supabase_auth',
        email_verified: false,
        // 🔴 ADD THESE MISSING FIELDS:
        phone: phone,
        state: state_constituency,
        lga: lga_constituency,
        ward: ward || null,
        avatar_url: avatar_url || null
      })

    if (dbUserErr) {
      console.error('Failed to create public.users profile:', dbUserErr)
      return NextResponse.json({ error: 'Failed to create user profile.' }, { status: 500 })
    }

    // 3. Insert candidate_registrations
    const { error: insertErr } = await supabaseServer
      .from('candidate_registrations')
      .insert({
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
      })

    if (insertErr) {
      console.error('Candidate registration insert error:', insertErr)
      return NextResponse.json({ error: 'Failed to submit candidate registration.' }, { status: 500 })
    }

    // 4. Trigger OTP Email
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

    if (otpInsertErr) {
      console.error('Failed to save OTP to database:', otpInsertErr)
      return NextResponse.json({ error: 'Failed to generate verification code. Please contact support.' }, { status: 500 })
    }

    await sendOTPEmail(email, otp, full_name)

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted! Check your email for the 6-digit code.'
    })

  } catch (err: any) {
    console.error('Candidate registration error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}