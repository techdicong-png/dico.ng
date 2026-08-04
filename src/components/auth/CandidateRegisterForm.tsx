'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Upload, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { STATES, NIGERIA_DATA } from '@/data/nigeria'
import { NIGERIAN_PARTIES, OFFICE_LEVELS } from '@/data/parties'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function CandidateRegisterForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', phone: '', email: '', password: '',
    state_of_origin: '', lga_of_origin: '', home_address: '',
    state_constituency: '', lga_constituency: '', ward: '', senatorial_district: '', federal_constituency: '',
    party: '', office_level: '', campaign_slogan: '', manifesto_summary: ''
  })

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    id_card: null, party_membership: null, nomination_form: null, cert_return: null, other: null
  })

  const lgas = form.state_constituency ? Object.keys(NIGERIA_DATA[form.state_constituency] || {}).sort() : []
  const wards = (form.state_constituency && form.lga_constituency) ? NIGERIA_DATA[form.state_constituency]?.[form.lga_constituency] || [] : []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'state_constituency') {
      setForm(prev => ({ ...prev, state_constituency: value, lga_constituency: '', ward: '' }))
    } else if (name === 'lga_constituency') {
      setForm(prev => ({ ...prev, lga_constituency: value, ward: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docKey: string) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError(`${file.name} is too large. Max 50MB.`)
        return
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name} is invalid. Only JPG, PNG, PDF allowed.`)
        return
      }
      setUploadedFiles({ ...uploadedFiles, [docKey]: file })
      setError('')
    }
  }

  const removeFile = (docKey: string) => setUploadedFiles({ ...uploadedFiles, [docKey]: null })

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!form.full_name || !form.phone || !form.email || !form.password || !/\S+@\S+\.\S+/.test(form.email)) {
        setError('Please fill all required fields with valid data.')
        return false
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return false
      }
    }
    if (step === 2 && (!form.state_constituency || !form.lga_constituency)) {
      setError('Please select your State and LGA of constituency.'); return false
    }
    if (step === 3 && (!form.party || !form.office_level)) {
      setError('Please select your party and position.'); return false
    }
    setError('')
    return true
  }

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(currentStep + 1) }
  const prevStep = () => setCurrentStep(currentStep - 1)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // 1. Create Supabase Auth User (Triggers confirmation email automatically)
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            role: 'candidate' // Set role metadata
          }
        }
      })

      if (authErr) throw authErr
      const userId = authData.user?.id
      if (!userId) throw new Error('Failed to create user account.')

      // 2. Insert registration record linked to the auth user
      const { data: reg, error: insertErr } = await supabase
        .from('candidate_registrations')
        .insert({
          user_id: userId, // Link to auth.users
          full_name: form.full_name,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          phone: form.phone,
          email: form.email,
          home_address: form.home_address || null,
          state_of_origin: form.state_of_origin || null,
          lga_of_origin: form.lga_of_origin || null,
          state_constituency: form.state_constituency,
          lga_constituency: form.lga_constituency,
          ward: form.ward || null,
          senatorial_district: form.senatorial_district || null,
          federal_constituency: form.federal_constituency || null,
          party: form.party,
          position: form.office_level, 
          level: form.office_level,    
          campaign_slogan: form.campaign_slogan || null,
          manifesto_summary: form.manifesto_summary || null,
          status: 'pending'
        })
        .select('id')
        .single()

      if (insertErr) throw insertErr
      const regId = reg.id

      // 3. Upload documents
      const docPaths: Record<string, string> = {}
      for (const [docKey, file] of Object.entries(uploadedFiles)) {
        if (file) {
          const ext = file.name.split('.').pop()
          const path = `${regId}/${docKey}.${ext}`
          const { error: uploadErr } = await supabase.storage.from('candidate-docs').upload(path, file, { upsert: true })
          if (uploadErr) throw uploadErr
          docPaths[`doc_${docKey}`] = path
        }
      }

      if (Object.keys(docPaths).length > 0) {
        await supabase.from('candidate_registrations').update(docPaths).eq('id', regId)
      }

      setSuccess(true)
    } catch (err: any) {
      console.error('Submission error:', err)
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

    if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-forest-light flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-forest" />
        </div>
        <h2 className="font-serif text-2xl font-black text-ink mb-2">Application Submitted!</h2>
        <p className="text-sm text-muted max-w-md mx-auto mb-6">
          Your candidate registration has been received. Please check your email to verify your account. Our team will review your application and contact you within 2–5 business days.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Home
          </Button>
          {/* NEW: Direct link to Login */}
          <Button onClick={() => router.push('/login')} className="bg-forest hover:bg-forest-mid text-white">
            Proceed to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-border rounded-2xl shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest to-gold" />

      {/* Progress Bar */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        {[
          { num: 1, label: 'Personal' }, { num: 2, label: 'Constituency' }, { num: 3, label: 'Political' }, { num: 4, label: 'Documents' }, { num: 5, label: 'Review' }
        ].map((step, i) => (
          <div key={step.num} className="flex items-center w-full last:w-auto">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                currentStep > step.num ? 'bg-forest text-white border-forest' :
                currentStep === step.num ? 'bg-white text-forest border-forest' : 'bg-white text-muted border-border'
              }`}>
                {currentStep > step.num ? <CheckCircle className="h-4 w-4" /> : step.num}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide uppercase mt-1.5 ${currentStep >= step.num ? 'text-forest' : 'text-muted'}`}>{step.label}</span>
            </div>
            {i < 4 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${currentStep > step.num ? 'bg-forest' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <div className="p-8 pt-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-6">{error}</div>}

        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="font-serif text-2xl font-black text-ink">Personal Details</h2>
            <p className="text-sm text-muted -mt-2">Basic biographical information about you.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Full Legal Name *</label>
                <Input name="full_name" value={form.full_name} onChange={handleInputChange} placeholder="As it appears on your ID" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Date of Birth</label>
                <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handleInputChange} className="w-full h-10 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Phone Number *</label>
                <Input type="tel" name="phone" value={form.phone} onChange={handleInputChange} placeholder="08012345678" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Email Address *</label>
                <Input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Password *</label>
                <Input type="password" name="password" value={form.password} onChange={handleInputChange} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">State of Origin</label>
                <select name="state_of_origin" value={form.state_of_origin} onChange={handleInputChange} className="w-full h-10 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest">
                  <option value="">Select state…</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Home Address</label>
              <Input name="home_address" value={form.home_address} onChange={handleInputChange} placeholder="House number, street, city" />
            </div>
          </div>
        )}

        {/* STEP 2: CONSTITUENCY */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="font-serif text-2xl font-black text-ink">Constituency Information</h2>
            <p className="text-sm text-muted -mt-2">Where are you running? Provide your electoral constituency details.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">State of Constituency *</label>
                <select name="state_constituency" value={form.state_constituency} onChange={handleInputChange} className="w-full h-10 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest">
                  <option value="">Select state…</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">LGA of Constituency *</label>
                <select name="lga_constituency" value={form.lga_constituency} onChange={handleInputChange} disabled={!form.state_constituency} className="w-full h-10 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest disabled:opacity-50">
                  <option value="">Select LGA…</option>
                  {lgas.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Ward</label>
                <select name="ward" value={form.ward} onChange={handleInputChange} disabled={!form.lga_constituency} className="w-full h-10 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest disabled:opacity-50">
                  <option value="">Select ward…</option>
                  {wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Senatorial District</label>
                <Input name="senatorial_district" value={form.senatorial_district} onChange={handleInputChange} placeholder="e.g. Edo Central" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Federal Constituency</label>
              <Input name="federal_constituency" value={form.federal_constituency} onChange={handleInputChange} placeholder="e.g. Oredo Federal Constituency" />
            </div>
          </div>
        )}

        {/* STEP 3: POLITICAL DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="font-serif text-2xl font-black text-ink">Political Information</h2>
            <p className="text-sm text-muted -mt-2">Your party affiliation, position, and campaign message.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Political Party *</label>
                <select name="party" value={form.party} onChange={handleInputChange} className="w-full h-10 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest">
                  <option value="">Select party…</option>
                  {NIGERIAN_PARTIES.map(p => <option key={p.abbr} value={p.name}>{p.name} ({p.abbr})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Position Running For *</label>
                <select name="office_level" value={form.office_level} onChange={handleInputChange} className="w-full h-10 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest">
                  <option value="">Select position…</option>
                  {OFFICE_LEVELS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Campaign Slogan</label>
              <Input name="campaign_slogan" value={form.campaign_slogan} onChange={handleInputChange} placeholder="e.g. A New Dawn for Edo State" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Manifesto Summary</label>
              <Textarea name="manifesto_summary" value={form.manifesto_summary} onChange={handleInputChange} rows={5} placeholder="Briefly describe your key policy priorities..." />
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENTS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-up">
            <h2 className="font-serif text-2xl font-black text-ink">Supporting Documents</h2>
            <p className="text-sm text-muted -mt-2">All documents are optional for now. Accepted formats: JPG, PNG, PDF — max 50MB.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries({
                id_card: 'National ID / NIN Slip', party_membership: 'Party Membership Form', nomination_form: 'INEC Nomination Form', cert_return: 'Certificate of Return'
              }).map(([key, label]) => (
                <div key={key} className="border border-border rounded-lg p-4 bg-sand">
                  <p className="text-sm font-semibold text-ink mb-2">{label}</p>
                  {!uploadedFiles[key] ? (
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-forest hover:bg-forest-faint transition-colors">
                      <Upload className="h-5 w-5 text-muted mb-1" />
                      <span className="text-xs text-muted">Click to upload</span>
                      <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={(e) => handleFileChange(e, key)} />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-forest-light border border-forest/20 rounded-md p-2">
                      <span className="text-xs text-ink truncate">{uploadedFiles[key]!.name}</span>
                      <button onClick={() => removeFile(key)} className="text-red-500 text-xs font-bold ml-2">✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-up">
            <h2 className="font-serif text-2xl font-black text-ink">Review Your Application</h2>
            <p className="text-sm text-muted -mt-2">Please review all details carefully before submitting.</p>
            <div className="bg-sand border border-border rounded-lg p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><strong className="block text-muted text-xs uppercase mb-1">Name</strong> {form.full_name}</div>
                <div><strong className="block text-muted text-xs uppercase mb-1">Email</strong> {form.email}</div>
                <div><strong className="block text-muted text-xs uppercase mb-1">Phone</strong> {form.phone}</div>
                <div><strong className="block text-muted text-xs uppercase mb-1">Party</strong> {form.party}</div>
                <div><strong className="block text-muted text-xs uppercase mb-1">Position</strong> {OFFICE_LEVELS.find(o => o.value === form.office_level)?.label}</div>
                <div><strong className="block text-muted text-xs uppercase mb-1">Constituency</strong> {form.lga_constituency}, {form.state_constituency}</div>
              </div>
              {form.manifesto_summary && (
                <div>
                  <strong className="block text-muted text-xs uppercase mb-1">Manifesto</strong>
                  <p className="text-ink/80">{form.manifesto_summary}</p>
                </div>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md p-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>By submitting, you confirm that all information provided is accurate and truthful. False information may result in disqualification.</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-light">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep} disabled={loading}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          ) : <div />}
          {currentStep < 5 ? (
            <Button onClick={nextStep} className="bg-forest hover:bg-forest-mid">
              Next Step <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="bg-gold hover:bg-gold-hover text-ink">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}