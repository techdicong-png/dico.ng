import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { NIGERIA_DATA } from '@/data/nigeria'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { MapPin, Users, Building, Landmark, FileText, CreditCard, Briefcase, ArrowRight } from 'lucide-react'
import Image from 'next/image'

// Initialize Supabase client inline for Server Components
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Helper to convert slug ("keffi-north") back to title case ("Keffi North")
function formatLgaName(slug: string) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to find the state this LGA belongs to
function findStateByLga(lgaName: string) {
  for (const [state, lgas] of Object.entries(NIGERIA_DATA)) {
    if (lgas[lgaName]) return state
  }
  return null
}

export default async function LgaHubPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const lgaName = formatLgaName(name)
  const stateName = findStateByLga(lgaName)

  // If the LGA doesn't exist in our data, show 404
  if (!stateName) {
    notFound()
  }

  const wards = NIGERIA_DATA[stateName]?.[lgaName] || []

  // Fetch candidates registered in this LGA
  const { data: candidates } = await supabaseServer
    .from('candidates')
    .select('id, full_name, party, office, avatar_url, is_verified')
    .eq('lga', lgaName)
    .eq('is_active', true)

    // NEW: Fetch active ads that contain this LGA in their target_lgas array
  const { data: ads } = await supabaseServer
    .from('advertisements')
    .select('id, business_name, description, image_url, link_url')
    .eq('status', 'active')
    .contains('target_lgas', [lgaName])

  // Mock stats for the UI (can be replaced by real DB counts later)
  const stats = [
    { icon: Users, label: 'Population', value: '271,688' },
    { icon: Landmark, label: 'Wards', value: wards.length.toString() },
    { icon: Building, label: 'Registered Voters', value: '124,500' },
    { icon: Briefcase, label: 'Active Candidates', value: (candidates?.length || 0).toString() },
  ]

  const services = [
    { icon: FileText, title: 'Birth & Death Registration', desc: 'Access official civil registration portals.' },
    { icon: CreditCard, title: 'Tax & Revenue', desc: 'Pay your LGA levies and taxes securely.' },
    { icon: Building, title: 'Permits & Licensing', desc: 'Apply for business and building permits.' },
    { icon: Users, title: 'Ward Administration', desc: 'Find your local councilor and ward office.' },
  ]

  return (
    <div className="bg-sand min-h-screen">
      {/* HERO SECTION */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
              <MapPin className="h-3 w-3" /> {stateName} State
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">
              Welcome to <span className="text-gold">{lgaName}</span>
            </h1>
            <p className="text-white/80 max-w-md mb-8">
              Your Digital Interactive Constituency Office for {lgaName}. Connect with local candidates, access government services, and shape the future of your community.
            </p>
            <Link href="#candidates" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2">
              View Local Candidates <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          {/* LGA Stats Card */}
          <ScrollReveal>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-4">LGA Overview</p>
              <div className="grid grid-cols-2 gap-4">
                {stats.map(item => (
                  <div key={item.label} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <item.icon className="h-5 w-5 text-gold mb-2" />
                    <p className="font-serif text-xl font-black text-white">{item.value}</p>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* POPULAR LGA SERVICES */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">Popular LGA Services</h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-12">Quick access to essential government services in {lgaName}.</p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {services.map(s => (
              <ScrollReveal key={s.title}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-0.5 transition-all h-full">
                  <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center mb-3">
                    <s.icon className="h-5 w-5 text-forest" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-ink mb-1">{s.title}</h3>
                  <p className="text-xs text-muted">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPAIGN SPOTLIGHT (Candidates in this LGA) */}
      <section id="candidates" className="py-16 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end flex-wrap gap-4 mb-10">
            <ScrollReveal>
              <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-3 py-1.5 rounded inline-block mb-4">Campaign Spotlight</span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-ink">Candidates in {lgaName}</h2>
            </ScrollReveal>
            <Link href="/candidates" className="text-sm font-semibold text-forest hover:text-gold flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {candidates && candidates.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {candidates.map((c) => (
                <Link href={`/candidates/${c.id}`} key={c.id} className="bg-sand border border-border rounded-xl overflow-hidden hover:border-forest hover:-translate-y-0.5 transition-all group">
                  <div className="h-28 bg-forest-light flex items-center justify-center font-serif text-3xl font-black text-forest-mid relative">
                    {c.avatar_url ? (
                      <Image src={c.avatar_url} alt={c.full_name} width={100} height={100} className="w-full h-full object-cover" />
                    ) : (
                      c.full_name?.charAt(0)
                    )}
                    {c.is_verified && (
                      <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-forest text-white px-1.5 py-0.5 rounded">✓ Verified</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gold mb-1">{c.party}</p>
                    <h3 className="font-bold text-ink truncate">{c.full_name}</h3>
                    <p className="text-xs text-muted truncate">{c.office}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-sand border border-border rounded-xl">
              <p className="text-muted">No candidates have registered in {lgaName} yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

           {/* DICOMARKETPLACE (Real Ads from DB) */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink text-center mb-3">DICOMarketplace & Local Ads</h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-12">Support local businesses and campaigns in {lgaName}.</p>
          </ScrollReveal>

                    {/* Fetch active ads for this LGA */}
          {ads && ads.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ads.map((ad) => (
                <a 
                  key={ad.id} 
                  href={ad.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="h-40 bg-forest-faint overflow-hidden">
                    <Image src={ad.image_url} alt={ad.business_name} width={300} height={160} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-forest uppercase tracking-wide">Sponsored</p>
                    <h3 className="font-bold text-ink text-sm truncate">{ad.business_name}</h3>
                    {/* NEW: Display the description if it exists */}
                    {ad.description && <p className="text-xs text-muted mt-1 line-clamp-2">{ad.description}</p>}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Fallback if no active ads in DB */}
              <div className="bg-white border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[180px] hover:border-gold transition-colors">
                <h3 className="font-bold text-ink mb-1">Advertise Here</h3>
                <p className="text-xs text-muted mb-3">Reach residents in {lgaName}.</p>
                <Link href="/dashboard/voter" className="text-xs font-bold text-gold bg-gold/10 px-3 py-1.5 rounded-md">Submit Ad</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}