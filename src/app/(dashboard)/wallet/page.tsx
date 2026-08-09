import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { WalletClient } from '@/components/dashboard/WalletClient'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function WalletPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  // Fetch Balance and Transactions directly on the server!
  const [userRes, txRes] = await Promise.all([
    supabaseServer.from('users').select('civict_balance').eq('id', payload.userId).single(),
    supabaseServer.from('civict_transactions').select('*').eq('user_id', payload.userId).order('created_at', { ascending: false })
  ])

  return <WalletClient initialBalance={userRes.data?.civict_balance || 0} initialHistory={txRes.data || []} />
}