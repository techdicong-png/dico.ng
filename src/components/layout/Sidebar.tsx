'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutGrid, Users, Video, Vote, FileText, CircleDollarSign, 
  Search, UserCircle, Settings, BarChart3, Shield,
  type LucideIcon 
} from 'lucide-react'

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
}

const voterLinks: NavLink[] = [
  { href: '/dashboard/voter', label: 'Dashboard', icon: LayoutGrid },
  { href: '/feed',            label: 'Feed', icon: FileText }, 
  { href: '/candidates',      label: 'Candidates', icon: Users },
  { href: '/sessions',        label: 'Live Sessions', icon: Video },
  { href: '/polls',           label: 'Polls', icon: Vote },
  { href: '/reports',         label: 'Reports', icon: FileText },
  { href: '/civict',          label: 'CIVICT Wallet', icon: CircleDollarSign },
  { href: '/explorer',        label: 'Explorer', icon: Search },
]

const candidateLinks: NavLink[] = [
  { href: '/dashboard/candidate', label: 'Overview', icon: LayoutGrid },
  { href: '/candidates/posts',     label: 'My Posts', icon: FileText },  
  { href: '/sessions',            label: 'Live Sessions', icon: Video },
  { href: '/polls',               label: 'Polls', icon: Vote },
  { href: '/reports',             label: 'Reports', icon: FileText },
  { href: '/candidates',          label: 'All Candidates', icon: Users },
  { href: '/analytics',           label: 'Analytics', icon: BarChart3 },
  { href: '/team',                label: 'Campaign Team', icon: Users },
]

const adminLinks: NavLink[] = [
  { href: '/dashboard/admin', label: 'Overview', icon: Shield },
  { href: '/candidates',      label: 'Candidates', icon: Users },
  { href: '/sessions',        label: 'Sessions', icon: Video },
  { href: '/polls',           label: 'Polls', icon: Vote },
  { href: '/civict',          label: 'CIVICT', icon: CircleDollarSign },
]

const accountLinks: NavLink[] = [
  { href: '/profile',          label: 'Profile', icon: UserCircle },
  { href: '/profile/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  
  const navLinks: NavLink[] = 
    role === 'candidate' || role === 'campaign_team' ? candidateLinks
    : role === 'admin' ? adminLinks
    : voterLinks

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-60 bg-white border-r border-border overflow-y-auto py-4 z-40 hidden lg:flex flex-col">
      <div className="px-3 space-y-0.5 flex-1">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              pathname === link.href
                ? 'bg-forest-light text-forest'
                : 'text-muted hover:bg-forest-faint hover:text-forest'
            )}>
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="px-3 mt-2">
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted px-3 mb-1.5">Account</p>
        {accountLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              pathname === link.href
                ? 'bg-forest-light text-forest'
                : 'text-muted hover:bg-forest-faint hover:text-forest'
            )}>
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="mx-3 mt-4 p-4 rounded-xl bg-gradient-to-br from-forest to-forest-mid">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/40">CIVICT Balance</p>
        <p className="font-serif text-xl font-black text-gold">₡ 1,240</p>
        <p className="text-[11px] text-white/40">Observer</p>
      </div>
    </aside>
  )
}
