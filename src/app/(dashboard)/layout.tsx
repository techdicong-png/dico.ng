import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  return (
    <>
      <Navbar />
      <div className="flex pt-14 min-h-screen bg-[#F7F4EE]">
        <Sidebar role={user.role} />
        <main className="flex-1 lg:ml-60 p-4 md:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  )
}
