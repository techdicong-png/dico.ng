"use client"
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#060E08] pt-16 pb-0 px-6 border-t border-white/5">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-serif text-xl text-white">DICO</span>
            <p className="text-sm text-white/40 mt-3 max-w-[260px] leading-relaxed">
              Digital Constituency Office — connecting verified voters directly to their representatives through transparent, token-powered civic engagement.
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { viewBox: '0 0 24 24', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
                { viewBox: '0 0 24 24', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z', rect: '2,2,20,20,5,5' },
                { viewBox: '0 0 24 24', path: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z', polygon: '9.75 15.02 15.5 12 9.75 8.98 9.75 15.02' },
              ].map((icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gold/15 hover:border-gold/35 transition-all">
                  <svg viewBox={icon.viewBox} className="w-3.5 h-3.5 stroke-white/60 fill-none stroke-[1.8]">
                    {icon.rect && <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />}
                    <path d={icon.path} />
                    {icon.polygon && <polygon points={icon.polygon} />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="text-[11px] font-bold tracking-widest uppercase text-white/30 mb-4">Quick Links</h6>
            <ul className="space-y-3">
              {[{ href: '/', label: 'Home' }, { href: '/candidates', label: 'Find Your Candidate' }, { href: '/explorer', label: 'Find Your Constituency' }, { href: '/candidates', label: 'View All Candidates' }, { href: '/sessions', label: 'Live Sessions' }].map(l => (
                <li key={l.label}><Link href={l.href} className="text-sm text-white/55 hover:text-white hover:pl-1 transition-all">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h6 className="text-[11px] font-bold tracking-widest uppercase text-white/30 mb-4">More Links</h6>
            <ul className="space-y-3">
              {[{ href: '/register?role=candidate', label: 'Register as Candidate' }, { href: '/register?role=voter', label: 'Register as Voter' }, { href: '/pricing', label: 'Pricing' }, { href: '/contact', label: 'Contact Us' }].map(l => (
                <li key={l.label}><Link href={l.href} className="text-sm text-white/55 hover:text-white hover:pl-1 transition-all">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* More Links 2 */}
          <div>
            <h6 className="text-[11px] font-bold tracking-widest uppercase text-white/30 mb-4">More Links</h6>
            <ul className="space-y-3">
              {[{ href: '/reports', label: 'Reports' }, { href: '/polls', label: 'Polls' }, { href: '/civict', label: 'CIVICT' }].map(l => (
                <li key={l.label}><Link href={l.href} className="text-sm text-white/55 hover:text-white hover:pl-1 transition-all">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <h6 className="text-[11px] font-bold tracking-widest uppercase text-white/30 mb-3">Stay Updated</h6>
          <p className="text-sm text-white/45 mb-4">Get weekly town hall schedules, poll results, and civic updates.</p>
          <form className="relative max-w-md" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-4 pr-32 text-sm text-white outline-none focus:border-gold/50 transition-colors placeholder:text-white/30" />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gold text-ink font-semibold text-sm px-4 py-2 rounded-md hover:bg-gold-hover transition-all">
              Subscribe
            </button>
          </form>
          <p className="text-xs text-white/25 mt-2">No spam. Unsubscribe anytime.</p>
        </div>

        {/* Bottom */}
        <div className="py-5 mt-8 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-white/5">
          <span className="text-xs text-white/30">&copy; 2025 DICO. All rights reserved.</span>
          <div className="flex gap-5 text-xs text-white/30">
            <a href="#" className="hover:text-white/65">Privacy Policy</a>
            <a href="#" className="hover:text-white/65">Terms of Service</a>
            <a href="#" className="hover:text-white/65">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
