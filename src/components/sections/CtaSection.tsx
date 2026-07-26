import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-[#0D1B12]">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#E8C040] bg-[#C8960A]/15 px-3 py-1.5 rounded inline-block mb-5">Let&apos;s Build Together</span>
        <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">Ready to launch DICO?</h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">For candidates, parties, and civic organisations ready to engage Nigerian voters at scale.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register"><Button size="lg" className="bg-gold hover:bg-gold-hover text-black font-bold px-8">Get Started Free</Button></Link>
          <Link href="/candidates"><Button size="lg" variant="outline" className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white">View Candidates</Button></Link>
        </div>
      </div>
    </section>
  )
}
