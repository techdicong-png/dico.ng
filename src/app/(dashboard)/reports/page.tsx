// src/app/(dashboard)/reports/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const catColors: Record<string, string> = {
  roads: 'bg-amber-100 text-amber-800',
  water: 'bg-blue-100 text-blue-800',
  electricity: 'bg-yellow-100 text-yellow-800',
  schools: 'bg-green-100 text-green-800',
  health: 'bg-red-100 text-red-800',
  security: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
}

export default async function ReportsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload) redirect('/login')

  const { data: reports } = await supabaseAdmin.from('reports')
    .select('*, users(full_name, ward)')
    .order('created_at', { ascending: false }).limit(20)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
            Community Reports · +15 CIVICT
          </span>
          <h1 className="font-serif text-2xl font-black text-ink">Issue Tracker</h1>
          <p className="text-sm text-muted-text">Report infrastructure problems and track resolutions.</p>
        </div>
      </div>

      {(!reports || reports.length === 0) ? (
        <Card><CardContent className="py-12 text-center text-muted-text">No reports yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(reports as any[]).map(r => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${catColors[r.category] || 'bg-gray-100'}`}>{r.category}</span>
                  <Badge variant={r.status === 'resolved' ? 'default' : r.status === 'in_progress' ? 'secondary' : 'outline'}>
                    {r.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <h3 className="font-semibold text-ink">{r.title}</h3>
                <p className="text-sm text-muted-text mt-1 line-clamp-2">{r.description}</p>
                {r.candidate_response && (
                  <div className="mt-2 p-3 bg-forest-faint border-l-4 border-forest rounded text-sm">
                    <strong className="text-forest">Response:</strong> {r.candidate_response}
                  </div>
                )}
                <div className="flex justify-between items-center mt-3 text-xs text-muted-text">
                  <span>📍 {r.ward || ''} {r.lga || ''} · by {r.users?.full_name || 'Anonymous'} · {new Date(r.created_at).toLocaleDateString()}</span>
                  <span>▲ {r.upvote_count || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
