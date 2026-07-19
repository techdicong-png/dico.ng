// src/app/(auth)/login/page.tsx
'use client'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()



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
      if (!res.ok) { setError(data.error); return }

      localStorage.setItem('dico_token', data.token)
      localStorage.setItem('dico_user', JSON.stringify(data.user))

      const map: Record<string, string> = {
        voter: '/dashboard/voter',
        candidate: '/dashboard/candidate',
        campaign_team: '/dashboard/candidate',
        admin: '/dashboard/admin',
      }
      router.push(map[data.user.role] || '/dashboard')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl text-[#0A3D2B]">
            <span className="text-[#E8C040]">DI</span>CO
          </Link>
          <p className="text-sm text-[#5A6E62] mt-1">Welcome back</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>
        )}

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#D8E4DC]" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-[#5A6E62]">or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#0D1B12]">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#0D1B12]">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-[#0A3D2B] hover:bg-[#0F5438]" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm text-[#5A6E62] mt-6 space-y-2">
          <p>Don&apos;t have an account? <Link href="/register" className="text-[#0A3D2B] font-semibold">Create one</Link></p>
          <Link href="/forgot-password" className="text-[#0A3D2B] font-semibold block">Forgot password?</Link>
        </div>
      </CardContent>
    </Card>
  )
}
