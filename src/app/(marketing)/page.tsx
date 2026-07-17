// src/app/(marketing)/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A3D2B]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A3D2B] border-b border-white/10 flex items-center justify-between px-6">
        <span className="font-serif text-lg text-white"><span className="text-[#E8C040]">DI</span>CO</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white">Sign in</Link>
          <Link href="/register">
            <Button size="sm" className="bg-[#C8960A] hover:bg-[#dba50c] text-[#0D1B12] font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#C8960A]/20 border border-[#C8960A]/40 text-[#E8C040] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded mb-4">
              Digital Constituency Office · Nigeria
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              Connecting verified voters <span className="text-[#E8C040]">directly</span> to candidates.
            </h1>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-md">
              DICO powers digital town halls, verified voter participation, real-time polling, and community issue reporting.
            </p>
            <div className="flex gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-[#C8960A] hover:bg-[#dba50c] text-[#0D1B12] font-bold">
                  Join as a Voter
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white/80 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/30 mb-4">Platform Highlights</p>
            {[
              { icon: '🛡️', title: 'Verified Voter Access', desc: 'PVC-based verification at ward level' },
              { icon: '🎙️', title: 'Live Candidate Engagement', desc: 'Town halls, Q&A, polls, accountability' },
              { icon: '📊', title: 'Campaign Intelligence', desc: 'Ward-level analytics & sentiment tracking' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 py-3 border-b border-white/5 last:border-0">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-[#F7F4EE] py-4 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-6 text-sm">
          {[['36', 'States'], ['4,218', 'Voters'], ['47', 'Candidates'], ['128', 'Polls']].map(([num, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-serif text-xl font-black text-[#0A3D2B]">{num}</span>
              <span className="text-[#5A6E62] text-xs font-bold tracking-wider uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0D1B12]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-black text-white mb-4">Ready to launch DICO?</h2>
          <p className="text-[#5A6E62] mb-8">For candidates, parties, and civic organisations ready to engage Nigerian voters at scale.</p>
          <Link href="/register">
            <Button size="lg" className="bg-[#C8960A] hover:bg-[#dba50c] text-[#0D1B12] font-bold">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#060E08] py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-xs text-white/30">
          <span className="font-serif text-base text-white">DICO</span>
          <p>© 2026 DICO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
