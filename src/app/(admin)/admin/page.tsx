import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
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
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">Platform Overview</h1>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">Total Users</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-forest dark:text-forest-700">{(totalUsers || 0).toLocaleString()}</p>
            <p className="text-xs text-muted dark:text-[#c0d0c4] mt-1">{(activeUsers || 0).toLocaleString()} active (30d)</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">Candidates</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-forest dark:text-forest-700">{(totalCandidates || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gold/5 to-gold/10 border-gold/20 dark:bg-[#11241b] dark:border-gold/30">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">CIVICT in Circulation</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-gold">{(civictTotal || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mb-2">Reward Pool</p>
            <p className="font-serif text-2xl md:text-3xl font-black text-forest dark:text-forest-700">
              ₦{((parseInt(settings.reward_pool_balance || '0')) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardHeader><CardTitle className="text-base text-ink dark:text-white">⚡ Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Link href="/admin/users"><Button variant="outline" className="w-full sm:w-auto dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">Manage Users</Button></Link>
            <Link href="/admin/candidates"><Button variant="outline" className="w-full sm:w-auto dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">Verify Candidates</Button></Link>
            <Link href="/admin/ads"><Button variant="outline" className="w-full sm:w-auto dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">Ad Approvals</Button></Link>
            <Link href="/admin/market"><Button variant="outline" className="w-full sm:w-auto dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">Trade Matching</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}