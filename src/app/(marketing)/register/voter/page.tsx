'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Upload, CheckCircle, Users, Video, FileText, Coins } from 'lucide-react'
import Image from 'next/image'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
]

const LGA_EXAMPLE = [
  'Eti-Osa','Ikorodu','Surulere','Kosofe','Mushin','Alimosho','Agege','Ojo','Badagry','Epe','Ibeju-Lekki',
]

const CONSTITUENCIES = [
  'Eti-Osa/Lagos Island II','Surulere I','Surulere II','Lagos Mainland I','Ikorodu','Kosofe',
  'Somolu/Bariga','Apapa','Mushin I','Agege','Alimosho I','Badagry','Epe/Ibeju-Lekki',
]

export default function RegisterVoterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    dob: '', gender: '', state: '', lga: '', constituency: '',
    vin: '', ward: '', password: '', confirm: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.dob && (new Date().getFullYear() - new Date(form.dob).getFullYear() < 18)) { setError('You must be 18 or older'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${form.first_name} ${form.last_name}`,
          email: form.email, password: form.password,
          state: form.state, lga: form.lga, ward: form.ward,
          role: 'voter',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      localStorage.setItem('dico_token', data.token)
      localStorage.setItem('dico_user', JSON.stringify(data.user))
      router.push('/dashboard/voter')
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute w-80 h-80 rounded-full border border-white/20 -top-20 -right-20 animate-[spin_20s_linear_infinite]" />
        <div className="absolute w-52 h-52 rounded-full border border-white/20 -bottom-16 -left-16 animate-[spin_18s_linear_infinite_reverse]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">Voter Registration</span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Your Voice <span className="text-gold">Starts Here</span></h1>
            <p className="text-white/80 max-w-xl">
              Register as a verified voter and gain direct access to your representatives, participate in live town halls, vote in civic polls, and track real-time constituency issues.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== MAIN CONTENT ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">

          {/* LEFT: Trust Column */}
          <ScrollReveal>
            <div>
              <h2 className="font-serif text-2xl font-black text-ink mb-2">Why register as a DICO voter?</h2>
              <p className="text-muted mb-6">Your verified identity unlocks direct civic participation, transparent representation, and real community impact.</p>

              {/* Steps mini */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {['Register', 'Verify', 'Engage', 'Impact'].map((s, i) => (
                  <div key={s} className="bg-mint dark:bg-forest/20 rounded-lg p-2.5 text-center">
                    <p className="font-serif text-lg font-black text-forest">{i + 1}</p>
                    <p className="text-[10px] font-bold text-muted">{s}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: CheckCircle, title: 'Verified Voter Identity', desc: "Pass DICO's civic verification to earn a trusted voter badge." },
                  { icon: Users, title: 'Direct Candidate Access', desc: 'Join live digital town halls and ask your representatives questions.' },
                  { icon: FileText, title: 'Track Constituency Reports', desc: 'Submit and monitor real-time infrastructure reports in your ward.' },
                  { icon: Coins, title: 'CIVICT Civic Rewards', desc: 'Earn token rewards for attending sessions, voting, and filing reports.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-mint dark:bg-forest/20 flex items-center justify-center shrink-0">
                      <item.icon className="h-[18px] w-[18px] text-forest" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink text-sm">{item.title}</h4>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voter Profile Mockup */}
              <div className="bg-white dark:bg-[#11241b] border border-border dark:border-white/5 rounded-xl p-5 shadow-md hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-mint-200 to-mint-300 flex items-center justify-center">
                    <Users className="h-5 w-5 text-forest" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-sm">Amina Bello</span>
                      <span className="text-[10px] font-bold bg-forest text-white px-1.5 py-0.5 rounded">✓ VERIFIED</span>
                    </div>
                    <p className="text-xs text-muted">Lagos · Eti-Osa · Ward 7</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border dark:border-white/5">
                  {[{ label: 'Polls Voted', value: '18' }, { label: 'Townhalls', value: '7' }, { label: 'Reports', value: '3' }].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="font-serif text-base font-black text-forest">{s.value}</p>
                      <p className="text-[9px] font-bold tracking-wider uppercase text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* RIGHT: Registration Form */}
          <ScrollReveal>
            <div className="bg-white dark:bg-[#11241b] border border-border dark:border-white/5 rounded-2xl p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border dark:border-white/5">
                <div className="w-9 h-9 rounded-lg bg-mint dark:bg-forest/20 flex items-center justify-center">
                  <Users className="h-[18px] w-[18px] text-forest" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">Voter Registration</h3>
                  <p className="text-xs text-muted">Create your verified civic identity in under 2 minutes</p>
                </div>
              </div>

              {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">First Name</label>
                    <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Last Name</label>
                    <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="Last name" />
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Profile Photo</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border dark:border-white/10 rounded-lg p-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                    {photo ? (
                      <Image src={photo} alt="Preview" width={44} height={44} className="rounded-full object-cover w-11 h-11 mb-2" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center mb-2">
                        <Upload className="h-5 w-5 text-forest" />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-ink">{photo ? 'Change Photo' : 'Attach Photo'}</p>
                    <p className="text-xs text-muted">Passport-style · Max 2MB</p>
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Email</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Phone</label>
                    <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="+234 800 000 0000" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Date of Birth</label>
                    <input type="date" required value={form.dob} onChange={e => setForm({...form, dob: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" />
                    <p className="text-[10px] text-muted mt-0.5">Must be 18 or older</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Gender</label>
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                      className="w-full h-11 px-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold">
                      <option value="">Select...</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">State</label>
                    <select required value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                      className="w-full h-11 px-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold">
                      <option value="">Select state...</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">LGA</label>
                    <select required value={form.lga} onChange={e => setForm({...form, lga: e.target.value})}
                      className="w-full h-11 px-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold">
                      <option value="">Select LGA...</option>
                      {LGA_EXAMPLE.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Federal Constituency</label>
                  <select required value={form.constituency} onChange={e => setForm({...form, constituency: e.target.value})}
                    className="w-full h-11 px-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold">
                    <option value="">Select constituency...</option>
                    {CONSTITUENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">VIN (Voter ID)</label>
                    <input value={form.vin} onChange={e => setForm({...form, vin: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="e.g. 78A12BC34D" />
                    <p className="text-[10px] text-muted mt-0.5">Optional</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Ward</label>
                    <input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="e.g. Ward 7" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Password</label>
                    <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={8}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="Min. 8 characters" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Confirm Password</label>
                    <input type="password" required value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold" placeholder="Repeat password" />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 accent-forest" />
                  <span className="text-xs text-muted">I confirm I am a Nigerian citizen aged 18+ and agree to DICO&apos;s <Link href="#" className="text-gold font-semibold">Voter Verification Policy</Link>.</span>
                </label>

                <button type="submit" disabled={loading}
                  className="w-full bg-gold hover:bg-gold-hover text-ink font-bold py-3 rounded-lg text-sm transition-all disabled:opacity-60">
                  {loading ? 'Creating profile...' : 'Create Verified Voter Profile'}
                </button>
              </form>

              <p className="text-center text-sm text-muted mt-6">
                Already have an account? <Link href="/login" className="text-gold font-semibold">Sign in</Link>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
