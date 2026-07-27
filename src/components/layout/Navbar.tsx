'use client'

import Link from 'next/link'
import { Bell, Menu, X } from 'lucide-react'
import Image from 'next/image';

export function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-mint border-b border-mint-line flex items-center justify-between px-4 md:px-6">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="DICO" width={40} height={40} className="shrink-0" />
          <span className="font-serif text-xl font-black tracking-tight -ml-2">
            <span className="text-gold">I</span>
            <span className="text-forest">CO</span>
          </span>
        </Link>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded hidden sm:inline">
            ₡ 1,240
          </span>
          <button className="text-muted hover:text-ink hover:bg-black/5 h-8 w-8 rounded-lg flex items-center justify-center transition-all">
            <Bell className="h-4 w-4" />
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="text-xs text-muted hover:text-ink bg-black/5 hover:bg-black/10 px-2.5 py-1.5 rounded-lg transition-all hidden sm:inline">
            Sign out
          </button>

          {/* Hamburger — on the right */}
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
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg bg-gold/10 hover:bg-gold/20 transition-all ml-1">
            <Menu className="h-4 w-4 text-ink/70" />
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
