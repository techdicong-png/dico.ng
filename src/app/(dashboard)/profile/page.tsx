// src/app/(dashboard)/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', state: '', lga: '', ward: '', bio: '' })

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setUser(d.user)
        setForm({ full_name: d.user.full_name || '', phone: d.user.phone || '', state: d.user.state || '', lga: d.user.lga || '', ward: d.user.ward || '', bio: d.user.bio || '' })
      })
  }, [router])

  async function save() {
    setLoading(true); setMsg('')
    const token = localStorage.getItem('dico_token')
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Failed'); return }
      localStorage.setItem('dico_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('dico_user') || '{}'), ...data.user }))
      setMsg('✓ Profile updated')
    } catch { setMsg('Network error') }
    finally { setLoading(false) }
  }

  if (!user) return (
    <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
      <p className="text-sm text-muted dark:text-[#c0d0c4]">Loading...</p>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          My Account
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Profile</h1>
      </div>

      {/* Profile Header */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="pt-5 px-5 pb-5 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-forest text-white font-serif text-2xl font-black flex items-center justify-center shrink-0">
            {(user.full_name || 'U')[0]}
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-ink dark:text-white">{user.full_name}</h2>
            <p className="text-sm text-muted dark:text-[#c0d0c4]">{user.email} · {user.role}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-light dark:bg-[#1b3a2b] text-forest-800 dark:text-[#d4ebdf]">{user.state || 'No state'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-faint dark:bg-[#1b3a2b] text-muted dark:text-[#c0d0c4]">{user.lga || 'No LGA'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="text-base font-bold text-ink dark:text-white">Edit Profile</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white">Full Name</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white">State</label>
              <input value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white">LGA</label>
              <input value={form.lga} onChange={e => setForm({...form, lga: e.target.value})}
                className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-white">Ward</label>
            <input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})}
              className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-white">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3}
              className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1 resize-y" />
          </div>
          <button onClick={save} disabled={loading}
            className="bg-forest hover:bg-forest-mid text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          {msg && (
            <p className={`text-sm ${msg.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
