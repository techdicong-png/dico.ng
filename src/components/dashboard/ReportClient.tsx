'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, X, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'

type Report = {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  ward: string | null
  lga: string | null
  created_at: string
  upvote_count: number | null
  candidate_response: string | null
  users: { full_name: string | null } | null
}

export function ReportClient({ initialReports, catColors, statusColors, user }: { 
  initialReports: Report[], 
  catColors: Record<string, string>, 
  statusColors: Record<string, string>,
  user: any
}) {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    title: '', description: '', category: 'roads'
  })

  async function handleSubmit() {
    if (!form.title || !form.category) return toast.error('Title and category are required')
    
    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ward: user?.ward,
          lga: user?.lga,
          state: user?.state
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Report submitted! You earned 15 CIVICT.')
        setReports([data.report, ...reports])
        setForm({ title: '', description: '', category: 'roads' })
        setShowForm(false)
      } else {
        throw new Error(data.error || 'Failed to submit')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
            Community Reports · +15 CIVICT
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Issue Tracker</h1>
          <p className="text-sm text-muted dark:text-[#c0d0c4]">Report infrastructure problems and track resolutions.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-forest hover:bg-forest-mid">
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? 'Cancel' : 'Submit Report'}
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-6 space-y-4 animate-slide-down">
          <h3 className="font-serif text-lg font-bold text-ink dark:text-white">New Report</h3>
          <div>
            <label className="block text-xs font-semibold text-ink dark:text-white mb-1.5">Issue Title *</label>
            <Input 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              placeholder="e.g. Severe Potholes on Lekki-Epe Expressway" 
              className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink dark:text-white mb-1.5">Category *</label>
            <select 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full h-10 px-3 text-sm bg-white dark:bg-[#0f1d16] text-ink dark:text-white border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-forest"
            >
              <option value="roads">Roads</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="schools">Schools</option>
              <option value="health">Hospitals</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink dark:text-white mb-1.5">Description</label>
            <Textarea 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              rows={3} 
              placeholder="Describe the issue..." 
              className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gold hover:bg-gold-hover text-ink font-bold">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Submit & Earn 15 ₡
          </Button>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
          <p className="text-sm text-muted dark:text-[#c0d0c4]">No reports yet. Be the first to submit one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
              <div className="py-4 px-5">
                <div className="flex gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${catColors[r.category] || catColors.other}`}>{r.category}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusColors[r.status] || statusColors.pending}`}>
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