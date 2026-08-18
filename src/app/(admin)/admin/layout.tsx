import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/login')

  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  return (
    <>
      <Navbar user={user} />
      {/* 🔴 ADDED dark:bg-[#0f1d16] HERE */}
      <div className="flex pt-14 min-h-screen bg-sand dark:bg-[#0f1d16]">
        <AdminSidebar />
        <main className="flex-1 lg:ml-60 p-4 md:p-8 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </>
  )
}