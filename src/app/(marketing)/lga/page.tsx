'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { MapPin, Search, Building, ArrowRight, ChevronDown, Landmark } from 'lucide-react'
import { ALL_NIGERIA_LGAS } from '@/data/all_lgas'

export default function AllLgasPage() {
  const [search, setSearch] = useState('')
  const [openState, setOpenState] = useState<string | null>(null)

  const filteredGroups = useMemo(() => {
    const result: Record<string, string[]> = {}
    
    Object.entries(ALL_NIGERIA_LGAS).forEach(([state, lgas]) => {
      const matchedLgas = lgas.filter(lga => 
        !search || 
        lga.toLowerCase().includes(search.toLowerCase()) ||
        state.toLowerCase().includes(search.toLowerCase())
      )
      if (matchedLgas.length > 0) {
        result[state] = matchedLgas
      }
    })
    
    return result
  }, [search])

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      {/* HERO */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white pt-20 pb-12 md:pt-28 md:pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
              <MapPin className="h-3 w-3" /> Central Directory
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] mb-4">
              Explore All <span className="text-gold">774 LGAs</span>
            </h1>
            <p className="text-sm md:text-lg text-white/80 max-w-xl mx-auto mb-8">
              Your Digital Interactive Constituency Office. Select any state to find local candidates, government services, and community updates.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="text"
                placeholder="Search for an LGA or State..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-base text-ink bg-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* STATE ACCORDION */}
      <section className="flex-1 py-8 md:py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {Object.keys(filteredGroups).length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 md:p-12 text-center">
              <p className="text-muted text-sm md:text-base">No locations found matching your search.</p>
            </div>
          ) : (
            Object.entries(filteredGroups).map(([state, lgas]) => (
              <ScrollReveal key={state}>
                <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                  {/* State Header Button */}
                  <button 
                    className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-forest-faint transition-colors"
                    onClick={() => setOpenState(openState === state ? null : state)}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-forest flex items-center justify-center shrink-0">
                        <Landmark className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                      </div>
                      <div className="text-left">
                        <h2 className="font-serif text-lg md:text-xl font-black text-ink">{state}</h2>
                        <p className="text-[10px] md:text-xs text-muted">{lgas.length} Local Government Areas</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted transition-transform shrink-0 ${openState === state || search ? 'rotate-180' : ''}`} />
                  </button>

                  {/* LGA Grid (Expands) */}
                  {(openState === state || search) && (
                    <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-border-light">
                      {lgas.map((lga) => (
                        <Link 
                          key={`${state}-${lga}`} 
                          href={`/lga/${lga.toLowerCase().replace(/\s/g, '-')}`}
                          className="block bg-sand border border-border rounded-lg p-4 hover:border-forest hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Building className="h-5 w-5 text-forest" />
                            <ArrowRight className="h-4 w-4 text-muted group-hover:text-forest group-hover:translate-x-1 transition-all" />
                          </div>
                          <h3 className="font-bold text-ink text-sm group-hover:text-forest transition-colors">
                            {lga}
                          </h3>
                          <p className="text-[10px] text-muted mt-1">{state} State</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))
          )}
        </div>
      </section>
    </div>
  )
}