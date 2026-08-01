// src/app/(marketing)/polls/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Vote, Shield, Users, BarChart3, TrendingUp, BookOpen, Lightbulb, ChevronRight, Check } from 'lucide-react'

const categories = [
  { icon: Shield, title: 'Election Polls', desc: 'Track public opinion on upcoming elections.' },
  { icon: Users, title: 'Governance', desc: "Measure citizens' satisfaction with government performance." },
  { icon: BarChart3, title: 'Public Policy', desc: 'Gather opinions on proposed laws and national policies.' },
  { icon: TrendingUp, title: 'Community Dev.', desc: 'Understand local priorities and development needs.' },
  { icon: Lightbulb, title: 'Youth & Innovation', desc: "Capture the views of young Nigerians on key issues." },
]

const sampleQuestions = [
  'If the presidential election were held today, would you vote?',
  'Which issue should be the government\'s highest priority?',
  'Do you trust your elected representative?',
  'Has your constituency experienced meaningful development in the past four years?',
  'Should lawmakers publish annual performance reports?',
  'Which sector deserves the largest share of the national budget?',
  'Do you support electronic transmission of election results?',
  'What is the biggest challenge facing your community today?',
  'Should local government elections be conducted more frequently?',
  'How would you rate public healthcare services in your state?',
]

interface PollState {
  [key: string]: string | null
}

