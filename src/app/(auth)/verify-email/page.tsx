'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!localStorage.getItem('dico_token')) router.push('/login')
    sendOtp()
  }, [router])

  async function sendOtp() {
    const token = localStorage.getItem('dico_token')
    await fetch('/api/otp/send-verification', {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    })
  }

  function handleChange(idx: number, val: string) {
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
    const newOtp = [...otp]
    newOtp[idx] = val.replace(/\D/g, '').slice(0, 1)
    setOtp(newOtp)
    if (newOtp.every(d => d)) submitOtp(newOtp.join(''))
  }

  async function submitOtp(code: string) {
    setLoading(true)
    const token = localStorage.getItem('dico_token')
    const res = await fetch('/api/otp/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ otp: code }),
    })
    const data = await res.json()
    if (res.ok) {
      const u = JSON.parse(localStorage.getItem('dico_user') || '{}')
      localStorage.setItem('dico_user', JSON.stringify({ ...u, email_verified: true }))
      const map: Record<string, string> = { voter: '/dashboard/voter', candidate: '/dashboard/candidate', campaign_team: '/dashboard/campaign', admin: '/dashboard/admin' }
      setTimeout(() => router.push(map[u.role] || '/dashboard'), 1000)
      setMsg(`✅ Verified! +${data.civict_earned} CIVICT`)
    } else {
      setMsg('❌ ' + (data.error || 'Invalid code'))
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h1 className="font-serif text-xl font-black text-ink mb-2">Verify your email</h1>
        <p className="text-sm text-muted-text mb-6">Enter the 6-digit code sent to your email</p>

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((d, i) => (
            <input key={i} ref={el => { inputs.current[i] = el }}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-lg focus:border-forest outline-none"
              maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && inputs.current[i - 1]?.focus()} />
          ))}
        </div>

        <Button onClick={() => submitOtp(otp.join(''))} disabled={loading || otp.some(d => !d)} className="w-full bg-forest hover:bg-forest-mid">
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>

        {msg && <p className="text-sm mt-4">{msg}</p>}

        <p className="text-xs text-muted-text mt-6">
          <button onClick={sendOtp} className="text-forest font-semibold">Resend code</button>
          {' · '}
          <button onClick={() => {
            const u = JSON.parse(localStorage.getItem('dico_user') || '{}')
            const map: Record<string, string> = { voter: '/dashboard/voter', candidate: '/dashboard/candidate' }
            window.location.href = map[u.role] || '/dashboard'
          }} className="text-xs text-muted-text underline cursor-pointer">
            Skip for now
          </button>


        </p>
      </CardContent>
    </Card>
  )
}
