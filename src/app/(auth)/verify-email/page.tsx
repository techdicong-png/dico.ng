'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  
  // Timer state
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Email verified! Please log in.')
        router.push('/login')
      } else {
        throw new Error(data.error || 'Verification failed')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('A new code has been sent to your email.')
        setTimer(60) // Reset timer
        setCanResend(false)
      } else {
        throw new Error(data.error || 'Failed to resend code')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-10 shadow-lg">
        <h1 className="font-serif text-2xl font-black text-ink mb-2">Verify Your Email</h1>
        <p className="text-sm text-muted mb-6">Enter the 6-digit code we sent to <strong>{email}</strong></p>
        
        <form onSubmit={handleVerify} className="space-y-4">
          <Input 
            value={otp} 
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] font-bold h-14"
            placeholder="000000" 
          />
          <Button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-forest hover:bg-forest-mid h-11">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Verify Email
          </Button>
        </form>
        
        {/* Resend Timer Section */}
        <div className="text-center mt-6">
          {canResend ? (
            <button 
              onClick={handleResend} 
              disabled={resending}
              className="text-sm font-semibold text-gold hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          ) : (
            <p className="text-xs text-muted">
              Resend code in {timer}s
            </p>
          )}
        </div>

        <p className="text-center text-sm text-muted mt-4">
          <Link href="/login" className="text-gold font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest"></div></div>}>
      <VerifyForm />
    </Suspense>
  )
}