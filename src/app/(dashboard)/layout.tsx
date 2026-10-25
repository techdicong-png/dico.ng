import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { getMyDistributor, getMyLeader } from '@/lib/voucher-auth'
import { getSupervisionScope } from '@/lib/supervision'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')
  const isDistributor = !!(await getMyDistributor(user.id))
  const hasRoyalty = isDistributor || !!(await getMyLeader(user.id))
  const scope = await getSupervisionScope(user.id, user.role)
  const hasSupervision = !!scope && scope.kind !== 'ward'   // ward distributors only see themselves

  return (
    <>
      <Navbar user={user} />
      <div className="flex pt-14 min-h-screen bg-background">
        {/* We pass the entire user object here */}
        <Sidebar role={user.role} user={user} isDistributor={isDistributor} hasRoyalty={hasRoyalty} hasSupervision={hasSupervision} />
        <main className="flex-1 lg:ml-60 p-4 md:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  )
}