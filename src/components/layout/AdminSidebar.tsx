'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Shield, Users, FileText, CircleDollarSign, Wallet, UserCheck, Image, TrendingUp, ArrowRightLeft, BarChart3 } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }, 
  { href: '/admin/users',     label: 'Users', icon: Users },
  { href: '/admin/candidates', label: 'Candidate Verification', icon: UserCheck },
  { href: '/admin/ads', label: 'Ad Approvals', icon: Image },
  { href: '/admin/transfers', label: 'Transfer Approvals', icon: ArrowRightLeft },
  { href: '/admin/market', label: 'Trade Matching', icon: TrendingUp },
]

export function AdminSidebar() {
  const pathname = usePathname()

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
        id="sidebar" // REQUIRED FOR HAMBURGER TO WORK
        className="fixed top-14 left-0 bottom-0 w-60 bg-white border-r border-border overflow-y-auto py-4 z-40 -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col"
      >
        <div className="px-3 space-y-0.5">
          {links.map(link => (
            <Link key={link.href} href={link.href}
              onClick={closeSidebar}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
                  ? 'bg-forest-light text-forest'
                  : 'text-muted hover:bg-forest-faint hover:text-forest'
              )}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  )
}