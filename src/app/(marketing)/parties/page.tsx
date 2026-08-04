'use client'

import { useState } from 'react'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { NIGERIAN_PARTIES } from '@/data/parties'
import { Search, CheckCircle, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function PoliticalPartiesPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = NIGERIAN_PARTIES.filter(p => {
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.abbr.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = activeFilter === 'all' || p.tags.includes(activeFilter)
    
    return matchesSearch && matchesFilter
  })

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
              INEC-Registered · Updated 2026
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">
              Nigeria&apos;s <span className="text-gold">{NIGERIAN_PARTIES.length}</span> registered political parties
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Every party legally recognised by the Independent National Electoral Commission (INEC) to contest elections — including the two newest additions ahead of the 2027 general elections.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== STATS STRIP ==================== */}
      <div className="max-w-5xl mx-auto -mt-10 relative z-20 px-4 mb-12">
        <div className="bg-white border border-border rounded-xl shadow-md grid grid-cols-2 md:grid-cols-4">
          <div className="p-4 text-center border-r border-b md:border-b-0 border-border-light">
            <p className="font-serif text-2xl font-black text-forest">{NIGERIAN_PARTIES.length}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted">Registered Parties</p>
          </div>
          <div className="p-4 text-center border-b md:border-b-0 md:border-r border-border-light">
            <p className="font-serif text-2xl font-black text-forest">3</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted">Major Parties</p>
          </div>
          <div className="p-4 text-center border-r border-border-light">
            <p className="font-serif text-2xl font-black text-forest">2</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted">Newly Registered</p>
          </div>
          <div className="p-4 text-center">
            <p className="font-serif text-2xl font-black text-forest">1999</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted">INEC Established</p>
          </div>
        </div>
      </div>

      {/* ==================== CONTROLS & GRID ==================== */}
      <section className="pb-20 px-4 md:px-6 bg-sand min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search by party name or abbreviation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-forest"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setActiveFilter('all')} 
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${activeFilter === 'all' ? 'bg-forest text-white border-forest' : 'bg-white text-muted border-border hover:border-forest'}`}
              >
                All {NIGERIAN_PARTIES.length}
              </button>
              <button 
                onClick={() => setActiveFilter('major')} 
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${activeFilter === 'major' ? 'bg-forest text-white border-forest' : 'bg-white text-muted border-border hover:border-forest'}`}
              >
                Major Parties
              </button>
              <button 
                onClick={() => setActiveFilter('new')} 
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${activeFilter === 'new' ? 'bg-forest text-white border-forest' : 'bg-white text-muted border-border hover:border-forest'}`}
              >
                Newly Registered
              </button>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-border rounded-xl py-16 text-center">
              <p className="text-muted">No parties match your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ScrollReveal key={p.abbr}>
                  <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:shadow-md hover:-translate-y-0.5 transition-all h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      {/* Logo with Fallback */}
                      <div className="w-12 h-12 rounded-lg bg-forest-light flex items-center justify-center font-serif font-bold text-forest text-sm shrink-0 overflow-hidden">
                        <Image 
                          src={p.logo} 
                          alt={`${p.name} Logo`}
                          width={48} height={48}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) parent.innerText = p.abbr
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-ink text-sm leading-tight">{p.name}</h3>
                        <p className="text-xs text-muted mt-0.5">{p.abbr}</p>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border-light">
                        {p.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded flex items-center gap-1 ${
                              tag === 'major' ? 'bg-gold/10 text-gold' : 
                              tag === 'new' ? 'bg-forest-light text-forest' : 
                              'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {tag === 'major' && <CheckCircle className="inline h-2.5 w-2.5" />}
                            {tag === 'new' && <Sparkles className="inline h-2.5 w-2.5" />}
                            {tag === 'major' ? 'Major Party' : tag === 'new' ? 'New · 2026' : 'Court-Ordered'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}