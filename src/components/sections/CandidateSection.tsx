import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CandidatesSection() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-sand">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-3 py-1.5 rounded inline-block mb-4">Candidate Directory</span>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink">Digital Constituency Offices</h2>
            <p className="text-[#3D5246] mt-2">Every verified candidate&apos;s public profile.</p>
          </div>
          <Link href="/candidates"><Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">View all candidates</Button></Link>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: 'Candidate A', party: 'PDP', office: 'House of Reps · Ughelli North', followers: '2.1k', qas: 48 },
            { name: 'Candidate B', party: 'APC', office: 'Senatorial District · Edo Central', followers: '3.4k', qas: 72 },
            { name: 'Candidate C', party: 'LP', office: 'Governorship · Delta State', followers: '5.8k', qas: 103 },
            { name: 'Candidate D', party: 'NNPP', office: 'House of Reps · Sapele/Okpe', followers: '890', qas: 21 },
          ].map(c => (
            <div key={c.name} className="bg-white border border-border rounded-xl overflow-hidden hover:border-forest hover:-translate-y-0.5 transition-all">
              <div className="h-28 bg-forest-light flex items-center justify-center font-serif text-3xl font-black text-forest-mid relative">
                {c.name[0]}
                <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-forest text-white px-1.5 py-0.5 rounded">✓ Verified</span>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gold mb-1">{c.party}</p>
                <h3 className="font-bold text-ink">{c.name}</h3>
                <p className="text-xs text-[#3D5246]">{c.office}</p>
                <div className="flex gap-3 mt-3 pt-3 border-t border-border-light text-xs text-[#3D5246]">
                  <span><strong className="text-ink">{c.followers}</strong> followers</span>
                  <span><strong className="text-ink">{c.qas}</strong> Q&As</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
