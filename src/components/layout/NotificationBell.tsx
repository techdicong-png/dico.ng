'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

    async function fetchNotifications() {
    // No token needed in header, cookies are sent automatically
    try {
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications || [])
        setUnread(data.unread || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications')
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch('/api/notifications', { 
        method: 'PATCH',
      })
      if (res.ok) {
        setUnread(0)
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      }
    } catch {
      toast.error('Failed to mark as read.')
    }
  }


  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          setOpen(!open)
          if (!open && unread > 0) markAllAsRead()
        }} 
        className="relative text-muted dark:text-[#C0D0C6] hover:text-ink dark:hover:text-[#EEF2EF] hover:bg-black/5 dark:hover:bg-[#1C241F] h-8 w-8 rounded-lg flex items-center justify-center transition-all"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl shadow-lg overflow-hidden z-50 animate-slide-down">
          <div className="p-3 border-b border-border dark:border-[#1f3a2c] flex justify-between items-center">
            <h3 className="font-bold text-sm text-ink dark:text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} className="text-[10px] font-semibold text-forest hover:text-gold">
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto divide-y divide-border-light dark:divide-[#1f3a2c]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link 
                  href={n.link || '#'} 
                  key={n.id} 
                  onClick={() => setOpen(false)}
                  className={`block p-3 hover:bg-sand dark:hover:bg-[#1b3a2b] transition-colors ${!n.is_read ? 'bg-gold/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />}
                    <div className={n.is_read ? 'pl-4' : ''}>
                      <p className="text-sm font-semibold text-ink dark:text-white">{n.title}</p>
                      {n.body && <p className="text-xs text-muted dark:text-[#c0d0c4] mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-muted mt-1">
                        {new Date(n.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}