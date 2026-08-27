// src/app/(dashboard)/reports/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ReportClient } from '@/components/dashboard/ReportClient'

const catColors: Record<string, string> = {
  roads: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  water: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  electricity: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  schools: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  health: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  security: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  other: 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300',
}

const statusColors: Record<string, string> = {
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

export default async function ReportsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  
  const user = await getAuthUser(payload.userId)

  const { data: reports } = await supabaseAdmin.from('reports')
    .select('*, users(full_name, ward)')
    .order('created_at', { ascending: false }).limit(20)

  return (
    <ReportClient 
      initialReports={reports || []} 
      catColors={catColors} 
      statusColors={statusColors}
      user={user}
    />
  )
}