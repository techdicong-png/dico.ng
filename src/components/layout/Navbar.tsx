'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

export function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A3D2B] border-b border-white/10 flex items-center justify-between px-4 md:px-6">
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
          className="lg:hidden flex flex-col gap-1 p-1.5">
            <span className="block w-5 h-[2px] bg-white/80 rounded" />
            <span className="block w-5 h-[2px] bg-white/80 rounded" />
            <span className="block w-5 h-[2px] bg-white/80 rounded" />
          </button>

          <Link href="/" className="font-serif text-lg text-white">
            <span className="text-[#E8C040]">DI</span>CO
            <span className="text-[10px] font-sans font-bold tracking-wider text-[#C8960A] border border-[#C8960A]/40 px-1.5 py-0.5 rounded ml-2 uppercase">
              Beta
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs font-bold text-[#E8C040] bg-[#C8960A]/15 border border-[#C8960A]/30 px-2.5 py-1 rounded hidden sm:inline">
            ₡ 1,240
          </span>
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded transition-colors">
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
