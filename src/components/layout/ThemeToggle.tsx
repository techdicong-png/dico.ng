'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dico-theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('dico-theme', isDark ? 'dark' : 'light')
    setDark(isDark)
  }

  return (
    <button onClick={toggle}
      className="w-9 h-9 rounded-lg bg-black/5 dark:bg-card/10 hover:bg-black/10 dark:hover:bg-card/15 flex items-center justify-center transition-all"
      aria-label="Toggle theme">
      {dark ? <Sun className="h-4 w-4 text-ink" /> : <Moon className="h-4 w-4 text-ink" />}
    </button>
  )
}
