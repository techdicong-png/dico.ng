import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/dashboard')

  const { data: civictTotal } = await supabaseAdmin.rpc('total_civict_supply')
  const { count: totalUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
  const { count: totalCandidates } = await supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('is_active', true)
  const { count: totalSessions } = await supabaseAdmin.from('live_sessions').select('*', { count: 'exact', head: true })
  const { count: totalReports } = await supabaseAdmin.from('reports').select('*', { count: 'exact', head: true })
  const { count: totalPolls } = await supabaseAdmin.from('polls').select('*', { count: 'exact', head: true })
  const thirtyDays = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: activeUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('last_seen', thirtyDays)

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Platform Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
           <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Total Users</p>
            <p className="font-serif text-3xl font-black text-forest">{(totalUsers || 0).toLocaleString()}</p>
            <p className="text-xs text-muted mt-1">{(activeUsers || 0).toLocaleString()} active (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Candidates</p>
            <p className="font-serif text-3xl font-black text-forest">{(totalCandidates || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gold/5 border-gold/20">
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">CIVICT Supply</p>
            <p className="font-serif text-3xl font-black text-gold">{(civictTotal || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Sessions</p>
            <p className="font-serif text-3xl font-black text-forest">{(totalSessions || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Reports</p>
            <p className="font-serif text-3xl font-black text-forest">{(totalReports || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold tracking-widest uppercase text-[#3D5246] mb-2">Polls</p>
            <p className="font-serif text-3xl font-black text-forest">{(totalPolls || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base text-ink">⚡ Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Link href="/admin/users"><Button variant="outline">Manage Users</Button></Link>
            <Button variant="outline">View Reports</Button>
            <Button variant="outline">Grant CIVICT</Button>
            <Link href="/sessions"><Button variant="outline">Sessions</Button></Link>
            <Link href="/candidates"><Button variant="outline">Candidates</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
