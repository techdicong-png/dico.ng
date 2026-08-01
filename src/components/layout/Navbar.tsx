'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Moon, Sun, LogOut } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutGrid, Users, Video, Vote, FileText, CircleDollarSign, Rss,
  UserCircle, Settings, Store,
  type LucideIcon
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
  count?: string
}

const mobileLinks: NavLink[] = [
  { href: '/dashboard/voter', label: 'Dashboard', icon: LayoutGrid },
  { href: '/feed', label: 'Feeds', icon: Rss, count: '12' },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/sessions', label: 'Live Sessions', icon: Video, count: '1 LIVE' },
  { href: '/market', label: 'Dico Online Market', icon: Store },
  { href: '/polls', label: 'Polls', icon: Vote },
  { href: '/reports', label: 'Reports', icon: FileText, count: '3' },
  { href: '/wallet', label: 'Civic Wallet', icon: CircleDollarSign },
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/profile/settings', label: 'Settings', icon: Settings },
]

function MobileNav({ pathname, close }: { pathname: string; close: () => void }) {
  return (
    <div className="py-4">
      <div className="px-4">
        <ul className="space-y-0.5">
          {mobileLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={close}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  pathname === link.href
                    ? 'text-forest-900 dark:text-white bg-mint dark:bg-[#1b3a2b] font-semibold'
                    : 'text-ink-soft dark:text-[rgba(255,255,255,0.65)] hover:text-ink dark:hover:text-white hover:bg-mint dark:hover:bg-[#1b3a2b]'
                )}>
                <link.icon className={cn('w-[18px] h-[18px] stroke-[1.8] shrink-0', pathname === link.href && 'stroke-gold dark:stroke-gold')} />
                {link.label}
                {link.count && (
                  <span className="text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded-full bg-gold text-[#2d2107]">{link.count}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 mt-6">
        <button onClick={() => { localStorage.clear(); window.location.href = '/login' }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-ink-soft dark:text-[rgba(255,255,255,0.65)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-[rgba(230,48,75,0.15)] dark:hover:text-[#ff5a6e] transition-all">
          <LogOut className="w-[18px] h-[18px] stroke-[1.8] shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export function Navbar({ role }: { role?: string }) {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dico-theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('dico-theme', isDark ? 'dark' : 'light')
    setDark(isDark)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-mint dark:bg-[#18201B] border-b border-mint-line dark:border-[#2A3A30] flex items-center justify-between px-4 md:px-6 transition-colors">
      {/* Left: Logo only */}
      <Link href="/" className="flex items-center shrink-0">
        <Image src="/logo.png" alt="DICO" width={40} height={40} className="shrink-0" />
        <span className="font-serif text-xl font-black tracking-tight -ml-2">
          <span className="text-gold">I</span>
          <span className="text-forest dark:text-[#EEF2EF]">CO</span>
        </span>
      </Link>

      {/* Right: Controls + Hamburger (extreme right) */}
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme}
          className="h-8 w-8 rounded-lg bg-black/5 dark:bg-[#1C241F] hover:bg-black/10 dark:hover:bg-[#2A3A30] flex items-center justify-center transition-all">
          {dark ? <Sun className="h-4 w-4 text-[#EEF2EF]" /> : <Moon className="h-4 w-4 text-ink" />}
        </button>

        <span className="text-xs font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded hidden sm:inline">
          ₡ 1,240
        </span>

        <button className="text-muted dark:text-[#C0D0C6] hover:text-ink dark:hover:text-[#EEF2EF] hover:bg-black/5 dark:hover:bg-[#1C241F] h-8 w-8 rounded-lg flex items-center justify-center transition-all">
          <Bell className="h-4 w-4" />
        </button>

        <button onClick={() => { localStorage.clear(); window.location.href = '/login' }}
          className="text-xs text-muted dark:text-[#C0D0C6] hover:text-ink dark:hover:text-[#EEF2EF] bg-black/5 dark:bg-[#1C241F] hover:bg-black/10 dark:hover:bg-[#2A3A30] px-2.5 py-1.5 rounded-lg transition-all hidden sm:inline">
          Sign out
        </button>
        {/* Hamburger — extreme right, toggles sidebar on mobile */}
       <button onClick={() => {
          const sidebar = document.getElementById('sidebar')
          const overlay = document.getElementById('sidebarOverlay')
          if (sidebar) {
            sidebar.classList.toggle('-translate-x-full')
            sidebar.classList.toggle('translate-x-0')
          }
          if (overlay) overlay.classList.toggle('hidden')
        }}
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg bg-gold/10 hover:bg-gold/20 dark:bg-[#1C241F] dark:hover:bg-[#2A3A30] transition-all">
          <Menu className="h-4 w-4 text-ink dark:text-[#EEF2EF]" />
        </button>


      </div>
    </nav>
  )
}
