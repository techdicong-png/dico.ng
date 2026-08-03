'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LocationPicker } from '@/components/ui/LocationPicker'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    state: '', lga: '', ward: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // We hardcode the role to 'voter' here
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'voter' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      localStorage.setItem('dico_token', data.token)
      localStorage.setItem('dico_user', JSON.stringify(data.user))
      router.push('/dashboard/voter')
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-10 shadow-lg relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute w-44 h-44 rounded-full border border-gold/10 -top-10 -right-10 pointer-events-none" />
        <div className="absolute w-28 h-28 rounded-full border border-gold/10 -bottom-6 -left-6 pointer-events-none" />

        <div className="text-center mb-7 flex flex-col items-center">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo.png" alt="DICO" width={50} height={50} className="shrink-0" />
            <span className="font-serif text-xl font-black tracking-tight -ml-2">
              <span className="text-gold">I</span>
              <span className="text-forest">CO</span>
            </span>
          </Link>
          <p className="text-sm text-muted mt-1">Create your voter account</p>
        </div>

        {/* Voter bonus banner */}
        <div className="bg-gold/10 border border-gold/20 rounded-lg p-3 text-sm mb-5 flex items-center gap-2 text-ink">
          <i className="fa-solid fa-coins text-gold" />
          <span><strong>100 CIVICT</strong> welcome bonus for verified voters</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Full Name *</label>
            <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required
              className="w-full px-3.5 py-3 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 transition-all placeholder:text-[#9DAFA5]"
              placeholder="Enter your full name" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
              className="w-full px-3.5 py-3 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 transition-all placeholder:text-[#9DAFA5]"
              placeholder="Enter your email" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Password *</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6}
              className="w-full px-3.5 py-3 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 transition-all placeholder:text-[#9DAFA5]"
              placeholder="Min. 6 characters" />
          </div>

          <LocationPicker onLocationChange={(state, lga, ward) => setForm(prev => ({ ...prev, state, lga, ward }))} />

          <button type="submit" disabled={loading}
            className="w-full bg-forest text-white font-semibold text-sm py-3 rounded-lg hover:bg-forest-mid transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? (
              <>Creating account…</>
            ) : (
              <><i className="fa-solid fa-user-check" /> Create Voter Account</>
            )}
          </button>
        </form>

        {/* Candidate Redirect Link */}
        <div className="mt-6 pt-6 border-t border-border-light text-center">
          <p className="text-sm text-muted">
            Are you a politician? <Link href="/register/candidate" className="text-gold font-semibold hover:underline">Register as a Candidate →</Link>
          </p>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Already have an account? <Link href="/login" className="text-gold font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}