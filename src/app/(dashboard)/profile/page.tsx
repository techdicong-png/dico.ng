// src/app/(dashboard)/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

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

  if (!user) return <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          My Account
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Profile</h1>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-forest text-white font-serif text-2xl font-black flex items-center justify-center">
            {(user.full_name || 'U')[0]}
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">{user.full_name}</h2>
            <p className="text-sm text-muted-text">{user.email} · {user.role}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{user.state || 'No state'}</Badge>
              <Badge variant="outline">{user.lga || 'No LGA'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Edit Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Full Name</label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold">Phone</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">State</label>
              <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold">LGA</label>
              <Input value={form.lga} onChange={e => setForm({...form, lga: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Ward</label>
            <Input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-semibold">Bio</label>
            <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} />
          </div>
          <Button onClick={save} disabled={loading} className="bg-forest hover:bg-forest-mid">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          {msg && <p className={`text-sm ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
