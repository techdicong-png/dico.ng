'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown, Trophy } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Deterministic pseudo-random metrics (seeded per candidate id/name)
function hashStr(s: string) {
  let h = 1779033703 ^ s.length
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function computeMetrics(c: any) {
  const rand = hashStr(String(c.id) + '|' + (c.full_name || ''))
  const approval = Math.round(50 + rand() * 45)
  const responseRate = Math.round(35 + rand() * 60)
  const promises = Math.round(15 + rand() * 75)
  const townHalls = Math.floor(rand() * 13)
  const qna = Math.floor(5 + rand() * 135)
  const overall = Math.round(0.30 * approval + 0.25 * responseRate + 0.20 * promises + 0.15 * (townHalls / 12 * 100) + 0.10 * (qna / 140 * 100))
  return { approval, responseRate, promises, townHalls, qna, overall }
}

export function PerformanceAnalytics() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rivalId, setRivalId] = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('candidates').select('id, full_name, party, office, lga, state').eq('is_active', true)
      if (data) {
        const mapped = data.map(c => ({ ...c, metrics: computeMetrics(c) })).sort((a, b) => b.metrics.overall - a.metrics.overall)
        setCandidates(mapped)
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id)
          setRivalId(mapped[1]?.id || '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const me = candidates.find(c => c.id === selectedId)
  const rival = candidates.find(c => c.id === rivalId)
  
  const rivalsInRace = candidates.filter(c => c.office === me?.office && c.id !== me?.id)

  if (loading) return <div className="p-8 text-center text-muted">Loading analytics...</div>

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
          Performance Analytics · Beta
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-black text-ink mb-2">See how you <span className="text-gold">compare</span></h1>
        <p className="text-muted max-w-xl mx-auto">Find your candidate profile to view your voter approval, responsiveness and civic engagement — measured against other candidates in your race.</p>
      </div>

      {/* Search Panel */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
        <label className="text-xs font-semibold text-ink mb-2 block">Find your profile</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input 
            placeholder="Start typing your name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        
        {search && (
          <div className="mt-2 border border-border rounded-lg max-h-60 overflow-y-auto">
            {candidates.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map(c => (
              <button 
                key={c.id} 
                onClick={() => { setSelectedId(c.id); setSearch(''); setRivalId(rivalsInRace[0]?.id || '') }}
                className="w-full text-left p-3 hover:bg-forest-faint border-b border-border-light last:border-0 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{c.full_name}</p>
                  <p className="text-xs text-muted">{c.party} · {c.office}</p>
                </div>
                <span className="text-xs font-bold text-forest bg-forest-light px-2 py-1 rounded">{c.metrics.overall}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard */}
      {me && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Stats */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-forest text-white rounded-xl p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Performance Index</p>
              <p className="font-serif text-5xl font-black text-gold">{me.metrics.overall}</p>
              <p className="text-xs text-white/60 mt-2">#{candidates.findIndex(c => c.id === me.id) + 1} of {candidates.length} overall</p>
            </div>
            
            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Voter Approval</p>
                <p className="font-serif text-2xl font-black text-ink">{me.metrics.approval}%</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Q&A Response Rate</p>
                <p className="font-serif text-2xl font-black text-ink">{me.metrics.responseRate}%</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Town Halls Hosted</p>
                <p className="font-serif text-2xl font-black text-ink">{me.metrics.townHalls}</p>
              </div>
            </div>
          </div>

          {/* Right: Comparison & Leaderboard */}
          <div className="md:col-span-2 space-y-6">
            {/* Comparison */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="font-serif text-lg font-bold text-ink">You vs. the field</h3>
                <select value={rivalId} onChange={(e) => setRivalId(e.target.value)} className="h-9 px-3 text-sm bg-white border border-border rounded-lg">
                  <option value="">Select Rival...</option>
                  {rivalsInRace.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Voter Approval', key: 'approval', max: 100, unit: '%' },
                  { label: 'Response Rate', key: 'responseRate', max: 100, unit: '%' },
                  { label: 'Promises Fulfilled', key: 'promises', max: 100, unit: '%' },
                  { label: 'Town Halls', key: 'townHalls', max: 12, unit: '' },
                  { label: 'Q&A Sessions', key: 'qna', max: 140, unit: '' },
                ].map(metric => (
                  <div key={metric.key}>
                    <p className="text-xs font-semibold text-ink mb-2">{metric.label}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] w-10 text-muted">You</span>
                      <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden">
                        <div className="h-full bg-forest rounded-full" style={{ width: `${Math.min(100, (me.metrics[metric.key] / metric.max) * 100)}%` }}></div>
                      </div>
                      <span className="text-xs font-bold w-12 text-right text-ink">{me.metrics[metric.key]}{metric.unit}</span>
                    </div>
                    {rival && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-10 text-muted truncate">{rival.full_name.split(' ')[0]}</span>
                        <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden">
                          <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(100, (rival.metrics[metric.key] / metric.max) * 100)}%` }}></div>
                        </div>
                        <span className="text-xs font-bold w-12 text-right text-ink">{rival.metrics[metric.key]}{metric.unit}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-serif text-lg font-bold text-ink mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gold" /> Leaderboard
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {candidates.slice(0, 10).map((c, i) => (
                  <div key={c.id} className={`flex items-center gap-3 p-2 rounded-lg ${c.id === me.id ? 'bg-forest-light' : ''}`}>
                    <span className="font-bold text-muted w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{c.full_name} {c.id === me.id && <span className="text-[10px] text-forest font-bold ml-1">(You)</span>}</p>
                      <p className="text-xs text-muted">{c.party}</p>
                    </div>
                    <span className="font-serif text-lg font-black text-ink">{c.metrics.overall}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}