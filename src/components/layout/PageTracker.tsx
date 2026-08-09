'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // We don't want to track API routes or Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return

    const token = localStorage.getItem('dico_token')
    const isAuthed = !!token

    // Fire and forget (no need to await)
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
      body: JSON.stringify({ path: pathname, is_authed: isAuthed })
    }).catch(console.error)
  }, [pathname])

  return null // This component renders nothing on the screen
}