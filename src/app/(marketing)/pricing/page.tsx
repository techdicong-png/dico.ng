// src/app/(marketing)/pricing/page.tsx
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'

const plans = [
  {
    tier: 'Free Plan',
    name: 'Voter',
    price: '₦0',
    cycle: 'Forever Free',
    desc: 'Perfect for citizens who want to stay informed and actively participate in democracy.',
    popular: false,
    features: [
      'Browse verified candidates', 'Search by State, LGA & Ward',
      'View candidate profiles', 'Read manifestos',
      'Participate in opinion polls', 'Ask candidates questions',
      'Receive campaign updates', 'Save favorite candidates',
      'Election reminders', 'Basic support',
    ],
    cta: 'Get Started Free',
    href: '/register?role=voter',
    variant: 'secondary' as const,
  },
  {
    tier: 'Candidate Plan',
    name: 'Candidate Pro',
    price: '₦25,000',
    cycle: '/month',
    desc: 'Designed for candidates seeking stronger voter engagement and campaign management.',
    popular: true,
    features: [
      'Everything in Free, plus', 'Verified candidate profile',
      'Publish campaign manifesto', 'Upload photos and videos',
      'Create campaign events', 'Volunteer management',
      'Campaign dashboard', 'Real-time engagement analytics',
      'Poll creation & Media gallery', 'Priority support',
    ],
    cta: 'Start Candidate Plan',
    href: '/register?role=candidate',
    variant: 'gold' as const,
  },
  {
    tier: 'Political Party Plan',
    name: 'Party Suite',
    price: 'Custom',
    cycle: 'Pricing',
    desc: 'Manage multiple candidates and coordinate campaigns from one dashboard.',
    popular: false,
    features: [
      'Unlimited candidate accounts', 'Central campaign dashboard',
      'State & national analytics', 'Party branding',
      'Team collaboration', 'Campaign performance reports',
      'Bulk announcements', 'Advanced voter insights',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    variant: 'secondary' as const,
  },
  {
    tier: 'Enterprise Plan',
    name: 'Enterprise',
    price: "Let's Talk",
    cycle: '',
    desc: 'Built for NGOs, election observers, media, research, and government agencies.',
    popular: false,
    features: [
      'Everything in Party Suite', 'API access',
      'White-label solution', 'Custom integrations',
      'Advanced reporting', 'Secure cloud infrastructure',
      'Dedicated technical support', 'Custom onboarding',
      '24/7 premium support',
    ],
    cta: 'Request a Demo',
    href: '/contact',
    variant: 'secondary' as const,
  },
]

const faqs = [
  { q: 'Can I use DICO for free?', a: 'Yes. Every voter can create an account and access essential features completely free.' },
  { q: 'Can I upgrade my plan later?', a: 'Absolutely. You can upgrade or change your plan whenever your campaign needs grow.' },
  { q: 'Do political parties get special pricing?', a: 'Yes. We offer customized plans based on the number of candidates and campaign requirements.' },
  { q: 'Is my information secure?', a: 'Yes. We use modern security standards to keep your campaign and user data safe.' },
  { q: 'Do you provide customer support?', a: 'Yes. All users receive support, while paid plans enjoy faster response times.' },
]

export default function PricingPage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        {/* Decorative rings */}
        <div className="absolute w-80 h-80 rounded-full border border-white/20 -top-20 -right-20 animate-[spin_20s_linear_infinite] pointer-events-none" />
        <div className="absolute w-52 h-52 rounded-full border border-white/20 -bottom-16 -left-16 animate-[spin_18s_linear_infinite_reverse] pointer-events-none" />
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        {/* Sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -inset-1/2 w-[200%] h-full -rotate-8 animate-[sweep_9s_ease-in-out_infinite]"
            style={{ background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.08) 48%, transparent 76%)' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">DICO Pricing</span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Flexible Pricing for Every Political Journey</h1>
            <p className="text-white/80 max-w-2xl mb-8">
              Whether you&apos;re a voter, candidate, political party, or organization, DICO offers affordable plans designed to help you engage, connect, and make informed political decisions. Start for free and upgrade whenever you&apos;re ready.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all">
                Get Started
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                Contact Sales
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== PRICING GRID ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">Choose the Perfect Plan</h2>
            <p className="text-muted text-center max-w-2xl mx-auto mb-12">
              From individual candidates to nationwide political organizations, DICO provides the right tools to build trust, engage voters, and manage campaigns effectively.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.name}>
                <div className={`relative bg-white border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  plan.popular
                    ? 'border-gold shadow-[0_12px_30px_rgba(190,147,48,0.18)] bg-gradient-to-b from-gold/5 to-white'
                    : 'border-border hover:border-forest-mid/30'
                }`}>
                  {plan.popular && (
                    <span className="absolute top-3 right-3 bg-gold text-ink text-[10px] font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-1">{plan.tier}</p>
                  <h3 className="font-serif text-xl font-bold text-ink mb-3">{plan.name}</h3>
                  <p className="font-serif text-4xl font-black text-ink leading-none">
                    {plan.price}
                    {plan.cycle && <small className="text-sm text-muted font-medium ml-1">{plan.cycle}</small>}
                  </p>
                  <p className="text-xs text-muted mt-1 mb-4">{plan.desc}</p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink/70">
                        <svg className="w-4 h-4 text-forest shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}
                    className={`block w-full text-center font-bold text-sm py-3 rounded-lg transition-all ${
                      plan.popular
                        ? 'bg-gold hover:bg-gold-hover text-ink shadow-md'
                        : 'bg-mint text-forest hover:bg-mint-200'
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE DICO ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">Why Choose DICO?</h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-12">Trusted Across Nigeria — Empowering political participation through transparency, accountability, and innovation.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🛡️', title: 'Trusted Across Nigeria', desc: 'Empowering political participation through transparency, accountability, and innovation.' },
              { icon: '📊', title: 'Smart Analytics', desc: 'Turn voter interactions into actionable insights that improve campaign performance.' },
              { icon: '🔒', title: 'Secure Platform', desc: 'Protect your campaign data with enterprise-grade security and privacy.' },
              { icon: '🇳🇬', title: 'Built for Nigeria', desc: 'Designed for Nigeria\'s electoral system, constituencies, wards, and local government structure.' },
            ].map(item => (
              <ScrollReveal key={item.title}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center text-lg mb-3">{item.icon}</div>
                  <h3 className="font-serif text-lg font-bold text-ink mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-10">Frequently Asked Questions</h2>
          </ScrollReveal>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i}>
                <details className="group bg-white border border-border rounded-xl overflow-hidden transition-colors open:border-forest">
                  <summary className="flex justify-between items-center p-5 cursor-pointer font-semibold text-ink list-none">
                    {faq.q}
                    <svg className="w-4 h-4 text-muted shrink-0 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== DEMOCRACY TOGETHER ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-sand">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-4">Building a Stronger Democracy, Together</h2>
            <p className="text-muted max-w-2xl mx-auto mb-10">
              Every interaction on DICO brings citizens and leaders closer together. Whether you&apos;re a voter seeking accountability, a candidate engaging your constituency, or a political organization driving participation — DICO provides the tools to create meaningful connections.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['Engage with verified voters', 'Receive real-time community feedback', 'Build trust through transparency', 'Strengthen democratic participation'].map(item => (
              <ScrollReveal key={item}>
                <div className="bg-white border border-border rounded-xl p-4 font-semibold text-sm text-ink flex items-center justify-center gap-2 shadow-sm">
                  <svg className="w-4 h-4 text-forest shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest py-20 md:py-28 px-4 md:px-6">
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Ready to Transform Political Engagement?</h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              Join thousands of voters, candidates, and political organizations using DICO to build stronger connections, increase transparency, and create more impactful campaigns.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all">
                Start Free Today
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                Talk to Our Team
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
