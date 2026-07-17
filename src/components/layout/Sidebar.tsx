'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutGrid, Users, Video, Vote, FileText, CircleDollarSign, 
  Search, UserCircle, Settings, BarChart3, Shield, Wallet, 
  type LucideIcon 
} from 'lucide-react'

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
}

const voterLinks: NavLink[] = [
  { href: '/dashboard/voter', label: 'Dashboard', icon: LayoutGrid },
  { href: '/candidates',      label: 'Candidates', icon: Users },
  { href: '/sessions',        label: 'Live Sessions', icon: Video },
  { href: '/polls',           label: 'Polls', icon: Vote },
  { href: '/reports',         label: 'Reports', icon: FileText },
  { href: '/civict',          label: 'CIVICT Wallet', icon: CircleDollarSign },
  { href: '/explorer',        label: 'Explorer', icon: Search },
]

const candidateLinks: NavLink[] = [
  { href: '/dashboard/candidate', label: 'Overview', icon: LayoutGrid },
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
   <aside className="fixed top-14 left-0 bottom-0 w-60 bg-white border-r border-border overflow-y-auto py-4 z-40 hidden lg:block  top-14 left-0 bottom-0 w-60 bg-white border-r border-[#D8E4DC] overflow-y-auto py-4 z-40 flex flex-col">
      <div className="px-3 space-y-1 flex-1">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === link.href
                ? 'bg-[#E8F3EE] text-[#0A3D2B]'
                : 'text-[#5A6E62] hover:bg-[#F0F8F3] hover:text-[#0A3D2B]'
            )}>
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="px-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#5A6E62] px-3 mb-2">Account</p>
        {accountLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === link.href
                ? 'bg-[#E8F3EE] text-[#0A3D2B]'
                : 'text-[#5A6E62] hover:bg-[#F0F8F3] hover:text-[#0A3D2B]'
            )}>
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="mx-3 mt-4 p-3 rounded-lg bg-gradient-to-br from-[#0A3D2B] to-[#0F5438]">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/40">CIVICT Balance</p>
        <p className="font-serif text-xl font-black text-[#E8C040]">₡ 1,240</p>
        <p className="text-[11px] text-white/40">Observer</p>
      </div>
    </aside>
  )
}
