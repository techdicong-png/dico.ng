import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { TransfersTable } from '@/components/admin/TransfersTable'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function AdminTransfersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/login')

  // Fetch transfers and join with users table to get names
  const { data: transfers } = await supabaseServer
    .from('civict_transfers')
    .select(`
      id, amount, status, created_at,
      sender:users!civict_transfers_sender_id_fkey(full_name),
      recipient:users!civict_transfers_recipient_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">CIVICT Transfer Approvals</h1>
        <p className="text-sm text-muted">Approve or reject peer-to-peer CIVICT transfers.</p>
      </div>
      <TransfersTable initialData={(transfers || []) as any[]} />
    </div>
  )
}