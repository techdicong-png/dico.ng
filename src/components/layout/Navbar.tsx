'use client'
import { NotificationBell } from '@/components/layout/NotificationBell'
import Link from 'next/link'
import { Bell, Menu, Moon, Sun, LogOut } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function Navbar({ user }: { user: any }) {
  const [dark, setDark] = useState(false)

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

  const civictBalance = user?.civict_balance?.toLocaleString() || '0'

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

        {/* Dynamic CIVICT Balance */}
        <span className="text-xs font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded hidden sm:inline">
          ₡ {civictBalance}
        </span>

        <NotificationBell />

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