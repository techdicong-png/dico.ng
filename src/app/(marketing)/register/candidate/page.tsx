'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { CheckCircle, Upload, Shield, Users, Video, Coins } from 'lucide-react'
import Image from 'next/image'

const NIGERIAN_PARTIES = [
  'APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP', 'YPP', 'ADC', 'PRP', 'ZLP', 'Other',
]

const OFFICES = [
  'President', 'Governor', 'Senate', 'House of Representatives',
  'House of Assembly', 'Local Council Chair', 'Councillor',
]

export default function RegisterCandidatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '', party: '', email: '', state: '', office: '',
    password: '', confirm: '', lga: '', ward: '',
  })
  const [photo, setPhoto] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'candidate' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      localStorage.setItem('dico_token', data.token)
      localStorage.setItem('dico_user', JSON.stringify(data.user))
      router.push('/dashboard/candidate')
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
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">Candidate Portal</span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Join DICO <span className="text-gold">Verified</span></h1>
            <p className="text-white/80 max-w-xl">Create your secure candidate profile, connect with verified voters in your constituency, and lead digital civic engagement.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== MAIN CONTENT ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          
          {/* LEFT: Trust Column */}
          <ScrollReveal>
            <div>
              <h2 className="font-serif text-2xl font-black text-ink mb-2">Why join DICO as a candidate?</h2>
              <p className="text-muted mb-8">Stand out in the digital civic space with verified transparency and direct voter reach.</p>

              <div className="space-y-5 mb-8">
                {[
                  { icon: Shield, title: 'Verified Trust Profile', desc: "Pass DICO's civic verification checks to earn a trusted badge that voters rely on." },
                  { icon: Video, title: 'Direct Voter Sessions', desc: 'Host secure digital town halls and answer constituency questions directly.' },
                  { icon: Coins, title: 'CIVICT Civic Rewards', desc: 'Earn transparent token rewards for verified engagement, accountability, and issue resolution.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-mint dark:bg-forest/20 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="h-5 w-5 text-forest" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink">{item.title}</h4>
                      <p className="text-sm text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Mockup */}
              <div className="bg-white dark:bg-[#11241b] border border-border dark:border-white/5 rounded-xl p-5 shadow-md hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-200 to-mint-300 flex items-center justify-center">
                    <Users className="h-6 w-6 text-forest" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">Hon. Candidate Name</span>
                      <span className="text-[10px] font-bold bg-forest text-white px-1.5 py-0.5 rounded">✓ VERIFIED</span>
                    </div>
                    <p className="text-xs text-muted">Party · Constituency · State</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border dark:border-white/5">
                  {[{ label: 'Engagement', value: '84%' }, { label: 'Townhalls', value: '12' }, { label: 'Trust Score', value: '4.7' }].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="font-serif text-lg font-black text-forest">{s.value}</p>
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
              <h3 className="font-serif text-xl font-bold text-ink mb-6">Create Verified Profile</h3>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Full Name</label>
                    <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12"
                      placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Political Party</label>
                    <select required value={form.party} onChange={e => setForm({...form, party: e.target.value})}
                      className="w-full h-11 px-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold">
                      <option value="">Select party...</option>
                      {NIGERIAN_PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Official Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12"
                    placeholder="candidate@example.com" />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Profile / Passport Photo</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border dark:border-white/10 rounded-lg p-5 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                    {photo ? (
                      <Image src={photo} alt="Preview" width={48} height={48} className="rounded-full object-cover w-12 h-12 mb-2" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-mint flex items-center justify-center mb-2">
                        <Upload className="h-5 w-5 text-forest" />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-ink">{photo ? 'Change Photo' : 'Attach Image'}</p>
                    <p className="text-xs text-muted mt-0.5">Drag & drop or click to upload</p>
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">State</label>
                    <select required value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                      className="w-full h-11 px-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold">
                      <option value="">Select state...</option>
                      <option>Lagos</option><option>Oyo</option><option>Kaduna</option><option>Rivers</option>
                      <option>Enugu</option><option>Edo</option><option>FCT Abuja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Contested Office</label>
                    <select required value={form.office} onChange={e => setForm({...form, office: e.target.value})}
                      className="w-full h-11 px-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold">
                      <option value="">Select office...</option>
                      {OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Create Password</label>
                    <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={8}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold"
                      placeholder="Min. 8 characters" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Confirm Password</label>
                    <input type="password" required value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white dark:bg-transparent border border-border dark:border-white/10 rounded-lg focus:outline-none focus:border-gold"
                      placeholder="Repeat password" />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 accent-forest" />
                  <span className="text-xs text-muted">I agree to DICO&apos;s <Link href="#" className="text-gold font-semibold">Candidate Verification Terms</Link> and <Link href="#" className="text-gold font-semibold">Civic Transparency Policy</Link>.</span>
                </label>

                <button type="submit" disabled={loading}
                  className="w-full bg-gold hover:bg-gold-hover text-ink font-bold py-3 rounded-lg text-sm transition-all disabled:opacity-60">
                  {loading ? 'Creating profile...' : 'Create Verified Profile'}
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
