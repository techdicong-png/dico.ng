import Link from 'next/link'
import { Ticket } from 'lucide-react'
import { RedeemVoucherForm } from '@/components/marketing/RedeemVoucherForm'

export default function RedeemVoucherPage() {
  return (
    <div className="min-h-screen bg-sand pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
            <Ticket className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-black text-ink mb-2">Redeem a Voucher</h1>
          <p className="text-muted text-sm">No account needed. Enter the code from your DICO voucher.</p>
        </div>
        <RedeemVoucherForm />
        <p className="text-center text-xs text-muted mt-4">
          Don&apos;t have a voucher? <Link href="/buy-voucher" className="underline text-ink">Buy one from your state distributor</Link>.
        </p>
      </div>
    </div>
  )
}
