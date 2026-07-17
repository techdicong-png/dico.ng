// src/app/(dashboard)/dashboard/admin/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  if (payload.role !== 'admin') redirect('/dashboard')

  const [stats, health] = await Promise.all([
    supabaseAdmin.rpc('total_civict_supply'),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
  ])

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const isoString = thirtyDaysAgo.toISOString()
    const { count: activeUsers } = await supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).gte('last_seen', isoString)
  const { count: totalUsers } = await supabaseAdmin.from('users').select('id', { count: 'exact', head: true })
  const { count: totalCandidates } = await supabaseAdmin.from('candidates').select('id', { count: 'exact', head: true }).eq('is_active', true)

  const { data: finance } = await supabaseAdmin.from('platform_settings').select('key, value')
  const settings: Record<string, string> = {}
  ;(finance || []).forEach(s => { settings[s.key] = s.value })

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Platform Overview</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Total Users</p>
            <p className="font-serif text-3xl font-black text-forest">{(totalUsers || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-text mt-1">{(activeUsers || 0).toLocaleString()} active (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Candidates</p>
            <p className="font-serif text-3xl font-black text-forest">{(totalCandidates || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gold/5 to-gold/10 border-gold/20">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">CIVICT in Circulation</p>
            <p className="font-serif text-3xl font-black text-gold">{(stats.data || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Reward Pool</p>
            <p className="font-serif text-3xl font-black text-forest">
              ₦{((parseInt(settings.reward_pool_balance || '0')) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">⚡ Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Link href="/api/admin/manage-users"><Button variant="outline">Manage Users</Button></Link>
            <Link href="/api/admin/reports"><Button variant="outline">View Reports</Button></Link>
            <Link href="/api/admin/civict/grant"><Button variant="outline">Grant CIVICT</Button></Link>
            <Link href="/sessions"><Button variant="outline">Sessions</Button></Link>
            <Link href="/candidates"><Button variant="outline">Candidates</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
