import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { CandidatesTable } from '@/components/admin/CandidatesTable'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function AdminCandidatesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/dashboard')

  const { data: registrations } = await supabaseServer
    .from('candidate_registrations')
    .select('*')
    .order('submitted_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Candidate Verification</h1>
        <p className="text-sm text-muted">Review and approve candidate registration applications.</p>
      </div>
      <CandidatesTable initialData={registrations || []} />
    </div>
  )
}