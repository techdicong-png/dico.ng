'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        // 🔴 NEW: Check if API told us to redirect to verify page
        if (data.redirect) {
          router.push(data.redirect)
          return
        }
        setError(data.error); 
        return
      }

      localStorage.setItem('dico_token', data.token)
      localStorage.setItem('dico_user', JSON.stringify(data.user))

      const map: Record<string, string> = {
        voter: '/dashboard/voter',
        candidate: '/dashboard/candidate',
        campaign_team: '/dashboard/candidate',
        admin: '/admin',
      }
      router.push(map[data.user.role])
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-10 shadow-lg relative overflow-hidden">
        <div className="absolute w-44 h-44 rounded-full border border-gold/10 -top-10 -right-10 pointer-events-none" />
        <div className="absolute w-28 h-28 rounded-full border border-gold/10 -bottom-6 -left-6 pointer-events-none" />

        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl font-black text-forest">
            <span className="text-gold">DI</span>CO
          </Link>
          <p className="text-sm text-muted mt-1">Welcome back — sign in to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3.5 py-3 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 transition-all placeholder:text-[#9DAFA5]"
              placeholder="Enter your email" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-3.5 py-3 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 transition-all placeholder:text-[#9DAFA5]"
                placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors text-sm">
                <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted cursor-pointer">
              <input type="checkbox" className="accent-forest" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-forest-mid font-semibold hover:text-forest transition-colors">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-forest text-white font-semibold text-sm py-3 rounded-lg hover:bg-forest-mid transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? (
              <>Signing in…</>
            ) : (
              <><i className="fa-solid fa-arrow-right-to-bracket" /> Sign In</>
            )}
          </button>
        </form>

        <div className="flex items-center text-center text-xs text-muted my-6">
          <span className="flex-1 border-t border-border" />
          <span className="px-3">OR CONTINUE WITH</span>
          <span className="flex-1 border-t border-border" />
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-2.5 border border-border rounded-lg bg-white hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          </button>
          <button className="flex-1 py-2.5 border border-border rounded-lg bg-white hover:bg-[#1877F2]/5 hover:border-[#1877F2]/30 transition-all text-sm flex items-center justify-center gap-2">
            <i className="fa-brands fa-facebook-f text-[#1877F2]" />
          </button>
          <button className="flex-1 py-2.5 border border-border rounded-lg bg-white hover:bg-black/5 hover:border-black/20 transition-all text-sm flex items-center justify-center gap-2">
            <i className="fa-brands fa-x-twitter text-black" />
          </button>
        </div>

        <p className="text-center text-sm text-muted mt-7">
          Don&apos;t have an account? <Link href="/register" className="text-gold font-semibold">Create one</Link>
        </p>
      </div>
    </div>
  )
}
