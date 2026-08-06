import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { TradeMatchingTable } from '@/components/admin/TradeMatchingTable'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function AdminMarketPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/login')

  const { data: listings } = await supabaseServer
    .from('civict_market_listings')
    .select('*, users(full_name, email)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">CIVICT Trade Matching</h1>
        <p className="text-sm text-muted">Match buyer and seller orders to execute CIVICT trades.</p>
      </div>
      <TradeMatchingTable initialListings={listings || []} />
    </div>
  )
}