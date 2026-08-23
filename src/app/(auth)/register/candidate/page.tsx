import Link from 'next/link'
import Image from 'next/image'
import { CandidateRegisterForm } from '@/components/auth/CandidateRegisterForm'

export default function CandidateRegisterPage() {
  return (
    <div className="min-h-screen bg-sand dark:bg-[#0f1d16]">
      {/* NAVBAR */}
      <nav className="bg-forest fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between h-[60px] border-b border-white/5">
        <Link href="/" className="font-serif text-lg font-bold text-white flex items-center gap-2">
          <Image src="/logo.png" alt="DICO" width={32} height={32} />
          DICO <span className="text-[10px] font-bold tracking-widest uppercase text-gold border border-gold/40 px-1.5 py-0.5 rounded-sm">Nigeria</span>
        </Link>
        <Link href="/" className="text-white/70 text-sm font-medium flex items-center gap-1.5 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-md transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to DICO
        </Link>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-[#071E12] to-[#0F5438] pt-28 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(200,150,10,0.07)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded mb-4">
            Candidate Registration · DICO
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-black text-white mb-3">
            Register as a <span className="text-gold">Candidate</span>
          </h1>
          <p className="text-sm text-white/55 max-w-xl mx-auto">
            Join Nigeria&apos;s digital constituency platform. Connect directly with verified voters across your ward, LGA and state.
          </p>
        </div>
      </div>

      {/* FORM WRAPPER */}
      <div className="max-w-3xl mx-auto px-4 pb-20 -mt-10 relative z-20">
        <CandidateRegisterForm />
      </div>
    </div>
  )
}