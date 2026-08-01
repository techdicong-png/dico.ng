// src/app/(dashboard)/reports/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const catColors: Record<string, string> = {
  roads: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  water: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  electricity: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  schools: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  health: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  security: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  other: 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300',
}

const statusColors: Record<string, string> = {
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
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
          <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
            Community Reports · +15 CIVICT
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Issue Tracker</h1>
          <p className="text-sm text-muted dark:text-[#c0d0c4]">Report infrastructure problems and track resolutions.</p>
        </div>
      </div>

      {(!reports || reports.length === 0) ? (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
          <p className="text-sm text-muted dark:text-[#c0d0c4]">No reports yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(reports as any[]).map(r => (
            <div key={r.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
              <div className="py-4 px-5">
                <div className="flex gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${catColors[r.category] || 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300'}`}>{r.category}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusColors[r.status] || 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'}`}>
                    {r.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-ink dark:text-white">{r.title}</h3>
                <p className="text-sm text-muted dark:text-[#c0d0c4] mt-1 line-clamp-2">{r.description}</p>
                {r.candidate_response && (
                  <div className="mt-2 p-3 bg-forest-faint dark:bg-[#1b3a2b] border-l-4 border-forest dark:border-forest-700 rounded text-sm">
                    <strong className="text-forest dark:text-forest-700">Response:</strong>{' '}
                    <span className="text-muted dark:text-[#c0d0c4]">{r.candidate_response}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-3 text-xs text-muted dark:text-[#c0d0c4]">
                  <span>📍 {r.ward || ''} {r.lga || ''} · by {r.users?.full_name || 'Anonymous'} · {new Date(r.created_at).toLocaleDateString()}</span>
                  <span>▲ {r.upvote_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
