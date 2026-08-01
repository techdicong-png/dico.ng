// src/app/(marketing)/reports/page.tsx
import Link from 'next/link'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { MapPin, AlertTriangle, CheckCircle, Clock, Activity, MessageSquare } from 'lucide-react'

const reports = [
  { cat: 'Roads', catClass: 'bg-amber-100 text-amber-800', title: 'Severe Potholes on Lekki-Epe Expressway', loc: 'Eti-Osa, Lagos State', status: 'In Progress', statusClass: 'bg-blue-100 text-blue-800', time: '2 hours ago' },
  { cat: 'Water', catClass: 'bg-blue-100 text-blue-800', title: 'Borehole Breakdown in Ward 4', loc: 'Oredo, Edo State', status: 'Under Review', statusClass: 'bg-amber-100 text-amber-800', time: '5 hours ago' },
  { cat: 'Electricity', catClass: 'bg-yellow-100 text-yellow-800', title: 'Fallen Transformer Pole Blocking Access', loc: 'Surulere, Lagos State', status: 'Submitted', statusClass: 'bg-gray-100 text-gray-700', time: '1 day ago' },
  { cat: 'Schools', catClass: 'bg-green-100 text-green-800', title: 'Roof Damage at Local Primary School', loc: 'Udi, Enugu State', status: 'Resolved', statusClass: 'bg-green-100 text-green-800', time: '3 days ago' },
  { cat: 'Hospitals', catClass: 'bg-red-100 text-red-800', title: 'Lack of Maternity Equipment', loc: 'Ibadan North, Oyo State', status: 'In Progress', statusClass: 'bg-blue-100 text-blue-800', time: '4 days ago' },
  { cat: 'Security', catClass: 'bg-purple-100 text-purple-800', title: 'Request for Street Lighting in Market Area', loc: 'Wuse II, FCT Abuja', status: 'Under Review', statusClass: 'bg-amber-100 text-amber-800', time: '1 week ago' },
]

export default function ReportsPage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest text-white py-20 md:py-28 px-4 md:px-6">
        <div className="absolute w-96 h-96 rounded-full border border-white/10 -top-24 -left-24 animate-[spin_24s_linear_infinite] pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-white/10 -bottom-48 -right-36 animate-[spin_31s_linear_infinite_reverse] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-70"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(200,150,10,.1), transparent 30%)' }} />
        <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded mb-4">
              <AlertTriangle className="h-3 w-3" /> Constituency Reports
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.08] mb-4">Track <span className="text-gold">Real Issues</span> On The Ground</h1>
            <p className="text-white/80 max-w-md mb-8">
              Monitor live infrastructure reports, community grievances, and project updates submitted directly by verified voters across Nigeria.
            </p>
            <Link href="/register" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> View Latest Reports
            </Link>
          </ScrollReveal>

          {/* Impact Summary Card */}
          <ScrollReveal>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-4">Report Impact Summary</p>
              {[
                { icon: Activity, label: 'Active Reports', value: '1,243', desc: 'Verified issues tracked across 36 states.' },
                { icon: CheckCircle, label: 'Resolved This Month', value: '458', desc: 'Infrastructure issues successfully addressed.' },
                { icon: MessageSquare, label: 'Candidates Engaged', value: '892', desc: 'Officials responding to community data.' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 py-3.5 border-b border-white/10 last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/20 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.value}</span>
                      <span className="text-xs text-white/50">{item.label}</span>
                    </div>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== REPORTS GRID ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-6" id="reports">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded mb-3">Live Data Feed</span>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-ink mb-3">Community Infrastructure Reports</h2>
            <p className="text-muted max-w-xl mb-10">
              Browse real-time, geolocated reports submitted by verified constituents.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r, i) => (
              <ScrollReveal key={r.title}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-forest hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.catClass}`}>{r.cat}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.statusClass}`}>{r.status}</span>
                  </div>
                  <h3 className="font-semibold text-ink text-sm mb-2">{r.title}</h3>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {r.loc}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {r.time}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="relative isolate overflow-clip bg-gradient-to-br from-forest via-forest-mid to-forest py-20 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-white mb-4">See Something? <span className="text-gold">Report It</span></h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8">
              Every verified report earns CIVICT and gets tracked until resolution. Candidates and officials are notified automatically.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register" className="bg-gold hover:bg-gold-hover text-ink font-bold px-6 py-3 rounded-lg text-sm transition-all">
                Start Reporting +15 ₡
              </Link>
              <Link href="/contact" className="border border-white/30 text-white/80 hover:text-white hover:border-white/60 px-6 py-3 rounded-lg text-sm transition-all">
                Contact Support
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
