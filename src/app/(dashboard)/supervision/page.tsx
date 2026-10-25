import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { getSupervisionScope } from '@/lib/supervision'
import { SupervisionBoard } from '@/components/dashboard/SupervisionBoard'

export default async function SupervisionPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  const scope = await getSupervisionScope(payload.userId, payload.role)
  if (!scope) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white mb-2">Supervision</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">This page is for DICO directors and distributors.</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">Supervision</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">Track the transactions and stock of the distributors below you.</p>
      </div>
      <SupervisionBoard />
    </div>
  )
}
