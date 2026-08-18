import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { LiveSessionRoom } from '@/components/dashboard/LiveSessionRoom'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')
  
  const user = await getAuthUser(payload.userId)
  if (!user) redirect('/login')

  // Fetch the session details
  const { data: session } = await supabaseServer
    .from('live_sessions')
    .select('*, candidates(full_name, party, office)')
    .eq('id', id)
    .single()

  if (!session) {
    return (
      <div className="bg-white border border-border rounded-xl p-8 text-center">
        <p className="text-muted">Session not found or has ended.</p>
        <Link href="/sessions" className="text-forest font-semibold mt-4 inline-block">Back to Sessions</Link>
      </div>
    )
  }

  // Check if the logged-in user is the candidate hosting this session
  const isCandidate = session.candidate_id === user.id || user.role === 'candidate'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/sessions" className="hover:text-ink">Sessions</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-ink font-medium truncate">{session.title}</span>
      </div>
      
      <div>
        <h1 className="font-serif text-2xl font-black text-ink mb-1">{session.title}</h1>
        <p className="text-sm text-muted">
          Hosted by {session.candidates?.full_name} · {session.candidates?.party}
        </p>
      </div>

      <LiveSessionRoom sessionId={id} isCandidate={isCandidate} />
    </div>
  )
}