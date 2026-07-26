export function CivictSection() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-[#050F09] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:48px_48px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#C8960A]/15 border border-[#C8960A]/30 text-[#E8C040] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8C040] animate-pulse" /> CIVICT Token Economy
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-3">The <span className="text-[#E8C040]">People&apos;s Exchange</span></h2>
          <p className="text-white/70 max-w-xl mx-auto">Every question, vote, and idea now has measurable value.</p>
        </div>
        <div className="bg-gradient-to-br from-[#0F5438]/50 to-[#050F09] border border-[#C8960A]/25 rounded-xl p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#C8960A]/60 mb-3">CIVICT — Civic Token</p>
            <h3 className="font-serif text-2xl md:text-3xl font-black text-white mb-4">Participation is now a commodity.</h3>
            <p className="text-sm text-white/80 leading-relaxed mb-6">Citizens supply what candidates need — attention, ideas, local knowledge. CIVICT makes that value visible and rewarding.</p>
            <div className="flex gap-8 flex-wrap">
              {[{ num: '100 ₡', label: 'Starting Bonus' }, { num: '5%', label: 'Community Tax' }, { num: 'Weekly', label: 'Market Close' }].map(s => (
                <div key={s.label}>
                  <p className="font-serif text-xl font-black text-[#E8C040]">{s.num}</p>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
           <div className="animate-coin w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[#F0D060] to-[#8A6200] border-4 border-[#C8960A]/50 shadow-[0_0_0_8px_rgba(200,150,10,0.08),0_20px_60px_rgba(200,150,10,0.3)] flex items-center justify-center flex-col"
             style={{ animation: 'coinFloat 7s ease-in-out infinite, coinSpin 18s linear infinite' }}>
              <span className="font-serif text-3xl md:text-4xl font-black text-[#503000]/70">₡</span>
              <span className="text-[8px] font-black tracking-[0.18em] uppercase text-[#503000]/60">CIVICT</span>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-3 mb-10">
          {[
            { phase: '01', title: 'Market Opening', desc: '100 CIVICT + Ward Badge.' },
            { phase: '02', title: 'Demand Announcement', desc: 'Priority topic earns more CIVICT.' },
            { phase: '03', title: 'Community Market', desc: 'Questions, votes, peer ratings.' },
            { phase: '04', title: 'Civic Taxation', desc: '5% to Community Tax Pool.' },
            { phase: '05', title: 'Policy Auction', desc: 'Allocate to roads, jobs, health.' },
            { phase: '06', title: 'Scarcity Events', desc: 'Limited badges create urgency.' },
            { phase: '07', title: 'Ward Stock Market', desc: 'Live Civic Index per ward.' },
            { phase: '08', title: 'Candidate Response', desc: 'Reputation Points for engagement.' },
          ].map(p => (
            <div key={p.phase} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-[#C8960A]/30 transition-colors">
              <p className="text-[10px] font-bold text-[#C8960A]/50 mb-2">Phase {p.phase}</p>
              <h4 className="text-sm font-bold text-white mb-1.5">{p.title}</h4>
              <p className="text-xs text-white/60">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
