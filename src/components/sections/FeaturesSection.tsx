export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-3 py-1.5 rounded inline-block mb-4">Core Platform</span>
        <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-4">A complete civic engagement ecosystem</h2>
        <p className="text-[#3D5246] max-w-xl mx-auto">DICO brings verified voters, candidates, and communities together in one structured, accountable digital environment.</p>
      </div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
        {[
          { icon: '🛡️', title: 'Verified Voter Badge', desc: 'PVC-based verification at ward level.', tag: 'Voter' },
          { icon: '🎙️', title: 'Ask Your Candidate', desc: 'Send questions via text, voice, or video.', tag: 'Q&A' },
          { icon: '📅', title: 'Digital Town Halls', desc: 'Weekly live forums for community leaders.', tag: 'Live' },
          { icon: '📊', title: "People's Verdict", desc: 'Weekly sentiment polls measuring priorities.', tag: 'Polls' },
          { icon: '📍', title: 'Community Reporting', desc: 'File issue reports with photos and GPS.', tag: 'Civic' },
          { icon: '🤖', title: 'AI Campaign Assistant', desc: 'Generate speeches and constituency reports.', tag: 'AI · Phase 2' },
        ].map(f => (
          <div key={f.title} className="border border-border rounded-xl p-6 hover:border-forest hover:-translate-y-1 transition-all">
            <div className="w-11 h-11 rounded-lg bg-forest-light flex items-center justify-center text-lg mb-4">{f.icon}</div>
            <h3 className="font-semibold text-ink mb-2">{f.title}</h3>
            <p className="text-sm text-[#3D5246] leading-relaxed">{f.desc}</p>
            <span className="inline-block mt-3 text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2 py-0.5 rounded">{f.tag}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
