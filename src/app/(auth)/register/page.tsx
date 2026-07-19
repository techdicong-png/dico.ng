// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LocationPicker } from '@/components/ui/LocationPicker'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [role, setRole] = useState('voter')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', state: '', lga: '', ward: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || data.errors?.[0]?.message || 'Registration failed'); return }

      localStorage.setItem('dico_token', data.token)
      localStorage.setItem('dico_user', JSON.stringify(data.user))
      router.push('/verify-email')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Link href="/" className="font-serif text-2xl text-[#0A3D2B]">
            <span className="text-[#E8C040]">DI</span>CO
          </Link>
          <p className="text-sm text-[#3D5246] mt-1">Create your account</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>}

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { key: 'voter', icon: '🗳️', label: 'Voter' },
            { key: 'candidate', icon: '🎙️', label: 'Candidate' },
          ].map(r => (
            <button key={r.key} onClick={() => setRole(r.key)}
              className={`p-3 rounded-lg text-center text-sm font-semibold border transition-colors ${
                role === r.key
                  ? 'bg-[#E8F3EE] border-[#0A3D2B] text-[#0A3D2B]'
                  : 'bg-white border-[#D8E4DC] text-[#5A6E62] hover:border-[#0A3D2B]'
              }`}>
              <span className="text-xl block mb-1">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        {role === 'voter' && (
          <div className="bg-[#C8960A]/10 border border-[#C8960A]/20 rounded-lg p-3 text-sm mb-4 flex items-center gap-2">
            <span>🪙</span> <strong>100 CIVICT</strong> welcome bonus when you join as a voter
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Full Name *</label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required placeholder="Your full name" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@example.com" />
            </div>
          </div>

          {/* Cascading location dropdowns */}
          <LocationPicker 
            onLocationChange={(state, lga, ward) => {
              setForm(prev => ({ ...prev, state, lga, ward }))
            }} 
          />

            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Password *</label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} placeholder="Min 6 characters" />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Confirm Password *</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat your password" />
            </div>

          <Button type="submit" className="w-full bg-[#0A3D2B] hover:bg-[#0F5438]" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#3D5246] mt-6">
          Already have an account? <Link href="/login" className="text-[#0A3D2B] font-semibold">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
