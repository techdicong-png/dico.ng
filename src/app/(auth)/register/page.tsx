// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara']

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState('voter')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', state: '', lga: '', ward: '', vin: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (role === 'voter' && !form.vin.trim()) {
      setError('VIN is required for voter registration')
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
      if (!res.ok) { setError(data.error); return }

      localStorage.setItem('dico_token', data.token)
      localStorage.setItem('dico_user', JSON.stringify(data.user))
      router.push('/verify-email')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { key: 'voter', icon: '🗳️', label: 'Voter' },
    { key: 'candidate', icon: '🎙️', label: 'Candidate' },
  ]

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Link href="/" className="font-serif text-2xl text-[#0A3D2B]">
            <span className="text-[#E8C040]">DI</span>CO
          </Link>
          <p className="text-sm text-[#5A6E62] mt-1">Create your account — voters start with 100 CIVICT</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
        )}

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {roles.map(r => (
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
            <span>🪙</span> <strong>100 CIVICT</strong> welcome bonus + verify your PVC to participate
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Full Name *</label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Password *</label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Phone</label>
              <Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">State</label>
              <select value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                className="w-full h-10 px-3 rounded-md border border-[#D8E4DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D2B]">
                <option value="">Select state</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">LGA</label>
              <Input value={form.lga} onChange={e => setForm({...form, lga: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#0D1B12]">Ward</label>
              <Input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} />
            </div>

            {/* VIN — required for voters, hidden for candidates */}
            {role === 'voter' && (
              <div>
                <label className="text-sm font-semibold text-[#0D1B12]">Voter ID (VIN) *</label>
                <Input value={form.vin} onChange={e => setForm({...form, vin: e.target.value})} required placeholder="19-digit number on your PVC" maxLength={19} />
                <p className="text-xs text-[#5A6E62] mt-1">Your Voter Identification Number from your PVC</p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-[#0A3D2B] hover:bg-[#0F5438]" disabled={loading}>
            {loading ? 'Creating account…' : role === 'voter' ? 'Create Voter Account' : 'Create Candidate Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#5A6E62] mt-6">
          Already have an account? <Link href="/login" className="text-[#0A3D2B] font-semibold">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
