// src/app/(marketing)/sections/HeroSection.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <>
      {/* Ticker */}
      <div className="bg-forest border-b border-white/5 py-2 overflow-hidden">
        <div className="flex gap-8 animate-scroll text-xs text-white/70 font-semibold tracking-wide whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8">
              <span>🔴 Live: Town hall session now in progress</span>
              <span>🪙 CIVICT Market Open — Youth Employment demand +80%</span>
              <span>🏆 Ward A (Oredo) leads Civic Index — 91 pts</span>
              <span>📊 4,218 verified voters active today</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="bg-forest pt-16 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C8960A]/20 border border-[#C8960A]/40 text-[#E8C040] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded mb-5">
              Digital Constituency Office · Nigeria
            </div>
            <h1 className="font-serif  text-3xl md:text-4xl font-black text-white leading-[1.08] mb-6">
              The Trusted Digital Frontier Where <span className="text-[#E8C040]">Verified Voters</span> Engage Poliltical Aspirations and Representations
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              DICO powers digital town halls, verified voter participation, real-time polling, and community issue reporting. Every question, vote, and idea earns CIVICT — Nigeria&apos;s first civic participation token.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register"><Button size="lg" className="bg-[#C8960A] hover:bg-[#dba50c] text-black font-bold text-base px-8">Join as a Voter — Get 100 CIVICT</Button></Link>
              <Link href="/login"><Button size="lg" variant="outline" className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white text-base">Sign In</Button></Link>
            </div>
          </div>

          {/* Highlights card */}
          <div className="bg-white/10 border border-white/15 rounded-xl p-6">
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/60 mb-5">Platform Highlights</p>
            {[
              { icon: '🛡️', title: 'PVC-Verified Voters', desc: 'Only verified Nigerians can participate.' },
              { icon: '🎙️', title: 'Live Town Halls', desc: 'Candidates answer top-voted questions in real time.' },
              { icon: '🪙', title: 'CIVICT Token Economy', desc: 'Earn tokens, redeem for Naira.' },
              { icon: '📊', title: 'Ward-Level Analytics', desc: 'See engagement metrics for every ward.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 py-3.5 border-b border-white/10 last:border-0">
                <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

           {/* Stats bar - Updated for accuracy */}
      <div className="bg-sand py-5 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { num: '4', label: 'Active States' },
            { num: '100+', label: 'Local Govts' },
            { num: '21', label: 'Political Parties' },
            { num: '₦50', label: 'CIVICT Price' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="font-serif text-2xl md:text-3xl font-black text-forest">{s.num}</span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#3D5246]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
