// src/app/(dashboard)/notifications/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ICONS: Record<string, { emoji: string; bg: string }> = {
  civict_earned: { emoji: '🪙', bg: 'bg-gold/10' },
  question_answered: { emoji: '✅', bg: 'bg-green-50' },
  report_updated: { emoji: '📋', bg: 'bg-red-50' },
  session_starting: { emoji: '📡', bg: 'bg-blue-50' },
  system: { emoji: 'ℹ️', bg: 'bg-gray-50' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    load()
  }, [router])

  async function load() {
    const token = localStorage.getItem('dico_token')
    const data = await (await fetch('/api/notifications?limit=50', { headers: { 'Authorization': `Bearer ${token}` } })).json()
    setNotifs(data.notifications || [])
    setUnread(data.unread || 0)
  }

  async function markRead(id: string) {
    const token = localStorage.getItem('dico_token')
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } })
    setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(Math.max(0, unread - 1))
  }

  async function markAllRead() {
    const token = localStorage.getItem('dico_token')
    await fetch('/api/notifications/read-all', { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } })
    setNotifs(notifs.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  async function deleteNotif(id: string) {
    const token = localStorage.getItem('dico_token')
    await fetch(`/api/notifications/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    setNotifs(notifs.filter(n => n.id !== id))
  }

  const filtered = filter === 'unread' ? notifs.filter(n => !n.is_read)
    : filter === 'all' ? notifs
    : notifs.filter(n => n.type === filter)

  const filters = ['all', 'civict_earned', 'session_starting', 'question_answered', 'report_updated', 'system', 'unread']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
            Notifications
          </span>
          <h1 className="font-serif text-2xl font-black text-ink">
            Notifications
            {unread > 0 && <Badge className="ml-2 bg-forest">{unread}</Badge>}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === f ? 'bg-forest text-white border-forest' : 'bg-white text-muted-text border-border hover:border-forest'
            }`}>
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-text text-center py-12">All caught up!</p>
          ) : (
            filtered.map(n => {
              const icon = ICONS[n.type] || { emoji: '🔔', bg: 'bg-gray-50' }
              return (
                <div key={n.id}
                  className={`flex items-start gap-3 p-4 border-b border-border-light last:border-0 cursor-pointer transition-colors ${
                    !n.is_read ? 'bg-forest-faint border-l-4 border-l-forest' : 'hover:bg-forest-faint'
                  }`}
                  onClick={() => { if (!n.is_read) markRead(n.id) }}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${icon.bg}`}>
                    {icon.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-text mt-0.5">{n.body}</p>}
                    <p className="text-[11px] text-muted-text mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                    className="text-muted-text hover:text-red-600 text-sm shrink-0">✕</button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
