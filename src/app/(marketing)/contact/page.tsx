// src/app/(marketing)/contact/page.tsx
'use client'

import { useState } from 'react'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Mail, MapPin, Phone, Send } from 'lucide-react'

const topics = [
  'General Inquiry', 'Technical Support', 'Partnership',
  'Media & Press', 'Verification Issue', 'Feedback',
  'Report a Problem', 'Other',
]

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@dicoengage.com', href: 'mailto:hello@dicoengage.com' },
  { icon: MapPin, label: 'Visit', value: 'Lagos, Nigeria', href: '#' },
  { icon: Phone, label: 'Phone', value: '+234 800 000 0000', href: 'tel:+2348000000000' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', topic: '', message: '' })
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Connect to API
    setSent(true)
  }

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute w-80 h-80 rounded-full border border-white/20 -top-20 -right-20 animate-[spin_20s_linear_infinite] pointer-events-none" />
        <div className="absolute w-52 h-52 rounded-full border border-white/20 -bottom-16 -left-16 animate-[spin_18s_linear_infinite_reverse] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -inset-1/2 w-[200%] h-full -rotate-8 animate-[sweep_9s_ease-in-out_infinite]"
            style={{ background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.08) 48%, transparent 76%)' }} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">Contact Us</span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Get in Touch</h1>
            <p className="text-white/80 max-w-xl">
              Have a question about DICO? Want to partner with us? Reach out — we&apos;d love to hear from you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FORM + INFO ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <ScrollReveal>
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-black text-ink mb-6">Send us a message</h2>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center mx-auto mb-4">
                    <Send className="h-6 w-6 text-forest" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-ink mb-2">Message sent!</h3>
                  <p className="text-sm text-muted">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">First Name</label>
                      <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                        className="w-full px-3.5 py-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60"
                        placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">Last Name</label>
                      <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                        className="w-full px-3.5 py-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60"
                        placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Email</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full px-3.5 py-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60"
                      placeholder="john@example.com" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Topic</label>
                    <select required value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                      className="w-full h-11 px-3.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12">
                      <option value="">Select a topic</option>
                      {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Message</label>
                    <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5}
                      className="w-full px-3.5 py-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60 resize-y"
                      placeholder="Tell us how we can help..." />
                  </div>

                  <button type="submit"
                    className="w-full bg-forest hover:bg-forest-mid text-white font-semibold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* Info Cards */}
          <ScrollReveal>
            <div className="space-y-4">
              {contactInfo.map(item => (
                <a key={item.label} href={item.href}
                  className="flex items-center gap-4 bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-0.5 transition-all">
                  <div className="w-11 h-11 rounded-lg bg-mint flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-forest" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-muted">{item.label}</p>
                    <p className="text-sm font-semibold text-ink">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
