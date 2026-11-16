import { Home } from 'lucide-react'
import { HousingContractor } from '@/components/marketing/HousingContractor'

export default function HousingPage() {
  return (
    <div className="min-h-screen bg-sand pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
            <Home className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-black text-ink mb-2">DICO Housing Contractor Reseller Service</h1>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Choose a housing contract, see the full cost, the contract value, your expected gross profit and the payment due date before you pay. Open with a DICO voucher.
          </p>
        </div>
        <HousingContractor />
        <p className="text-center text-xs text-muted mt-6"><a href="/housing/projects" className="underline text-ink">See the announced housing projects</a></p>
      </div>
    </div>
  )
}
