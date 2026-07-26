'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import Image from 'next/image'

export function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-mint border-b border-mint-line flex items-center justify-between px-4 md:px-6">
        {/* Left: Hamburger + Brand */}
        <div className="flex items-center gap-3">
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
          className="lg:hidden flex flex-col gap-1 p-1.5 bg-gold/10 hover:bg-gold/20 rounded-lg transition-all">
            <span className="block w-5 h-[2px] bg-ink/70 rounded" />
            <span className="block w-5 h-[2px] bg-ink/70 rounded" />
            <span className="block w-5 h-[2px] bg-ink/70 rounded" />
          </button>

          <Link href="/" className="font-serif text-lg font-black tracking-tight flex items-center gap-0">
          <Image src="/logo.png" alt='logo' width={50} height={50} className='shrink-0'/>
           <div className="-ml-2">
             <span className="text-gold">I</span>
            <span className="text-forest">CO</span>
           </div>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded hidden sm:inline">
            ₡ 1,240
          </span>
          <button className="text-muted hover:text-ink hover:bg-black/5 h-8 w-8 rounded-lg flex items-center justify-center transition-all">
            <Bell className="h-4 w-4" />
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="text-xs text-muted hover:text-ink bg-black/5 hover:bg-black/10 px-2.5 py-1.5 rounded-lg transition-all">
            Sign out
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
