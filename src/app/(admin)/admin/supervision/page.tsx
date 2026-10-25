import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { SupervisionBoard } from '@/components/dashboard/SupervisionBoard'

export default async function AdminSupervisionPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">Admin Panel</span>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">Supervision</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">Every distributor, stock movement, sale and payment across Nigeria.</p>
      </div>
      <SupervisionBoard />
    </div>
  )
}
