import { Ticket } from 'lucide-react'
import { BuyVoucher } from '@/components/marketing/BuyVoucher'

export default function BuyVoucherPage() {
  return (
    <div className="min-h-screen bg-sand pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
            <Ticket className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-black text-ink mb-2">Buy a Voucher</h1>
          <p className="text-muted text-sm">Pay your state&apos;s official DICO distributor and receive your voucher code. No account needed.</p>
        </div>
        <BuyVoucher />
      </div>
    </div>
  )
}
