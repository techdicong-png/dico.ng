'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (res.ok) {
        toast.success('If an account exists, a reset code has been sent.')
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      } else {
        throw new Error('Failed to send code')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand dark:bg-[#0f1d16] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-2xl p-10 shadow-lg">
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white mb-2">Forgot Password</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4] mb-6">Enter your email and we'll send you a 6-digit code to reset your password.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
            className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
            placeholder="Enter your email" 
          />
          <Button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-mid h-11">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Send Reset Code
          </Button>
        </form>

        <p className="text-center text-sm text-muted dark:text-[#c0d0c4] mt-4">
          <Link href="/login" className="text-gold font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand dark:bg-[#0f1d16] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest"></div></div>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}