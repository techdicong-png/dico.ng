'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

type NavLink = {
  href: string
  label: string
  icon: string
  exact?: boolean
  gold?: boolean
  dropdown?: false
}

type NavDropdown = {
  label: string
  icon: string
  dropdown: true
  gold?: boolean
  children: { href: string; label: string; icon?: string }[]
}

type NavItem = NavLink | NavDropdown

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: 'fa-house', exact: true },
  {
    label: 'Explore', icon: 'fa-compass', dropdown: true,
    children: [
      { href: '/explorer', label: 'Your Constituency', icon: 'fa-magnifying-glass-location' },
      { href: '/candidates', label: 'All Candidates', icon: 'fa-users' },
    ],
  },
  // { href: '/sessions', label: 'Live Session', icon: 'fa-video' },
  // { href: '/civict', label: 'CIVICT', icon: 'fa-coins' },
  { href: '/pricing', label: 'Pricing', icon: 'fa-tag' },
  {
    label: 'Insights', icon: 'fa-chart-simple', dropdown: true,
    children: [
      { href: '/reports', label: 'Reports', icon: 'fa-file-lines' },
      { href: '/polls', label: 'Polls', icon: 'fa-square-poll-vertical' },
    ],
  },
  { href: '/contact', label: 'Contact', icon: 'fa-envelope' },
  {
    label: 'Get Started', icon: 'fa-rocket', dropdown: true, gold: true,
    children: [
      { href: '/register?role=candidate', label: 'As Candidate', icon: 'fa-chalkboard-user' },
      { href: '/register?role=voter', label: 'As Voter', icon: 'fa-user-check' },
    ],
  },
  { href: '/login', label: 'Login', icon: 'fa-arrow-right-to-bracket' },
]

function isDropdown(item: NavItem): item is NavDropdown {
  return 'dropdown' in item && item.dropdown === true
}

function isActive(pathname: string, item: NavLink): boolean {
  if (item.exact) return pathname === item.href
  return pathname.startsWith(item.href)
}

export function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => document.body.classList.add('motion-ready'))
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 lg:px-6 transition-all duration-300 ${
        scrolled
          ? 'bg-mint/84 backdrop-blur-xl shadow-[0_8px_30px_rgba(10,61,43,0.07)] border-b border-mint-line'
          : 'bg-mint border-b border-mint-line'
      }`}>
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="DICO" width={40} height={40} className="shrink-0" />
          <span className="font-serif text-xl font-black tracking-tight -ml-2">
            <span className="text-gold">I</span>
            <span className="text-forest">CO</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-0.5 h-full"
          onMouseLeave={() => setOpenDropdown(null)}>
          {navItems.map(item =>
            isDropdown(item) ? (
              <div key={item.label} className="relative h-full flex items-center"
                onMouseEnter={() => setOpenDropdown(item.label)}>
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  item.gold
                    ? 'text-gold font-semibold hover:bg-gold/10'
                    : 'text-ink/70 hover:text-ink hover:bg-gold/5'
                }`}>
                  <i className={`fa-solid ${item.icon} text-[10px] ${item.gold ? 'text-gold' : 'text-muted'}`} />
                  {item.label}
                  <svg className="w-2 h-2 stroke-current fill-none stroke-2 mt-0.5 transition-transform duration-200" viewBox="0 0 10 10"
                    style={{ transform: openDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <polyline points="2,4 5,7 8,4" />
                  </svg>
                </span>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white border border-mint-line rounded-xl shadow-lg min-w-[220px] p-2 overflow-hidden">
                      {item.children.map(child => (
                        <Link key={child.href} href={child.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            pathname === child.href
                              ? 'text-gold font-semibold bg-gold/5'
                              : 'text-ink/70 hover:text-ink hover:bg-gold/5'
                          }`}>
                          {child.icon && (
                            <span className="w-7 h-7 rounded-md bg-mint flex items-center justify-center shrink-0">
                              <i className={`fa-solid ${child.icon} text-[10px] ${pathname === child.href ? 'text-gold' : 'text-muted'}`} />
                            </span>
                          )}
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.label} href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive(pathname, item)
                    ? 'text-ink bg-mint-200/60'
                    : 'text-ink/70 hover:text-ink hover:bg-gold/5'
                }`}>
                <i className={`fa-solid ${item.icon} text-[10px] ${isActive(pathname, item) ? 'text-gold' : 'text-muted'}`} />
                {item.label}
                {isActive(pathname, item) && (
                  <span className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-ink rounded-full" />
                )}
              </Link>
            )
          )}
        </div>

        {/* Hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col items-center justify-center gap-[4.5px] w-9 h-9 rounded-lg bg-gold/10 hover:bg-gold/20 transition-all">
          <span className={`block w-[18px] h-[2px] bg-ink rounded-full transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-[18px] h-[2px] bg-ink rounded-full transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-[18px] h-[2px] bg-ink rounded-full transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 right-0 w-[300px] max-w-[85vw] h-full bg-mint shadow-2xl overflow-y-auto transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Mobile Logo */}
          <div className="flex items-center px-6 pt-6 pb-4 border-b border-mint-line">
            <Image src="/logo.png" alt="DICO" width={40} height={40} />
          </div>

          {/* Mobile Links */}
          <div className="py-2">
            {navItems.map(item =>
              isDropdown(item) ? (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium border-b border-mint-line transition-colors ${
                      item.gold ? 'text-gold' : 'text-ink/70 hover:text-ink'
                    }`}>
                    <i className={`fa-solid ${item.icon} text-[11px] w-4 ${item.gold ? 'text-gold' : 'text-muted'}`} />
                    {item.label}
                    <svg className="w-2.5 h-2.5 stroke-current fill-none stroke-2 ml-auto transition-transform duration-200"
                      style={{ transform: openDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      viewBox="0 0 10 10">
                      <polyline points="2,4 5,7 8,4" />
                    </svg>
                  </button>
                  {openDropdown === item.label && (
                    <div className="bg-mint-200/30 py-1">
                      {item.children.map(child => (
                        <Link key={child.href} href={child.href}
                          className={`flex items-center gap-3 px-10 py-3 text-sm transition-colors ${
                            pathname === child.href
                              ? 'text-gold font-semibold bg-gold/5'
                              : 'text-ink/70 hover:text-ink hover:bg-gold/5'
                          }`}
                          onClick={() => setMobileOpen(false)}>
                          {child.icon && <i className={`fa-solid ${child.icon} text-[10px] w-3 ${pathname === child.href ? 'text-gold' : 'text-muted'}`} />}
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium border-b border-mint-line transition-colors ${
                    isActive(pathname, item) ? 'text-ink bg-mint-200/60' : 'text-ink/70 hover:text-ink'
                  }`}
                  onClick={() => setMobileOpen(false)}>
                  <i className={`fa-solid ${item.icon} text-[11px] w-4 ${isActive(pathname, item) ? 'text-gold' : 'text-muted'}`} />
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile Footer */}
          <div className="px-6 py-6 mt-2 border-t border-mint-line text-center">
            <p className="text-xs text-ink/50 mb-4">&copy; 2025 DICO. All rights reserved.</p>
            <p className="text-[10px] text-ink/40">
              <Link href="#" className="hover:text-ink">Privacy</Link>
              <span className="mx-2">·</span>
              <Link href="#" className="hover:text-ink">Terms</Link>
              <span className="mx-2">·</span>
              <Link href="#" className="hover:text-ink">Cookies</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