export default function PollsPage() {
  const [votes, setVotes] = useState<PollState>({})
  const [results, setResults] = useState<Record<string, boolean>>({})

  function castVote(pollId: string) {
    if (!votes[pollId]) return
    setResults({ ...results, [pollId]: true })
  }

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
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gold/80 mb-3">Civic Participation</span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Your Voice <span className="text-gold">Matters</span></h1>
            <p className="text-white/80 max-w-xl mb-8">
              Participate in verified polls and help shape conversations that matter. Share your opinion on elections, governance, public policies, and community development.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="#featured" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2">
                <Vote className="h-4 w-4" /> Vote Now
              </Link>
              <Link href="#results" className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                View Results
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== INTRO ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-4">Participate in National Conversations</h2>
            <p className="text-muted max-w-2xl mx-auto">
              DICO Polls provide a secure and transparent way for citizens to express their opinions on political issues, elections, public policies, and governance. Every vote contributes to a broader understanding of public sentiment.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== FEATURED POLL ==================== */}
      <section id="featured" className="pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className={`border-2 rounded-2xl p-6 md:p-8 transition-all ${
              results['featured']
                ? 'border-gold bg-gradient-to-b from-gold/5 to-white shadow-lg'
                : 'border-gold/40 bg-gradient-to-b from-gold/5 to-white shadow-md'
            }`}>
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-forest bg-mint px-2.5 py-0.5 rounded mb-3">
                Election: Edo State Governorship Election
              </span>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-ink mb-4">
                Who would you support if the election were held today?
              </h3>

              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {['Candidate A', 'Candidate B', 'Candidate C', 'Undecided'].map((opt, i) => {
                  const pcts = [42, 35, 18, 5]
                  const selected = votes['featured'] === opt
                  return (
                    <button key={opt}
                      onClick={() => !results['featured'] && setVotes({...votes, featured: opt})}
                      disabled={results['featured']}
                      className={`relative overflow-hidden text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        results['featured']
                          ? selected
                            ? 'border-gold bg-gold/5'
                            : 'border-border bg-sand-50 opacity-70'
                          : selected
                            ? 'border-gold bg-gold/5 scale-[1.02]'
                            : 'border-border bg-sand-50 hover:border-forest-mid'
                      }`}>
                      {results['featured'] && (
                        <div className="absolute inset-0 bg-mint-200/50" style={{ width: `${pcts[i]}%` }} />
                      )}
                      <span className="relative z-10 flex justify-between items-center">
                        <span className="text-sm font-semibold text-ink">{opt}</span>
                        {results['featured'] && (
                          <span className="text-xs font-bold text-forest">{pcts[i]}%</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>

              {!results['featured'] ? (
                <button onClick={() => castVote('featured')} disabled={!votes['featured']}
                  className="w-full bg-gold hover:bg-gold-hover text-ink font-bold py-3 rounded-lg text-sm transition-all disabled:opacity-50">
                  Cast Your Vote
                </button>
              ) : (
                <p className="text-center text-sm text-muted font-medium">
                  Thank you for voting! Results update in real-time as more citizens participate.
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== LIVE POLLS ==================== */}
      <section id="results" className="py-16 md:py-20 px-4 md:px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">Live Polls</h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-10">Participate in active polls and see how your community feels about the most pressing issues.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { id: 'p1', q: 'Which issue should your representative prioritize?', opts: ['Job Creation', 'Healthcare', 'Education', 'Security', 'Infrastructure', 'Agriculture'] },
              { id: 'p2', q: 'Do you believe your elected representative has fulfilled campaign promises?', opts: ['Yes', 'No', 'Partially', 'Not Sure'] },
              { id: 'p3', q: 'How satisfied are you with constituency development?', opts: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
              { id: 'p4', q: 'Which area deserves more government investment?', opts: ['Roads', 'Healthcare', 'Education', 'Electricity', 'Agriculture', 'Digital Economy'] },
            ].map(poll => (
              <ScrollReveal key={poll.id}>
                <div className={`bg-white border rounded-xl p-5 transition-all ${
                  results[poll.id] ? 'border-forest/30 shadow-md' : 'border-border hover:border-forest/30 hover:-translate-y-0.5'
                }`}>
                  <h3 className="font-serif text-lg font-bold text-ink mb-4">{poll.q}</h3>
                  <div className="space-y-2 mb-4">
                    {poll.opts.map(opt => {
                      const selected = votes[poll.id] === opt
                      return (
                        <button key={opt}
                          onClick={() => !results[poll.id] && setVotes({...votes, [poll.id]: opt})}
                          disabled={results[poll.id]}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            results[poll.id]
                              ? selected ? 'border-gold bg-gold/5' : 'border-border bg-sand-50 opacity-60'
                              : selected ? 'border-gold bg-gold/5' : 'border-border bg-sand-50 hover:border-forest-mid'
                          }`}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {!results[poll.id] ? (
                    <button onClick={() => castVote(poll.id)} disabled={!votes[poll.id]}
                      className="w-full bg-mint text-forest font-semibold py-2.5 rounded-lg text-sm transition-all hover:bg-mint-200 disabled:opacity-50">
                      Cast Your Vote
                    </button>
                  ) : (
                    <p className="text-center text-xs text-muted">Thank you for voting!</p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">Poll Categories</h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-10">Explore polls across different civic and political categories.</p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <ScrollReveal key={cat.title}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center mb-3">
                    <cat.icon className="h-5 w-5 text-forest" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-ink mb-1">{cat.title}</h3>
                  <p className="text-xs text-muted">{cat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STAT STRIP ==================== */}
      <section className="bg-sand border-y border-border py-6 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-4">
          {[
            { num: '120+', label: 'Active Polls' },
            { num: '250,000+', label: 'Total Votes' },
            { num: '95,000+', label: 'Participants' },
            { num: '36 + FCT', label: 'States Covered' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-2xl md:text-3xl font-black text-forest">{s.num}</p>
              <p className="text-[10px] font-bold tracking-wider uppercase text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== WHY PARTICIPATE ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-10">Why Participate?</h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Vote, title: 'Make Your Voice Count', desc: 'Your opinion contributes to meaningful political discussions.' },
              { icon: TrendingUp, title: 'Influence Public Debate', desc: 'Help identify the issues that matter most to your community.' },
              { icon: BarChart3, title: 'Transparent Results', desc: 'View poll outcomes as participation grows.' },
              { icon: Shield, title: 'Secure Participation', desc: 'Every vote is protected through DICO\'s secure platform.' },
            ].map(item => (
              <ScrollReveal key={item.title}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-0.5 transition-all text-center">
                  <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-5 w-5 text-forest" />
                  </div>
                  <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
                  <p className="text-xs text-muted">{item.desc}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-10">How It Works</h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: '1', title: 'Choose a Poll', desc: 'Browse active polls on elections, governance, and community issues.' },
              { num: '2', title: 'Cast Your Vote', desc: 'Select your preferred option securely.' },
              { num: '3', title: 'View Live Results', desc: 'Watch results update as more citizens participate.' },
              { num: '4', title: 'Stay Engaged', desc: 'Join discussions and participate in future polls.' },
            ].map(s => (
              <ScrollReveal key={s.num}>
                <div className="bg-white border border-border rounded-xl p-5 text-center hover:border-forest hover:-translate-y-0.5 transition-all">
                  <div className="w-9 h-9 rounded-full bg-mint flex items-center justify-center mx-auto mb-3 font-bold text-forest">{s.num}</div>
                  <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                  <p className="text-xs text-muted">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SAMPLE QUESTIONS ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">Sample Poll Questions</h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-10">You can populate your website with polls like these:</p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-3">
            {sampleQuestions.map((q, i) => (
              <ScrollReveal key={i}>
                <div className="flex items-start gap-3 bg-white border border-border rounded-xl p-4 hover:border-forest transition-all">
                  <Check className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                  <p className="text-sm text-ink/80">{q}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Join Thousands Shaping the Future</h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Every opinion matters. Participate in verified polls, stay informed, and contribute to a stronger democracy through meaningful civic engagement.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2">
                <Vote className="h-4 w-4" /> Vote Now
              </Link>
              <Link href="#results" className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                Explore Polls
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
