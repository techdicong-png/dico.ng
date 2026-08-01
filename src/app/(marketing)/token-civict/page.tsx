// src/app/(marketing)/civict/page.tsx
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Coins, Zap, Shield, TrendingUp, Gift, Users, Award, ArrowRight, CheckCircle, ChevronRight } from 'lucide-react'

const earnWays = [
  { icon: Gift, title: 'Sign-Up Bonus', desc: 'Get 100 CIVICT when you register as a verified voter.' },
  { icon: Zap, title: 'Vote in Polls', desc: 'Earn 10 CIVICT for every poll you vote on.' },
  { icon: Award, title: 'Ask Questions', desc: 'Earn 20 CIVICT for each question asked in town halls.' },
  { icon: Shield, title: 'File Reports', desc: 'Get 15 CIVICT for verified community issue reports.' },
  { icon: Users, title: 'Follow Candidates', desc: 'Earn 2 CIVICT for every candidate you follow.' },
  { icon: TrendingUp, title: 'Peer Ratings', desc: 'Earn bonus CIVICT when your content gets upvoted.' },
]

const phases = [
  { num: '01', title: 'Market Opening', desc: 'New voters receive 100 CIVICT + Ward Badge.' },
  { num: '02', title: 'Demand Announcement', desc: 'Priority topic earns higher CIVICT rates.' },
  { num: '03', title: 'Community Market', desc: 'Engage through questions, votes, and peer ratings.' },
  { num: '04', title: 'Civic Taxation', desc: '5% of earnings go to the Community Tax Pool.' },
  { num: '05', title: 'Policy Auction', desc: 'Pool allocated to community priorities (roads, jobs, health).' },
  { num: '06', title: 'Scarcity Events', desc: 'Limited-edition badges create engagement urgency.' },
  { num: '07', title: 'Ward Stock Market', desc: 'Live Civic Index tracks each ward\'s performance.' },
  { num: '08', title: 'Candidate Response', desc: 'Candidates earn Reputation Points for meaningful engagement.' },
]

const ranks = [
  { label: 'Observer', min: '0', color: 'bg-gray-100 text-gray-700' },
  { label: 'Mobilizer', min: '200', color: 'bg-blue-100 text-blue-700' },
  { label: 'Ward Influencer', min: '600', color: 'bg-amber-100 text-amber-700' },
  { label: 'Ambassador', min: '1,500', color: 'bg-purple-100 text-purple-700' },
  { label: 'Community Leader', min: '4,000', color: 'bg-forest-light text-forest-dark' },
]

const faqs = [
  { q: 'What is CIVICT?', a: 'CIVICT is Nigeria\'s first civic participation token. It rewards verified voters for engaging with candidates, voting in polls, filing reports, and attending digital town halls.' },
  { q: 'How do I earn CIVICT?', a: 'Register as a voter for a 100 CIVICT welcome bonus, then earn by voting in polls (10 ₡), asking questions (20 ₡), filing community reports (15 ₡), and following candidates (2 ₡).' },
  { q: 'Can I convert CIVICT to Naira?', a: 'Yes. Verified users can redeem CIVICT for Nigerian Naira through the Redeem page. Rates are set weekly based on the Community Tax Pool and market demand.' },
  { q: 'What is the Community Tax Pool?', a: '5% of all CIVICT earnings go into a shared pool. Users then vote to allocate the pool toward real community projects — roads, schools, health, or jobs.' },
  { q: 'Do I need cryptocurrency to use CIVICT?', a: 'No. CIVICT is a platform token, not a blockchain token. You earn and spend it entirely within the DICO platform. No wallet, no gas fees, no complexity.' },
]

