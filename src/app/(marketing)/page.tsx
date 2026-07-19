// src/app/(marketing)/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A3D2B]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A3D2B] border-b border-white/10 flex items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-serif text-lg text-white">
          <span className="text-[#E8C040]">DI</span>CO
          <span className="text-[10px] font-sans font-bold tracking-wider text-[#C8960A] border border-[#C8960A]/40 px-1.5 py-0.5 rounded ml-2 uppercase">Beta</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white hover:text-[#E8C040] transition-colors">Sign in</Link>
          <Link href="/register"><Button size="sm" className="bg-[#C8960A] hover:bg-[#dba50c] text-black font-bold">Get Started</Button></Link>
        </div>
      </nav>

      {/* TICKER */}
      <div className="bg-[#0A3D2B] border-b border-white/5 py-2 overflow-hidden">
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

      {/* HERO */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C8960A]/20 border border-[#C8960A]/40 text-[#E8C040] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded mb-5">
              Digital Constituency Office · Nigeria
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.08] mb-6">
              Connecting verified voters <span className="text-[#E8C040]">directly</span> to their representatives.
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              DICO powers digital town halls, verified voter participation, real-time polling, and community issue reporting. Every question, vote, and idea earns CIVICT — Nigeria&apos;s first civic participation token.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register"><Button size="lg" className="bg-[#C8960A] hover:bg-[#dba50c] text-black font-bold text-base px-8">Join as a Voter — Get 100 CIVICT</Button></Link>
              <Link href="/login"><Button size="lg" variant="outline" className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white text-base">Sign In</Button></Link>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl p-6">
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/60 mb-5">Platform Highlights</p>
            {[
              { icon: '🛡️', title: 'PVC-Verified Voters', desc: 'Only verified Nigerians can participate — one person, one vote, real accountability.' },
              { icon: '🎙️', title: 'Live Town Halls', desc: '60-minute live sessions where candidates answer top-voted questions in real time.' },
              { icon: '🪙', title: 'CIVICT Token Economy', desc: 'Earn tokens for questions, polls, ideas, and reports. Redeem for Naira.' },
              { icon: '📊', title: 'Ward-Level Analytics', desc: 'Candidates see engagement metrics for every ward in their constituency.' },
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

      {/* STAT STRIP */}
      <div className="bg-[#F7F4EE] py-5 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-6 md:gap-10">
          {[
            { num: '36', label: 'States + FCT' },
            { num: '4,218', label: 'Verified Voters' },
            { num: '47', label: 'Active Candidates' },
            { num: '128', label: 'Polls Conducted' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="font-serif text-2xl md:text-3xl font-black text-[#0A3D2B]">{s.num}</span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#3D5246]">{s.label}</span>
            </div>
          ))}
          <div className="flex gap-2 ml-auto flex-wrap">
            {['Nigerian Voters', 'Candidates', 'Campaign Teams', 'Civil Society'].map(tag => (
              <span key={tag} className="text-[11px] font-semibold text-[#0A3D2B] bg-white border border-[#D8E4DC] px-3 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-[#0F5438] bg-[#E8F3EE] px-3 py-1.5 rounded inline-block mb-4">Core Platform</span>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-[#0D1B12] mb-4">A complete civic engagement ecosystem</h2>
          <p className="text-[#3D5246] max-w-xl mx-auto">DICO brings verified voters, candidates, and communities together in one structured, accountable digital environment.</p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            { icon: '🛡️', title: 'Verified Voter Badge', desc: 'PVC-based verification at ward level. Every participant is a real Nigerian voter.', tag: 'Voter' },
            { icon: '🎙️', title: 'Ask Your Candidate', desc: 'Send questions directly via text, voice, or video. Upvote the questions that matter most.', tag: 'Q&A' },
            { icon: '📅', title: 'Digital Town Halls', desc: 'Weekly live forums for youth, women, students, farmers, and market leaders.', tag: 'Live' },
            { icon: '📊', title: "People's Verdict", desc: 'Weekly sentiment polls measuring approval, performance, and community priorities.', tag: 'Polls' },
            { icon: '📍', title: 'Community Reporting', desc: 'File issue reports with photos and GPS. Track from submission through resolution.', tag: 'Civic' },
            { icon: '🤖', title: 'AI Campaign Assistant', desc: 'Generate speeches, ward-specific messages, and constituency reports.', tag: 'AI · Phase 2' },
          ].map(f => (
            <div key={f.title} className="border border-[#D8E4DC] rounded-xl p-6 hover:border-[#0A3D2B] hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-lg mb-4">{f.icon}</div>
              <h3 className="font-semibold text-[#0D1B12] mb-2">{f.title}</h3>
              <p className="text-sm text-[#3D5246] leading-relaxed">{f.desc}</p>
              <span className="inline-block mt-3 text-[10px] font-bold tracking-widest uppercase text-[#0F5438] bg-[#E8F3EE] px-2 py-0.5 rounded">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TOWN HALL */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#0F5438] bg-[#E8F3EE] px-3 py-1.5 rounded inline-block mb-4">Flagship Feature</span>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-[#0D1B12] mb-4">60 Minutes With My Candidate</h2>
            <div className="w-9 h-0.5 bg-[#C8960A] rounded mb-5"></div>
            <p className="text-[#3D5246] mb-8 leading-relaxed">A daily live session that brings one candidate face-to-face with thousands of verified voters — open questions, real answers, transparent record.</p>
            <div className="space-y-5 border-l-4 border-[#0A3D2B] pl-5">
              {[
                { title: 'Live video & public Q&A', desc: 'Top-voted questions from verified voters answered in real time.' },
                { title: 'Instant sentiment tracking', desc: 'Campaign teams see reactions, poll results, and audience mood live.' },
                { title: 'Daily recurring engagement', desc: 'Regular sessions create habit, strong visibility, and audience retention.' },
              ].map(item => (
                <div key={item.title}>
                  <h4 className="font-semibold text-[#0D1B12] mb-1">{item.title}</h4>
                  <p className="text-sm text-[#3D5246]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#071E12] to-[#0F5438] rounded-xl p-7 text-white">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live now
            </div>
            <h3 className="font-serif text-xl font-black text-[#E8C040] mb-3">60 Minutes With My Candidate</h3>
            <p className="text-sm text-white/80 mb-5">Today's session — Edo Central Senatorial District. Open questions on infrastructure and youth employment.</p>
            <div className="flex gap-5 text-xs text-white/70">
              <span>👁️ 1,240 watching</span>
              <span>❓ 86 questions</span>
            </div>
          </div>
        </div>
      </section>

      {/* CIVICT ECONOMY */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-[#050F09] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:48px_48px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#C8960A]/15 border border-[#C8960A]/30 text-[#E8C040] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C040] animate-pulse" /> CIVICT Token Economy
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-3">The <span className="text-[#E8C040]">People&apos;s Exchange</span></h2>
            <p className="text-white/70 max-w-xl mx-auto">Every question you ask, every vote you cast, every idea you share — now has measurable value.</p>
          </div>

          <div className="bg-gradient-to-br from-[#0F5438]/50 to-[#050F09] border border-[#C8960A]/25 rounded-xl p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center mb-10 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#C8960A]/60 mb-3">CIVICT — Civic Token</p>
              <h3 className="font-serif text-2xl md:text-3xl font-black text-white mb-4">Participation is now a commodity.</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">Citizens supply what candidates desperately need — attention, ideas, local knowledge, and community solutions. CIVICT makes the value of that participation visible, trackable, and rewarding.</p>
              <div className="flex gap-8 flex-wrap">
                {[
                  { num: '100 ₡', label: 'Starting Bonus' },
                  { num: '5%', label: 'Community Tax' },
                  { num: 'Weekly', label: 'Market Close' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="font-serif text-xl font-black text-[#E8C040]">{s.num}</p>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-white/50">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[#F0D060] to-[#8A6200] border-4 border-[#C8960A]/50 shadow-[0_0_0_8px_rgba(200,150,10,0.08),0_20px_60px_rgba(200,150,10,0.3)] flex items-center justify-center flex-col">
                <span className="font-serif text-3xl md:text-4xl font-black text-[#503000]/70">₡</span>
                <span className="text-[8px] font-black tracking-[0.18em] uppercase text-[#503000]/60">CIVICT</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mb-10">
            {[
              { phase: '01', title: 'Market Opening', desc: 'Every participant receives 100 CIVICT and a Ward Identity Badge.' },
              { phase: '02', title: 'Demand Announcement', desc: 'The candidate declares today\'s priority topic. Ideas on that topic earn more CIVICT.' },
              { phase: '03', title: 'Community Market', desc: 'Citizens submit questions, vote, and suggest solutions. Peers rate contributions.' },
              { phase: '04', title: 'Civic Taxation', desc: '5% of earned tokens fund the Community Tax Pool for prizes and awards.' },
              { phase: '05', title: 'Policy Auction', desc: 'Citizens allocate CIVICT to policy priorities — roads, jobs, health.' },
              { phase: '06', title: 'Scarcity Events', desc: 'Limited badges and bonuses create urgency and spike participation.' },
              { phase: '07', title: 'Ward Stock Market', desc: 'Every ward earns a live Civic Index. High-activity wards win bigger pools.' },
              { phase: '08', title: 'Candidate Response Market', desc: 'Candidates earn Reputation Points for answering questions and solving issues.' },
            ].map(p => (
              <div key={p.phase} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-[#C8960A]/30 transition-colors">
                <p className="text-[10px] font-bold text-[#C8960A]/50 mb-2">Phase {p.phase}</p>
                <h4 className="text-sm font-bold text-white mb-1.5">{p.title}</h4>
                <p className="text-xs text-white/60 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-4">CIVICT Earn Rates</p>
              {[
                { action: 'Ask a Question', value: '20 ₡' },
                { action: 'Vote in a Poll', value: '10 ₡' },
                { action: 'Submit an Idea', value: '30 ₡', hot: true },
                { action: 'File a Report', value: '15 ₡' },
                { action: 'Follow a Candidate', value: '2 ₡' },
              ].map(item => (
                <div key={item.action} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/80">{item.action}</span>
                  <span className="font-serif text-sm font-bold text-[#E8C040]">
                    {item.value}
                    {item.hot && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded ml-1.5">🔥 Hot</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-4">Candidate Reputation</p>
              {[
                { action: 'Answer a question', pts: '+20 RP' },
                { action: 'Publish a constituency update', pts: '+40 RP' },
                { action: 'Resolve a reported issue', pts: '+100 RP' },
                { action: 'Host a live town hall', pts: '+80 RP' },
              ].map(item => (
                <div key={item.action} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/80">{item.action}</span>
                  <span className="font-serif text-sm font-bold text-[#E8C040]">{item.pts}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F5438]/30 border border-[#0F5438]/50 rounded-xl p-6 md:p-8">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-5">Ward Civic Index — Live Leaderboard</p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { ward: 'Ward A', lga: 'Oredo', score: 91, change: '+4' },
                { ward: 'Ward B', lga: 'Egor', score: 85, change: '+2' },
                { ward: 'Ward C', lga: 'Ikpoba Okha', score: 78, change: '+6' },
                { ward: 'Ward D', lga: 'Ovia North East', score: 72, change: '-1' },
                { ward: 'Ward E', lga: 'Etsako West', score: 65, change: '+9' },
                { ward: 'Ward F', lga: 'Uhunmwonde', score: 58, change: '+3' },
              ].map(w => (
                <div key={w.ward} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-xs text-white/70 font-semibold mb-2">{w.ward} · {w.lga}</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="font-serif text-2xl font-black text-white">{w.score}</span>
                    <span className={`text-xs font-bold ${w.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{w.change}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0F5438] to-[#E8C040]" style={{ width: `${w.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CANDIDATES */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end flex-wrap gap-4 mb-10">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#0F5438] bg-[#E8F3EE] px-3 py-1.5 rounded inline-block mb-4">Candidate Directory</span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-[#0D1B12]">Digital Constituency Offices</h2>
              <p className="text-[#3D5246] mt-2">Every verified candidate&apos;s public profile — bio, manifesto, Q&A.</p>
            </div>
            <Link href="/candidates"><Button variant="outline" className="border-[#0A3D2B] text-[#0A3D2B] hover:bg-[#0A3D2B] hover:text-white">View all candidates</Button></Link>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Candidate A', party: 'PDP', office: 'House of Reps · Ughelli North', followers: '2.1k', qas: 48 },
              { name: 'Candidate B', party: 'APC', office: 'Senatorial District · Edo Central', followers: '3.4k', qas: 72 },
              { name: 'Candidate C', party: 'LP', office: 'Governorship · Delta State', followers: '5.8k', qas: 103 },
              { name: 'Candidate D', party: 'NNPP', office: 'House of Reps · Sapele/Okpe', followers: '890', qas: 21 },
            ].map(c => (
              <div key={c.name} className="bg-white border border-[#D8E4DC] rounded-xl overflow-hidden hover:border-[#0A3D2B] hover:-translate-y-0.5 transition-all">
                <div className="h-28 bg-[#E8F3EE] flex items-center justify-center font-serif text-3xl font-black text-[#0F5438] relative">
                  {c.name[0]}
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-[#0A3D2B] text-white px-1.5 py-0.5 rounded">✓ Verified</span>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#C8960A] mb-1">{c.party}</p>
                  <h3 className="font-bold text-[#0D1B12]">{c.name}</h3>
                  <p className="text-xs text-[#3D5246]">{c.office}</p>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-[#EAF0EB] text-xs text-[#3D5246]">
                    <span><strong className="text-[#0D1B12]">{c.followers}</strong> followers</span>
                    <span><strong className="text-[#0D1B12]">{c.qas}</strong> Q&As</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-[#0D1B12]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#E8C040] bg-[#C8960A]/15 px-3 py-1.5 rounded inline-block mb-5">Let&apos;s Build Together</span>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Ready to launch DICO?</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">For candidates, parties, campaign teams, and civic organisations ready to engage Nigerian voters at scale.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register"><Button size="lg" className="bg-[#C8960A] hover:bg-[#dba50c] text-black font-bold px-8">Get Started Free</Button></Link>
            <Link href="/candidates"><Button size="lg" variant="outline" className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white">View Candidates</Button></Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#060E08] py-8 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-white">DICO</span>
            <span className="text-xs text-white/50">· Digital Constituency Office</span>
          </div>
          <div className="flex gap-6 text-xs text-white/50">
            <Link href="/login" className="hover:text-white">Sign In</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
            <Link href="/candidates" className="hover:text-white">Candidates</Link>
          </div>
          <p className="text-xs text-white/30">© 2026 DICO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
