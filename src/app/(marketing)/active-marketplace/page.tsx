// src/app/(marketing)/marketplace/page.tsx
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Store, ShoppingBag, Tag, Shield, ArrowRight, CheckCircle } from 'lucide-react'

const featured = [
  { name: 'Constituency Data Pack', desc: 'Anonymized civic insights for your ward — demographics, poll trends, report hotspots.', price: '500 ₡', tag: 'Data' },
  { name: 'Campaign Starter Kit', desc: 'Profile badge, priority listing, and 1 live session slot for new candidates.', price: '2,500 ₡', tag: 'Campaign' },
  { name: 'Town Hall Booster', desc: 'Promote your session across DICO — push notification + email blast to 5,000 voters.', price: '1,000 ₡', tag: 'Promotion' },
  { name: 'CIVICT Redemption Voucher', desc: 'Convert CIVICT to Naira at premium rate. Min 5,000 ₡.', price: 'Market Rate', tag: 'Finance' },
]

export default function MarketplacePage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute w-80 h-80 rounded-full border border-white/20 -top-20 -right-20 animate-[spin_20s_linear_infinite]" />
        <div className="absolute w-52 h-52 rounded-full border border-white/20 -bottom-16 -left-16 animate-[spin_18s_linear_infinite_reverse]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">
              <Store className="h-3 w-3" /> CIVICT Marketplace
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Spend Your <span className="text-gold">CIVICT</span></h1>
            <p className="text-white/80 max-w-xl mb-8">
              Use your earned CIVICT tokens to access premium campaign tools, constituency data, and real value. The more you participate, the more you unlock.
            </p>
            <Link href="/register" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Browse Marketplace
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FEATURED ITEMS ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-3">Featured Items</h2>
            <p className="text-muted mb-10">Redeem your CIVICT for tools, data, and services that amplify your civic impact.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(item => (
              <ScrollReveal key={item.name}>
                <div className="bg-card border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-1 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center">
                      <Tag className="h-5 w-5 text-forest" />
                    </div>
                    <span className="text-[10px] font-bold text-forest-mid bg-forest-light px-2 py-0.5 rounded">{item.tag}</span>
                  </div>
                  <h3 className="font-semibold text-ink mb-1">{item.name}</h3>
                  <p className="text-xs text-muted mb-4 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-black text-gold">{item.price}</span>
                    <Link href="/register" className="text-gold font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      Redeem <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-sand">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-10">How the Marketplace Works</h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { num: '1', title: 'Earn CIVICT', desc: 'Vote in polls, attend sessions, file reports — every action earns tokens.' },
              { num: '2', title: 'Browse & Choose', desc: 'Explore items available in the marketplace. New listings added weekly.' },
              { num: '3', title: 'Redeem & Unlock', desc: 'Spend your CIVICT to unlock premium features, data, and services.' },
            ].map(s => (
              <ScrollReveal key={s.num}>
                <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-forest hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center mx-auto mb-4 font-bold text-forest">{s.num}</div>
                  <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                  <p className="text-xs text-muted">{s.desc}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Start Earning <span className="text-gold">CIVICT</span> Today</h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Every vote, question, and report earns you CIVICT. Build your balance and unlock the marketplace.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all">
                Get 100 CIVICT Free
              </Link>
              <Link href="/polls" className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                Vote in Polls
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
