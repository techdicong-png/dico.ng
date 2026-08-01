// src/app/(marketing)/candidates/page.tsx
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Verified, Users, BarChart3, Star } from 'lucide-react'

const candidates = [
  { name: 'Aisha Bello', party: 'Unity People\'s Party (UPP)', office: 'House of Reps · Lagos, Ikeja · Ward 3', engagement: 84, townhalls: 12, trust: 4.7, img: 'AB' },
  { name: 'Kunle Ademola', party: 'Citizens Reform Alliance (CRA)', office: 'House of Assembly · Lagos, Surulere · Ward 10', engagement: 76, townhalls: 9, trust: 4.4, img: 'KA' },
  { name: 'Mariam Okonkwo', party: 'New Democratic Front (NDF)', office: 'House of Reps · Oyo, Ibadan North · Ward 5', engagement: 89, townhalls: 15, trust: 4.8, img: 'MO' },
  { name: 'Tunde Akinola', party: 'People First Movement (PFM)', office: 'Local Council Chair · Oyo, Akinyele · Ward 11', engagement: 71, townhalls: 8, trust: 4.2, img: 'TA' },
  { name: 'Fatima Haruna', party: 'Civic Progress Party (CPP)', office: 'House of Assembly · Kaduna, Chikun · Ward 8', engagement: 80, townhalls: 11, trust: 4.6, img: 'FH' },
  { name: 'Ibrahim Sani', party: 'Green Future Coalition (GFC)', office: 'Local Council Chair · Kaduna, Zaria · Ward 14', engagement: 67, townhalls: 7, trust: 4.0, img: 'IS' },
  { name: 'Chidi Okafor', party: 'Progressive Democratic Alliance (PDA)', office: 'Senate · Anambra, Onitsha North · Ward 2', engagement: 92, townhalls: 18, trust: 4.9, img: 'CO' },
  { name: 'Ngozi Eze', party: 'United Civic Front (UCF)', office: 'House of Reps · Enugu, Nsukka · Ward 7', engagement: 85, townhalls: 13, trust: 4.5, img: 'NE' },
  { name: 'Ibrahim Musa', party: 'Progressive Unity Party (PUP)', office: 'Senate · Kano Central · Ward 12', engagement: 91, townhalls: 18, trust: 4.8, img: 'IM' },
  { name: 'Amina Bello', party: 'National Reform Movement (NRM)', office: 'House of Reps · Kaduna North · Ward 5', engagement: 88, townhalls: 15, trust: 4.7, img: 'AB' },
  { name: 'Chinedu Okafor', party: "People's Development Alliance (PDA)", office: 'Senate · Anambra South · Ward 8', engagement: 83, townhalls: 11, trust: 4.4, img: 'CO' },
  { name: 'Samuel Omoregie', party: 'Citizens Progressive Union (CPU)', office: 'House of Reps · Edo South · Ward 3', engagement: 94, townhalls: 22, trust: 4.9, img: 'SO' },
]

export default function AllCandidatesPage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute w-80 h-80 rounded-full border border-white/20 -top-20 -right-20 animate-[spin_20s_linear_infinite] pointer-events-none" />
        <div className="absolute w-52 h-52 rounded-full border border-white/20 -bottom-16 -left-16 animate-[spin_18s_linear_infinite_reverse] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">Verified Directory</span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">All Candidates</h1>
            <p className="text-white/80 max-w-xl mb-6">
              Browse the complete roster of DICO-verified candidates. Compare engagement, trust scores, and civic priorities across every constituency.
            </p>
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-5 py-2.5">
              <span className="font-serif text-xl font-black text-gold">{candidates.length}</span>
              <span className="text-xs text-white/70">Verified Candidates Active</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== CANDIDATES ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm text-muted">Showing <strong className="text-ink">{candidates.length}</strong> candidates</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((c, i) => (
              <ScrollReveal key={c.name}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-forest to-forest-mid flex items-center justify-center text-white font-serif text-lg font-bold shrink-0">
                      {c.img}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-1.5">
                        {c.name}
                        <Verified className="h-4 w-4 text-gold shrink-0" />
                      </h3>
                      <p className="text-xs text-muted">{c.party}</p>
                    </div>
                  </div>

                  <p className="text-xs text-ink/70 mb-4">{c.office}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-sand rounded-lg p-2.5 text-center">
                      <p className="font-serif text-sm font-black text-forest">{c.engagement}%</p>
                      <p className="text-[9px] font-bold tracking-wider uppercase text-muted">Engagement</p>
                    </div>
                    <div className="bg-sand rounded-lg p-2.5 text-center">
                      <p className="font-serif text-sm font-black text-forest">{c.townhalls}</p>
                      <p className="text-[9px] font-bold tracking-wider uppercase text-muted">Townhalls</p>
                    </div>
                    <div className="bg-sand rounded-lg p-2.5 text-center">
                      <p className="font-serif text-sm font-black text-forest">{c.trust}</p>
                      <p className="text-[9px] font-bold tracking-wider uppercase text-muted">Trust</p>
                    </div>
                  </div>

                  <Link href="/register?role=voter"
                    className="block w-full bg-forest hover:bg-forest-mid text-white font-semibold text-sm py-2.5 rounded-lg text-center transition-all">
                    View Profile
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest py-20 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Are You a Candidate?</h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Join DICO Verified and connect directly with voters in your constituency. Build trust, host town halls, and earn reputation.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register?role=candidate" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all">
                Register as Candidate
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
