import { MapPin } from 'lucide-react'
import { SpacifyFinder } from '@/components/marketing/SpacifyFinder'

export default function SpacifyPage() {
  return (
    <div className="min-h-screen bg-sand pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
            <MapPin className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-black text-ink mb-2">DICO Spacify</h1>
          <p className="text-muted text-sm">Find your ward and polling area from where you are.</p>
        </div>
        <SpacifyFinder />
      </div>
    </div>
  )
}
