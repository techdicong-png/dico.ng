'use client'

import Link from 'next/link'
import { Bell, Menu, Moon, Sun } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function Navbar() {
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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-mint dark:bg-[#18201B] border-b border-mint-line dark:border-[#2A3A30] flex items-center justify-between px-4 md:px-6 transition-colors">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="DICO" width={40} height={40} className="shrink-0" />
          <span className="font-serif text-xl font-black tracking-tight -ml-2">
            <span className="text-gold">I</span>
            <span className="text-forest dark:text-[#EEF2EF]">CO</span>
          </span>
        </Link>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* 🌗 Theme Toggle */}
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

          {/* Hamburger */}
          <button id="mobileMenuBtn" onClick={() => {
            const sidebar = document.querySelector('aside')
            const overlay = document.getElementById('mobileOverlay')
            sidebar?.classList.toggle('hidden')
            sidebar?.classList.toggle('fixed')
            sidebar?.classList.toggle('inset-0')
            sidebar?.classList.toggle('z-50')
            sidebar?.classList.toggle('block')
            overlay?.classList.toggle('hidden')
          }}
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg bg-gold/10 hover:bg-gold/20 dark:bg-[#1C241F] dark:hover:bg-[#2A3A30] transition-all ml-1">
            <Menu className="h-4 w-4 text-ink dark:text-[#EEF2EF]" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div id="mobileOverlay" className="hidden lg:hidden fixed inset-0 bg-black/30 z-30"
        onClick={() => {
          document.querySelector('aside')?.classList.add('hidden')
          document.getElementById('mobileOverlay')?.classList.add('hidden')
        }} />
    </>
  )
}
