'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { MapPin, Search, Building, ArrowRight } from 'lucide-react'
import { NIGERIA_DATA, STATES } from '@/data/nigeria'

// We focus only on the 4 active states for the V1 launch
const ACTIVE_STATES = ['Edo', 'Delta', 'FCT Abuja', 'Nasarawa']

// Flatten the data into a simple array of { state, lga, wardCount } for easy searching
const ALL_LGAS = ACTIVE_STATES.flatMap(state => 
  Object.keys(NIGERIA_DATA[state] || {}).map(lga => ({
    state,
    lga,
    wardCount: NIGERIA_DATA[state][lga].length
  }))
).sort((a, b) => a.lga.localeCompare(b.lga))

export default function ExplorerPage() {
  const [search, setSearch] = useState('')

  const filteredLgas = useMemo(() => {
    if (!search) return ALL_LGAS
    return ALL_LGAS.filter(item => 
      item.lga.toLowerCase().includes(search.toLowerCase()) ||
      item.state.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
              <MapPin className="h-3 w-3" /> Explore Your Constituency
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-black leading-[1.05] mb-4">
              Your LGA. <br className="md:hidden"/> <span className="text-gold">Your Voice.</span> Your Future.
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
              Your Digital Interactive Constituency Office. Search across {ALL_LGAS.length} active Local Government Areas to find local candidates, government services, and community updates.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="text"
                placeholder="Search for an LGA (e.g. Keffi, Asaba)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-ink bg-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-gold text-sm"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== LGA GRID ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <ScrollReveal>
              <h2 className="font-serif text-2xl md:text-3xl font-black text-ink">
                {search ? `Results for "${search}"` : 'Explore Active LGAs'}
              </h2>
              <p className="text-sm text-muted mt-1">
                Showing {filteredLgas.length} Local Government Areas across {ACTIVE_STATES.length} states.
              </p>
            </ScrollReveal>
          </div>

          {filteredLgas.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <p className="text-muted">No LGAs found matching your search. Try "Keffi" or "Asaba".</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredLgas.map((item, i) => (
                <ScrollReveal key={`${item.state}-${item.lga}`}>
                  <Link 
                    href={`/lga/${item.lga.toLowerCase().replace(/\s/g, '-')}`}
                    className="block bg-white border border-border rounded-xl p-5 hover:border-forest hover:shadow-md transition-all group h-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-forest-light flex items-center justify-center">
                        <Building className="h-5 w-5 text-forest" />
                      </div>
                      <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-1 rounded">
                        {item.wardCount} Wards
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-ink mb-1 group-hover:text-forest transition-colors">
                      {item.lga}
                    </h3>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {item.state} State
                    </p>
                    <div className="mt-4 pt-3 border-t border-border-light flex items-center text-xs font-semibold text-forest">
                      Visit LGA Hub <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}