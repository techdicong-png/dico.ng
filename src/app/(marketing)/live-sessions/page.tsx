// src/app/(marketing)/live-sessions/page.tsx
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Play, Calendar, Clock, Users, ChevronRight } from 'lucide-react'

const upcoming = [
  { title: 'Eti-Osa Town Hall: Infrastructure Budget Review', host: 'Hon. Olamide Adeyemi', date: 'Friday, 8 PM', scope: 'Eti-Osa', tag: 'Upcoming' as const },
  { title: 'Surulere Youth Employment Forum', host: 'Hon. Segun Oke', date: 'Saturday, 10 AM', scope: 'Surulere I', tag: 'Upcoming' as const },
  { title: 'National Education Policy Discussion', host: 'Sen. Bola Ahmed', date: 'Sunday, 4 PM', scope: 'Nationwide', tag: 'Upcoming' as const },
  { title: 'Lagos State Security Town Hall', host: 'Hon. Jide Sanwo', date: 'Monday, 6 PM', scope: 'Lagos State', tag: 'Upcoming' as const },
]

const past = [
  { title: 'Edo Central Senatorial Debate', host: 'Sen. Adams Oshiomhole', date: '12 Jun 2025', views: '2.4k' },
  { title: 'Lagos East Constituency Briefing', host: 'Hon. Tokunbo Abiru', date: '8 Jun 2025', views: '1.8k' },
  { title: 'Kaduna Budget Review Session', host: 'Hon. Muhammad Abdullahi', date: '5 Jun 2025', views: '1.2k' },
  { title: 'Rivers State Health Policy Forum', host: 'Hon. Blessing Amadi', date: '1 Jun 2025', views: '980' },
]

export default function LiveSessionsPage() {
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
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">Live Sessions</span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">60 Minutes With <span className="text-gold">My Candidate</span></h1>
            <p className="text-white/80 max-w-xl mb-8">
              Join live digital town halls where candidates answer top-voted questions from verified voters in real time. Every session earns you CIVICT.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2">
                <Play className="h-4 w-4" /> Join a Session
              </Link>
              <Link href="/sessions" className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                View Schedule
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FEATURED STREAM ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-[#071E12] to-forest-mid rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row gap-6 items-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(200,150,10,0.12),transparent_40%)] pointer-events-none" />
              <div className="w-full md:w-48 h-32 rounded-xl bg-black/20 flex items-center justify-center shrink-0 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-ink ml-0.5" />
                </div>
              </div>
              <div className="flex-1 relative z-10 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE NOW
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold mb-1">Eti-Osa Town Hall: Infrastructure Budget Review</h3>
                <p className="text-white/70 text-sm mb-3">Hon. Olamide Adeyemi · Eti-Osa Federal Constituency</p>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 1,240 watching</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Today</span>
                </div>
              </div>
              <Link href="/register" className="shrink-0 bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all relative z-10">
                Join Now
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== UPCOMING SCHEDULE ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-sand">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-8">Upcoming Sessions</h2>
          </ScrollReveal>

          <div className="space-y-3">
            {upcoming.map((s, i) => (
              <ScrollReveal key={s.title}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-0.5 transition-all flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        s.tag === 'Upcoming' ? 'bg-gold/10 text-gold' : 'bg-red-50 text-red-600'
                      }`}>{s.tag}</span>
                    </div>
                    <h3 className="font-semibold text-ink">{s.title}</h3>
                    <p className="text-sm text-muted">{s.host} · {s.scope}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted shrink-0">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {s.date}</span>
                  </div>
                  <Link href="/register" className="text-gold font-semibold text-sm hover:text-gold-hover shrink-0 flex items-center gap-1">
                    Remind me <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PAST REPLAYS ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-3">Past Sessions</h2>
            <p className="text-muted mb-8">Catch up on sessions you missed.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {past.map((s, i) => (
              <ScrollReveal key={s.title}>
                <div className="bg-white border border-border rounded-xl overflow-hidden hover:border-forest hover:-translate-y-0.5 transition-all group">
                  <div className="h-28 bg-forest-light flex items-center justify-center relative">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-gold transition-colors">
                      <Play className="h-5 w-5 text-ink ml-0.5" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-ink mb-1 line-clamp-2">{s.title}</h3>
                    <p className="text-xs text-muted">{s.host}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.date}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {s.views}</span>
                    </div>
                  </div>
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
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Want to Host a Session?</h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Candidates and organizations can schedule digital town halls to engage directly with verified voters in their constituency.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register?role=candidate" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all">
                Register as Candidate
              </Link>
              <Link href="/contact" className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                Contact Us
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
