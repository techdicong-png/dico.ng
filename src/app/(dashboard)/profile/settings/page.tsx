// src/app/(dashboard)/profile/settings/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Account Settings
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Settings</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Current Password</label>
            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">New Password</label>
            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Confirm New Password</label>
            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </div>
          <Button onClick={changePassword} disabled={loading} className="bg-forest hover:bg-forest-mid">
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
          {msg && <p className={`text-sm ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-base text-red-600">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-text mb-4">Signing out clears your session.</p>
          <Button variant="destructive" onClick={() => { localStorage.clear(); window.location.href = '/login' }}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
