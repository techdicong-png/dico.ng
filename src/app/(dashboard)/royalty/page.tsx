import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { MyRoyalty } from '@/components/dashboard/MyRoyalty'

export default async function RoyaltyPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">My Loyalty Royalty</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">What you have earned from transactions in your area.</p>
      </div>
      <MyRoyalty />
    </div>
  )
}
