export function TownHallSection() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-sand">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-3 py-1.5 rounded inline-block mb-4">Flagship Feature</span>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-4">60 Minutes With My Candidate</h2>
          <div className="w-9 h-0.5 bg-gold rounded mb-5"></div>
          <p className="text-[#3D5246] mb-8 leading-relaxed">A daily live session that brings one candidate face-to-face with thousands of verified voters.</p>
          <div className="space-y-5 border-l-4 border-forest pl-5">
            {[
              { title: 'Live video & public Q&A', desc: 'Top-voted questions answered in real time.' },
              { title: 'Instant sentiment tracking', desc: 'Campaign teams see reactions and poll results live.' },
              { title: 'Daily recurring engagement', desc: 'Regular sessions create habit and retention.' },
            ].map(item => (
              <div key={item.title}>
                <h4 className="font-semibold text-ink mb-1">{item.title}</h4>
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
          <p className="text-sm text-white/80 mb-5">Today's session — Edo Central Senatorial District.</p>
          <div className="flex gap-5 text-xs text-white/70">
            <span>👁️ 1,240 watching</span>
            <span>❓ 86 questions</span>
          </div>
        </div>
      </div>
    </section>
  )
}