export default function CivictMarketingPage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-[#071E12] via-forest-mid to-[#0A3D2B] text-white py-24 md:py-32 px-4 md:px-6">
        <div className="absolute w-96 h-96 rounded-full border border-gold/20 -top-24 -right-24 animate-[spin_25s_linear_infinite] pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full border border-gold/15 -bottom-20 -left-20 animate-[spin_20s_linear_infinite_reverse] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at 60% 40%, rgba(200,150,10,.12), transparent 40%)' }} />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-5">
              <Coins className="h-3 w-3" /> CIVICT Token Economy
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-black leading-[1.06] mb-5">
              Participation <span className="text-gold">Has Value</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg mb-10">
              Every question, vote, report, and idea now earns you CIVICT — Nigeria&apos;s first token for civic participation. 
              Redeem for Naira, boost your ward&apos;s Civic Index, and help decide how community funds are spent.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register/voter"
                className="bg-gold hover:bg-gold-hover text-ink font-bold px-8 py-3.5 rounded-lg text-sm transition-all inline-flex items-center gap-2">
                <Gift className="h-4 w-4" /> Get 100 CIVICT Free
              </Link>
              <Link href="/register/candidate"
                className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-8 py-3.5 rounded-lg text-sm transition-all">
                Register as Candidate
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== LIVE RATES ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-white dark:bg-[#11241b] transition-colors">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-forest-faint dark:from-[#0A3D2B]/30 to-white dark:to-[#11241b] border border-border dark:border-white/10 rounded-xl p-8 md:p-10">
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-4 text-center">📈 Live CIVICT Market Rates</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { action: 'Sign-Up Bonus', value: '100 ₡', tag: 'One-time' },
                  { action: 'Poll Vote', value: '10 ₡' },
                  { action: 'Question Asked', value: '20 ₡', tag: '🔥 Popular' },
                  { action: 'Community Report', value: '15 ₡' },
                  { action: 'Follow Candidate', value: '2 ₡' },
                  { action: 'Idea Submission', value: '30 ₡', tag: '🔥 Hot' },
                ].map(item => (
                  <div key={item.action} className="flex justify-between items-center py-2.5 border-b border-border-light dark:border-white/5 last:border-0 md:last:border-0">
                    <span className="text-sm text-ink">{item.action}</span>
                    <span className="font-serif text-sm font-bold text-gold shrink-0 ml-2">
                      {item.value}
                      {item.tag && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded ml-1.5 font-sans">{item.tag}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-sand dark:bg-[#0f1d16] transition-colors">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light dark:bg-forest/20 px-2.5 py-1 rounded inline-block mb-3">How It Works</span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-ink">From Earning to Impact</h2>
              <p className="text-muted mt-2 max-w-lg mx-auto">CIVICT follows a transparent, predictable cycle every week.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-3">
            {phases.map((p, i) => (
              <ScrollReveal key={p.num}>
                <div className="bg-white dark:bg-[#11241b] border border-border dark:border-white/10 rounded-lg p-5 hover:border-gold/30 dark:hover:border-gold/30 transition-colors h-full">
                  <p className="text-[10px] font-bold text-gold/60 mb-2">Phase {p.num}</p>
                  <h4 className="text-sm font-bold text-ink mb-1.5">{p.title}</h4>
                  <p className="text-xs text-muted">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== EARN WAYS ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white dark:bg-[#11241b] transition-colors">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light dark:bg-forest/20 px-2.5 py-1 rounded inline-block mb-3">Ways to Earn</span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-ink">Six Ways to Stack CIVICT</h2>
              <p className="text-muted mt-2 max-w-lg mx-auto">Every meaningful civic action earns you more.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {earnWays.map((item, i) => (
              <ScrollReveal key={item.title}>
                <div className="border border-border dark:border-white/10 rounded-xl p-6 hover:border-gold/30 dark:hover:border-gold/30 hover:-translate-y-0.5 transition-all">
                  <div className="w-11 h-11 rounded-lg bg-forest-light dark:bg-forest/20 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-forest dark:text-forest-mid" />
                  </div>
                  <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== RANK PROGRESSION ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-sand dark:bg-[#0f1d16] transition-colors">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light dark:bg-forest/20 px-2.5 py-1 rounded inline-block mb-3">Rank System</span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-ink">Climb the Civic Ladder</h2>
              <p className="text-muted mt-2">Your CIVICT balance determines your rank and influence.</p>
            </div>
          </ScrollReveal>

          <div className="flex gap-2 flex-wrap justify-center">
            {ranks.map((r, i) => (
              <div key={r.label} className={`px-5 py-3 rounded-lg text-sm font-bold ${r.color} dark:opacity-90`}>
                {r.label} <span className="font-normal opacity-60">≥{r.min} ₡</span>
              </div>
            ))}
          </div>

          <ScrollReveal>
            <div className="mt-8 bg-gradient-to-br from-forest to-forest-mid rounded-xl p-6 md:p-8 text-white text-center">
              <p className="font-serif text-2xl font-black text-gold mb-2">🏆 Community Leaders</p>
              <p className="text-sm text-white/80 max-w-lg mx-auto">
                Top-ranking users get priority question placement, featured profiles, and a vote in how the Community Tax Pool is allocated.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== REDEEM ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white dark:bg-[#11241b] transition-colors">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light dark:bg-forest/20 px-2.5 py-1 rounded inline-block mb-3">Redeem</span>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-4">CIVICT → Nigerian Naira</h2>
            <p className="text-muted mb-6">Verified users can convert their CIVICT balance to Naira at the current market rate. Redemptions are processed weekly with a small platform fee.</p>
            <div className="space-y-3">
              {[
                { icon: Shield, text: '100% transparent rate — published every Monday' },
                { icon: TrendingUp, text: 'Minimum redeem: 5,000 CIVICT' },
                { icon: Award, text: 'Daily cap: ₦10,000 per user' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-forest shrink-0" />
                  <span className="text-sm text-ink">{item.text}</span>
                </div>
              ))}
            </div>
            <Link href="/register/voter"
              className="mt-6 inline-flex items-center gap-2 bg-forest hover:bg-forest-mid text-white font-semibold px-6 py-3 rounded-lg text-sm transition-all">
              Start Earning <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-gradient-to-br from-[#071E12] to-[#0F5438] rounded-xl p-8 text-white">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gold/60 mb-3">Example Redemption</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">You redeem</span>
                  <span className="font-bold">5,000 CIVICT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Rate</span>
                  <span className="font-bold">1,000 CIVICT = ₦1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Gross value</span>
                  <span className="font-bold">₦5.00</span>
                </div>
                <div className="flex justify-between text-sm text-gold">
                  <span>Platform fee (10%)</span>
                  <span className="font-bold">-₦0.50</span>
                </div>
                <div className="border-t border-white/20 pt-3 flex justify-between">
                  <span className="font-semibold">You receive</span>
                  <span className="font-serif text-xl font-black text-gold">₦4.50</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-sand dark:bg-[#0f1d16] transition-colors">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light dark:bg-forest/20 px-2.5 py-1 rounded inline-block mb-3">FAQ</span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-ink">Common Questions</h2>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i}>
                <details className="group bg-white dark:bg-[#11241b] border border-border dark:border-white/10 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-semibold text-ink list-none group-open:border-b border-border-light dark:border-white/10">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 text-muted group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <div className="px-6 py-4 text-sm text-muted">
                    {faq.a}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-[#0D1B12]">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gold bg-gold/15 px-3 py-1.5 rounded inline-block mb-5">
              Start Your Journey
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">
              Ready to Start Earning <span className="text-gold">CIVICT</span>?
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Join 4,000+ verified Nigerians already participating in the first civic token economy.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register/voter"
                className="bg-gold hover:bg-gold-hover text-ink font-bold px-8 py-3.5 rounded-lg text-sm transition-all inline-flex items-center gap-2">
                <Gift className="h-4 w-4" /> Get 100 CIVICT Free
              </Link>
              <Link href="/register/candidate"
                className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-8 py-3.5 rounded-lg text-sm transition-all">
                Register as Candidate
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
