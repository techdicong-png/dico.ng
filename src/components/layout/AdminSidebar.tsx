'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Shield, Users, FileText, CircleDollarSign, Wallet, UserCheck, Image, TrendingUp } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/users',     label: 'Users', icon: Users },
  // NEW: Added the link to the candidate verification page
  { href: '/admin/candidates', label: 'Candidate Verification', icon: UserCheck },
  { href: '/admin/ads', label: 'Ad Approvals', icon: Image },
  { href: '/admin/market', label: 'Trade Matching', icon: TrendingUp },
  // { href: '/admin/reports',   label: 'Reports', icon: FileText },
  // { href: '/admin/grants',    label: 'CIVICT Grants', icon: CircleDollarSign },
  // { href: '/admin/finance',   label: 'Finance & Pool', icon: Wallet },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-60 bg-white border-r border-border overflow-y-auto py-4 z-40 hidden lg:flex flex-col">
      <div className="px-3 space-y-0.5">
        {links.map(link => (
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
    </aside>
  )
}