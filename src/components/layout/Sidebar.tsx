'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid, Users, Video, Vote, FileText, CircleDollarSign, Rss,
  Search, UserCircle, Settings, BarChart3, Shield, Store, LogOut,
  Compass, Wallet,
  type LucideIcon
} from 'lucide-react'

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
  count?: string
  gold?: boolean
  market?: boolean
  logout?: boolean
}

const voterLinks: NavLink[] = [
  { href: '/dashboard/voter', label: 'Dashboard', icon: LayoutGrid },
  { href: '/feed', label: 'Feeds', icon: Rss, count: '12' },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/sessions', label: 'Live Sessions', icon: Video, count: '1 LIVE' },
  { href: '/market', label: 'Dico Online Market', icon: Store, market: true },
]

const candidateLinks: NavLink[] = [
  { href: '/dashboard/candidate', label: 'Overview', icon: LayoutGrid },
  { href: '/candidates/posts', label: 'My Post', icon: FileText },
  { href: '/sessions', label: 'Live Sessions', icon: Video },
  { href: '/polls', label: 'Polls', icon: Vote },
  { href: '/reports', label: 'Reports', icon: FileText, count: '15' },
  { href: '/candidates', label: 'All Candidates', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/team', label: 'Campaign Team', icon: Users },
  { href: '/market', label: 'DICO Online Market', icon: Store, market: true },
]

const adminLinks: NavLink[] = [
  { href: '/dashboard/admin', label: 'Overview', icon: Shield },
  { href: '/market', label: 'DICO Online Market', icon: Store, market: true },
]

const accountLinks: NavLink[] = [
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/profile/settings', label: 'Settings', icon: Settings },
  { href: '/login', label: 'Logout', icon: LogOut, logout: true },
]

export function Sidebar({ role, userInitial, userName }: { role: string; userInitial: string; userName: string }) {
  const pathname = usePathname()

  const navLinks: NavLink[] =
    role === 'candidate' || role === 'campaign_team' ? candidateLinks
    : role === 'admin' ? adminLinks
    : voterLinks

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-60 bg-card dark:bg-[#11241b] border-r border-mint-line dark:border-[rgba(234,246,239,0.08)] overflow-y-auto py-4 z-40 hidden lg:flex flex-col transition-colors">
      {/* Wallet Card */}
      <Link href={role === 'candidate' ? '/dashboard/candidate' : '/wallet'}
        className="block mx-4 mb-3 no-underline text-white">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-forest to-forest-mid p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(200,150,10,0.12),transparent_40%)] pointer-events-none" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1">
            {role === 'candidate' ? 'Campaign Funds' : 'CIVICT Balance'}
          </p>
          <p className="font-serif text-2xl font-bold">
            <span className="text-gold-400 text-sm">{role === 'candidate' ? '₦' : '₡'}</span>
            {role === 'candidate' ? '1.2M' : '2,450'}
          </p>
          <p className="text-[11px] text-white/50 mt-1">
            {role === 'candidate' ? '₦450k raised this month' : '+340 earned this month'}
          </p>
        </div>
      </Link>

      {/* Profile Mini */}
      <Link href="/profile" className="block mx-4 mb-4 no-underline">
        <div className="relative rounded-xl bg-gradient-to-br from-forest to-forest-mid dark:from-[#1b3a2b] dark:to-[#0f1d16] p-4 transition-all hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          {/* Decorative gold dot */}
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(200,150,10,0.5)]" />
          
          <div className="flex items-center gap-3">
            {/* Avatar — bigger, bordered, with subtle glow */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-hover dark:from-[#d4a93f] dark:to-[#be9330] flex items-center justify-center text-base font-bold text-white shadow-[0_0_12px_rgba(200,150,10,0.3)]">
                {userInitial}
              </div>
              {/* Verified check */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-forest dark:bg-[#11241b] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-gold" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-[11px] text-white/60 truncate flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gold" />
                {role === 'candidate' ? 'Eti-Osa · APC · Reps' : 'Eti-Osa · Lagos · Ward 7'}
              </p>
            </div>

            {/* Chevron hint */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/30 shrink-0">
              <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>


      {/* Main Nav */}
      <div className="px-4 mb-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted dark:text-[#c0d0c4] mb-2 pl-3">
          {role === 'candidate' ? 'Menu' : 'Main'}
        </p>
        <ul className="space-y-0.5">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                  link.market ? (
                    pathname === link.href
                      ? 'text-forest-900 dark:text-white bg-mint-200 dark:bg-[#1b3a2b] font-bold font-serif'
                      : 'text-forest-900 dark:text-white hover:bg-mint-200 dark:hover:bg-[#1b3a2b] font-bold font-serif border border-border-tint dark:border-[rgba(234,246,239,0.10)]'
                  ) : (
                    pathname === link.href
                      ? 'text-forest-900 dark:text-white bg-mint dark:bg-[#1b3a2b] font-semibold'
                      : 'text-ink-soft dark:text-[rgba(255,255,255,0.65)] hover:text-ink dark:hover:text-white hover:bg-mint dark:hover:bg-[#1b3a2b]'
                  ),
                  link.logout && 'hover:!bg-red-50 hover:!text-red-500 dark:hover:!bg-[rgba(230,48,75,0.15)] dark:hover:!text-[#ff5a6e] mt-2'
                )}>
                {/* 🆕 Designer's gold left border on active links */}
                {pathname === link.href && (
                  <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-gold dark:bg-gold rounded-r-full shadow-[0_0_10px_rgba(200,150,10,0.8)]" />
                )}
                {link.market && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gold dark:bg-gold shadow-[0_0_8px_rgba(200,150,10,0.5)]" />
                )}
                <link.icon className={cn(
                  'w-[18px] h-[18px] stroke-[1.8] shrink-0',
                  pathname === link.href && !link.market && 'stroke-gold dark:stroke-gold',
                  link.market && 'stroke-gold dark:stroke-gold'
                )} />
                {link.label}
                {link.count && (
                  <span className={cn(
                    'text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded-full',
                    link.count === '1 LIVE' ? 'bg-gold-light dark:bg-[rgba(212,169,63,0.16)] text-gold-500 dark:text-gold' : 'bg-gold text-[#2d2107]'
                  )}>
                    {link.count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Civic Tools (voter only) */}
      {role === 'voter' && (
        <div className="px-4 mb-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted dark:text-[#c0d0c4] mb-2 pl-3">Civic Tools</p>
          <ul className="space-y-0.5">
            {[
              { href: '/polls', label: 'Polls', icon: Vote },
              { href: '/reports', label: 'Reports', icon: FileText, count: '3' },
              { href: '/wallet', label: 'Civic Wallet', icon: CircleDollarSign },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                    pathname === link.href
                      ? 'text-forest-900 dark:text-white bg-mint dark:bg-[#1b3a2b] font-semibold'
                      : 'text-ink-soft dark:text-[rgba(255,255,255,0.65)] hover:text-ink dark:hover:text-white hover:bg-mint dark:hover:bg-[#1b3a2b]'
                  )}>
                  {/* 🆕 Gold left border on active */}
                  {pathname === link.href && (
                    <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-gold dark:bg-gold rounded-r-full shadow-[0_0_10px_rgba(200,150,10,0.8)]" />
                  )}
                  <link.icon className={cn('w-[18px] h-[18px] stroke-[1.8] shrink-0', pathname === link.href && 'stroke-gold dark:stroke-gold')} />
                  {link.label}
                  {link.count && <span className="text-[10px] font-bold bg-gold text-[#2d2107] ml-auto px-1.5 py-0.5 rounded-full">{link.count}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Account */}
      <div className="px-4 mt-auto">
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted dark:text-[#c0d0c4] mb-2 pl-3">Account</p>
        <ul className="space-y-0.5">
          {accountLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                  link.logout ? (
                    'text-ink-soft dark:text-[rgba(255,255,255,0.65)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-[rgba(230,48,75,0.15)] dark:hover:text-[#ff5a6e] mt-1'
                  ) : (
                    pathname === link.href
                      ? 'text-forest-900 dark:text-white bg-mint dark:bg-[#1b3a2b] font-semibold'
                      : 'text-ink-soft dark:text-[rgba(255,255,255,0.65)] hover:text-ink dark:hover:text-white hover:bg-mint dark:hover:bg-[#1b3a2b]'
                  )
                )}>
                {/* 🆕 Gold left border on active (not for logout) */}
                {pathname === link.href && !link.logout && (
                  <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-gold dark:bg-gold rounded-r-full shadow-[0_0_10px_rgba(200,150,10,0.8)]" />
                )}
                <link.icon className={cn('w-[18px] h-[18px] stroke-[1.8] shrink-0', pathname === link.href && !link.logout && 'stroke-gold dark:stroke-gold')} />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
