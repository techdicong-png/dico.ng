import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js' // Inline client
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  if (payload.role !== 'admin') redirect('/login')

  const { data: civictTotal } = await supabaseServer.rpc('total_civict_supply')
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const isoString = thirtyDaysAgo.toISOString()
  
  const { count: activeUsers } = await supabaseServer.from('users').select('id', { count: 'exact', head: true }).gte('last_seen', isoString)
  const { count: totalUsers } = await supabaseServer.from('users').select('id', { count: 'exact', head: true })
  const { count: totalCandidates } = await supabaseServer.from('candidates').select('id', { count: 'exact', head: true }).eq('is_active', true)

  const { data: finance } = await supabaseServer.from('platform_settings').select('key, value')
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

      {/* Responsive Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Total Users</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-forest">{(totalUsers || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-text mt-1">{(activeUsers || 0).toLocaleString()} active (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Candidates</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-forest">{(totalCandidates || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gold/5 to-gold/10 border-gold/20">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">CIVICT in Circulation</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-gold">{(civictTotal || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text mb-2">Reward Pool</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-forest">
              ₦{((parseInt(settings.reward_pool_balance || '0')) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">⚡ Quick Actions</CardTitle></CardHeader>
        <CardContent>
          {/* Fixed links to point to actual pages, made responsive */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/admin/users"><Button variant="outline" className="w-full sm:w-auto">Manage Users</Button></Link>
            <Link href="/admin/candidates"><Button variant="outline" className="w-full sm:w-auto">Verify Candidates</Button></Link>
            <Link href="/admin/ads"><Button variant="outline" className="w-full sm:w-auto">Ad Approvals</Button></Link>
            <Link href="/admin/market"><Button variant="outline" className="w-full sm:w-auto">Trade Matching</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}