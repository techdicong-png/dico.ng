// src/app/(marketing)/advertise/page.tsx
import { NIGERIA_DATA } from '@/data/nigeria'
import { AdvertiseForm } from '@/components/marketing/AdvertiseForm'

// We only pass the 4 active states to the client, keeping the rest of the 36 states on the server.
const ACTIVE_STATES = ['Edo', 'Delta', 'FCT Abuja', 'Nasarawa']

export default function AdvertisePage() {
  // Extract only the LGAs for our active states
  const activeLgas: Record<string, string[]> = {}
  ACTIVE_STATES.forEach(state => {
    activeLgas[state] = Object.keys(NIGERIA_DATA[state] || {}).sort()
  })

  return (
    <div className="min-h-screen bg-sand py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
            <Megaphone className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-black text-ink mb-2">Advertise on DICO</h1>
          <p className="text-muted text-sm md:text-base max-w-md mx-auto">
            Reach thousands of verified voters. Target specific Local Government Areas.
          </p>
        </div>
        
        {/* Render the Client Component, passing the server-fetched data as props */}
        <AdvertiseForm activeStates={ACTIVE_STATES} activeLgas={activeLgas} />
      </div>
    </div>
  )
}

// We need to import Megaphone here for the server component UI
import { Megaphone } from 'lucide-react'