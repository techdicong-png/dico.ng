import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { getMyDistributor } from '@/lib/voucher-auth'
import { VoucherManager } from '@/components/dashboard/VoucherManager'

export default async function VouchersPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  const dist = await getMyDistributor(payload.userId)
  if (!dist) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white mb-2">Vouchers</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">
          This area is for DICO distributors. If you have been appointed, please contact DICO to have your account linked.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">{dist.level === 'sole' ? 'Voucher Generator' : 'My Vouchers'}</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">
          {dist.level === 'sole' ? `${dist.state} · State Sole Distributor` : dist.level === 'major' ? `${dist.lga}, ${dist.state} · LGA distributor` : `${dist.ward}, ${dist.lga}, ${dist.state} · Ward distributor`}
        </p>
      </div>
      <VoucherManager />
    </div>
  )
}
