'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Password reset successfully! Please log in.')
        router.push('/login')
      } else {
        throw new Error(data.error || 'Reset failed')
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
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white mb-2">Reset Password</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4] mb-6">Enter the 6-digit code sent to <strong className="text-ink dark:text-white">{email}</strong> and your new password.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            value={otp} 
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] font-bold h-14 bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
            placeholder="000000" 
          />
          <div>
            <label className="text-xs font-semibold text-ink dark:text-white mb-1.5 block">New Password</label>
            <Input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required
              minLength={6}
              className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
              placeholder="Min. 6 characters" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink dark:text-white mb-1.5 block">Confirm Password</label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required
              minLength={6}
              className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
              placeholder="Confirm new password" 
            />
          </div>
          <Button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-forest hover:bg-forest-mid h-11">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-muted dark:text-[#c0d0c4] mt-4">
          <Link href="/login" className="text-gold font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand dark:bg-[#0f1d16] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}