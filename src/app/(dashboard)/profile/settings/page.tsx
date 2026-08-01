// src/app/(dashboard)/profile/settings/page.tsx
'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function changePassword() {
    setMsg('')
    if (!currentPw || !newPw) { setMsg('All fields required.'); return }
    if (newPw.length < 6) { setMsg('Password min 6 characters.'); return }
    if (newPw !== confirmPw) { setMsg('Passwords do not match.'); return }

    setLoading(true)
    const token = localStorage.getItem('dico_token')
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Failed'); return }
      setMsg('✓ Password changed')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch { setMsg('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Account Settings
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Settings</h1>
      </div>

      {/* Change Password */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="text-base font-bold text-ink dark:text-white">Change Password</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-ink dark:text-white">Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-white">New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-white">Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 mt-1" />
          </div>
          <button onClick={changePassword} disabled={loading}
            className="bg-forest hover:bg-forest-mid text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          {msg && (
            <p className={`text-sm ${msg.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {msg}
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card dark:bg-[#11241b] border border-red-200 dark:border-red-800/30 rounded-xl">
        <div className="px-5 py-4 border-b border-red-200 dark:border-red-800/30">
          <h3 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-muted dark:text-[#c0d0c4] mb-4">Signing out clears your session.</p>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
