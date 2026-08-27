'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid, Users, Video, Vote, FileText, CircleDollarSign, Rss,
  UserCircle, Settings, BarChart3, Shield, Store, LogOut, TrendingUp,
  Compass, Wallet,
  MessageSquare,
  type LucideIcon
} from 'lucide-react'

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
  count?: string
  market?: boolean
  logout?: boolean
}

const voterLinks: NavLink[] = [
  { href: '/dashboard/voter', label: 'Dashboard', icon: LayoutGrid },
  { href: '/feed', label: 'Feeds', icon: Rss },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/sessions', label: 'Live Sessions', icon: Video, count: '1 LIVE' },
  { href: '/trade', label: 'CIVICT Trade', icon: TrendingUp },
  { href: '/market', label: 'Dico Online Market', icon: Store, market: true },
]

const candidateLinks: NavLink[] = [
  { href: '/dashboard/candidate', label: 'Media Hub', icon: LayoutGrid },
  { href: '/sessions', label: 'Live Sessions', icon: Video },
  { href: '/polls', label: 'Polls', icon: Vote },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/sms-campaigns', label: 'SMS Campaigns', icon: MessageSquare },
  { href: '/candidates', label: 'All Candidates', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/performance', label: 'Performance Rank', icon: TrendingUp },
  { href: '/team', label: 'Campaign Team', icon: Users },
  { href: '/trade', label: 'CIVICT Trade', icon: TrendingUp },
  { href: '/market', label: 'DICO Online Market', icon: Store, market: true },
]

const adminLinks: NavLink[] = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/candidates', label: 'Verify Candidates', icon: Users },
  { href: '/market', label: 'DICO Online Market', icon: Store, market: true },
]

const accountLinks: NavLink[] = [
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/profile/settings', label: 'Settings', icon: Settings },
  { href: '/login', label: 'Logout', icon: LogOut, logout: true },
]

export function Sidebar({ role, user }: { role: string; user: any }) {
  const pathname = usePathname()

  // Dynamic data from user object
  const userInitial = user?.full_name?.[0] || 'U'
  const userName = user?.full_name || 'User'
  const civictBalance = user?.civict_balance?.toLocaleString() || '0'
  const userLocation = [user?.lga, user?.state].filter(Boolean).join(' · ') || 'Location not set'

  const navLinks: NavLink[] =
    role === 'candidate' || role === 'campaign_team' ? candidateLinks
    : role === 'admin' ? adminLinks
    : voterLinks

  function closeSidebar() {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('sidebarOverlay')
    if (sidebar) {
      sidebar.classList.remove('translate-x-0')
      sidebar.classList.add('-translate-x-full')
    }
    if (overlay) overlay.classList.add('hidden')
  }

  return (
    <>
      {/* Overlay backdrop — mobile only */}
      <div
        id="sidebarOverlay"
        className="fixed inset-0 bg-black/40 z-30 hidden lg:hidden"
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        id="sidebar"
        className="fixed top-14 left-0 bottom-0 w-60 bg-card dark:bg-[#11241b] border-r border-mint-line dark:border-[rgba(255,255,255,0.08)] overflow-y-auto py-4 z-40 -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col"
      >
        {/* Wallet Card - Strictly CIVICT */}
        <Link href="/wallet" className="block mx-4 mb-3 no-underline text-white" onClick={closeSidebar}>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-forest to-forest-mid p-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1">
              CIVICT Balance
            </p>
            <p className="font-serif text-2xl font-bold">
              <span className="text-gold-400 text-sm">₡</span>
              {civictBalance}
            </p>
            <p className="text-[11px] text-white/50 mt-1">
              {role === 'candidate' ? 'Stockpile for your campaign' : 'Earn more by participating'}
            </p>
          </div>
        </Link>

        {/* Profile Mini - Dynamic Name & Location */}
        <Link href="/profile" className="block mx-4 mb-4 no-underline" onClick={closeSidebar}>
          <div className="relative rounded-xl bg-gradient-to-br from-forest to-forest-mid dark:from-[#1b3a2b] dark:to-[#0f1d16] p-4 transition-all hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(200,150,10,0.5)]" />
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-hover dark:from-[#d4a93f] dark:to-[#be9330] flex items-center justify-center text-base font-bold text-white shadow-[0_0_12px_rgba(200,150,10,0.3)]">
                  {userInitial}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-forest dark:bg-[#11241b] rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-gold" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-[11px] text-white/60 truncate flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  {userLocation}
                </p>
              </div>
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
                <Link href={link.href} onClick={closeSidebar}
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

        {/* Account */}
        <div className="px-4 mt-auto">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted dark:text-[#c0d0c4] mb-2 pl-3">Account</p>
          <ul className="space-y-0.5">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={link.logout ? undefined : closeSidebar}
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
    </>
  )
}