// src/app/(marketing)/explorer/page.tsx
'use client'

import { useState } from 'react'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { MapPin, Search, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const NIGERIAN_STATES = [
  'Lagos', 'Oyo', 'Kaduna', 'Rivers', 'Abia', 'Anambra', 'Enugu', 'Delta',
  'Edo', 'Ekiti', 'Ogun', 'Ondo', 'Osun', 'Kwara', 'Kogi', 'Benue',
  'Plateau', 'Nasarawa', 'Niger', 'FCT Abuja', 'Kano', 'Katsina', 'Jigawa',
  'Bauchi', 'Gombe', 'Yobe', 'Borno', 'Adamawa', 'Taraba', 'Kebbi',
  'Sokoto', 'Zamfara', 'Imo', 'Bayelsa', 'Akwa Ibom', 'Cross River',
]

const SAMPLE_LGAS: Record<string, string[]> = {
  Lagos: ['Eti-Osa', 'Surulere', 'Ikeja', 'Ikorodu', 'Kosofe', 'Alimosho', 'Agege', 'Mushin', 'Ojo', 'Badagry', 'Epe', 'Ibeju-Lekki'],
  Oyo: ['Ibadan North', 'Ibadan South', 'Ogbomosho', 'Oyo East', 'Saki', 'Iseyin'],
  Kaduna: ['Kaduna North', 'Kaduna South', 'Zaria', 'Kachia', 'Kaura', 'Jema\'a'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Bonny', 'Eleme', 'Oyigbo', 'Okrika', 'Degema'],
  'FCT Abuja': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Abaji', 'Kwali'],
}

const STEPS = [
  { num: '1', title: 'Enter Your Location', desc: 'Select your state, LGA, and ward to find your constituency.' },
  { num: '2', title: 'View Your Match', desc: 'See your verified constituency, representative, and civic index.' },
  { num: '3', title: 'Engage & Participate', desc: 'Join town halls, vote in polls, and track reports in your area.' },
]

// Mock match result
function simulateMatch(state: string, lga: string) {
  return {
    constituency: `${lga} Federal Constituency`,
    representative: 'Hon. Representative',
    wardCount: Math.floor(Math.random() * 12) + 6,
    civicIndex: Math.floor(Math.random() * 40) + 55,
    registeredVoters: Math.floor(Math.random() * 50000) + 10000,
  }
}

const particles = [...Array(12)].map((_, i) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 2}s`,
  duration: `${3 + Math.random() * 4}s`,
  drift: `${Math.random() * 20 - 10}px`,
}))

export default function ExplorerPage() {
  const [state, setState] = useState('')
  const [lga, setLga] = useState('')
  const [ward, setWard] = useState('')
  const [match, setMatch] = useState<any>(null)
  const [searched, setSearched] = useState(false)

  const lgas = state ? (SAMPLE_LGAS[state] || [`${state} North`, `${state} South`, `${state} Central`]) : []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!state || !lga) return
    setMatch(simulateMatch(state, lga))
    setSearched(true)
  }

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        {/* Particles */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: p.left, top: p.top,
              animation: `float ${p.duration} ease-in-out ${p.delay} infinite alternate`,
              transform: `translateX(${p.drift})`,
            }} />
        ))}
      </div>
        <div className="absolute w-80 h-80 rounded-full border border-white/15 -top-20 -right-20 animate-[spin_20s_linear_infinite] pointer-events-none" />
        <div className="absolute w-52 h-52 rounded-full border border-white/15 -bottom-16 -left-16 animate-[spin_18s_linear_infinite_reverse] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
              <MapPin className="h-3 w-3" /> Find Your Constituency
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Your Constituency, <span className="text-gold">Your Voice</span></h1>
            <p className="text-white/80 max-w-xl mb-8">
              Discover your federal constituency, meet your representatives, and track civic engagement in your ward — all in one place.
            </p>
          </ScrollReveal>

          {/* Search Panel */}
          <ScrollReveal>
            <form onSubmit={handleSearch} className="bg-white/10 border border-white/15 rounded-xl p-6 backdrop-blur-sm max-w-2xl">
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1.5">State</label>
                  <select value={state} onChange={e => { setState(e.target.value); setLga(''); setWard(''); setMatch(null) }}
                    className="w-full h-11 px-3 text-sm text-ink bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold">
                    <option value="">Select state...</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1.5">LGA</label>
                  <select value={lga} onChange={e => { setLga(e.target.value); setMatch(null) }} disabled={!state}
                    className="w-full h-11 px-3 text-sm text-ink bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50">
                    <option value="">Select LGA...</option>
                    {lgas.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1.5">Ward (optional)</label>
                  <select value={ward} onChange={e => setWard(e.target.value)} disabled={!lga}
                    className="w-full h-11 px-3 text-sm text-ink bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50">
                    <option value="">Select ward...</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(w => <option key={w} value={`Ward ${w}`}>Ward {w}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={!state || !lga}
                className="w-full bg-gold hover:bg-gold-hover text-ink font-bold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <Search className="h-4 w-4" />
                Find My Constituency
              </button>
            </form>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== MATCH RESULTS ==================== */}
      {searched && (
        <section className="py-16 md:py-20 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              {match ? (
                <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-forest" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-black text-ink">Your Constituency Match</h2>
                      <p className="text-sm text-muted">{state} · {lga}{ward ? ` · ${ward}` : ''}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Constituency', value: match.constituency },
                      { label: 'Representative', value: match.representative },
                      { label: 'Civic Index', value: `${match.civicIndex}/100`, gold: true },
                      { label: 'Registered Voters', value: match.registeredVoters.toLocaleString() },
                    ].map(item => (
                      <div key={item.label} className="bg-sand rounded-xl p-4">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-1">{item.label}</p>
                        <p className={`font-serif text-xl font-black ${item.gold ? 'text-gold' : 'text-forest'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Link href="/register?role=voter" className="bg-forest hover:bg-forest-mid text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all">
                      Register as Voter
                    </Link>
                    <Link href={`/candidates?state=${state}&lga=${lga}`} className="border border-border text-ink hover:bg-sand font-semibold text-sm px-6 py-3 rounded-lg transition-all">
                      View Candidates in {lga}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-2xl p-8 text-center">
                  <p className="text-muted">No match found. Try a different search.</p>
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">How It Works</h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-12">Find your constituency in three simple steps.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(step => (
              <ScrollReveal key={step.num}>
                <div className="bg-white border border-border rounded-xl p-6 text-center hover:border-forest hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center mx-auto mb-4 font-bold text-forest">
                    {step.num}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TRUST / CTA ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest py-20 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
              Verified & Transparent
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Every Constituency, <span className="text-gold">Verified</span></h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              DICO maps every Nigerian ward, LGA, and federal constituency — connecting verified voters to their representatives with transparent civic data.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all">
                Get Started Free
              </Link>
              <Link href="/pricing" className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                View Pricing
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
