import Link from 'next/link'
import { MapPin, Megaphone, Layers } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 300

type Plan = { denomination: number; days: number; price: number | null }

async function spacifyPlans(): Promise<Plan[]> {
  try {
    const [rules, prices] = await Promise.all([
      supabaseAdmin.from('service_access_rules').select('denomination, days').eq('service', 'spacify').order('denomination'),
      supabaseAdmin.from('voucher_pricing').select('denomination, end_user_price').eq('is_active', true),
    ])
    const price = new Map((prices.data ?? []).map(p => [p.denomination, p.end_user_price]))
    return (rules.data ?? []).map(r => ({ denomination: r.denomination, days: r.days, price: price.get(r.denomination) ?? null }))
  } catch { return [] }
}

const days = (n: number) => (n === 1 ? '1 day' : `${n} days`)
const btn = 'inline-block text-center font-semibold py-2.5 px-4 rounded-lg text-sm'

export default async function ServicesPage() {
  const plans = await spacifyPlans()

  return (
    <div className="min-h-screen bg-sand pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
            <Layers className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-black text-ink mb-2">DICO Services</h1>
          <p className="text-muted text-sm md:text-base max-w-lg mx-auto">
            Tools you can use without a DICO account. Pay with a voucher, bought from your state&apos;s official distributor.
          </p>
        </div>

        <div className="space-y-5">
          <section className="bg-white border border-mint-line rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0"><MapPin className="h-5 w-5 text-gold" /></div>
              <div>
                <h2 className="font-serif text-xl font-black text-ink">DICO Spacify</h2>
                <p className="text-sm text-muted">Find your ward and nearest polling area from your phone&apos;s location, with directions and a map. Your location is used once and is never saved or shared.</p>
              </div>
            </div>
            {plans.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted mb-2">What a voucher gives you</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {plans.map(p => (
                    <div key={p.denomination} className="rounded-lg bg-mint/50 px-3 py-2 text-xs">
                      <span className="font-bold text-ink">{p.denomination} CIVICT</span>
                      <span className="block text-muted">{days(p.days)}</span>
                      {p.price ? <span className="block text-muted">₦{p.price.toLocaleString()}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Link href="/spacify" className={`${btn} bg-forest text-white`}>Open Spacify</Link>
              <Link href="/buy-voucher" className={`${btn} border border-forest text-forest`}>Buy a voucher</Link>
            </div>
          </section>

          <section className="bg-white border border-mint-line rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0"><Megaphone className="h-5 w-5 text-gold" /></div>
              <div>
                <h2 className="font-serif text-xl font-black text-ink">Advertise on DICO</h2>
                <p className="text-sm text-muted">Reach verified voters and target specific Local Government Areas.</p>
              </div>
            </div>
            <Link href="/advertise" className={`${btn} bg-forest text-white`}>Advertise</Link>
          </section>
        </div>

        <section className="mt-10 bg-white border border-mint-line rounded-xl p-6">
          <h2 className="font-serif text-lg font-black text-ink mb-3">How vouchers work</h2>
          <ol className="space-y-2 text-sm text-ink list-decimal pl-5">
            <li><b>Buy</b> a voucher from your state&apos;s DICO distributor. Pay them, and they confirm your payment.</li>
            <li><b>Redeem</b> it on the <Link href="/redeem-voucher" className="underline">Redeem Voucher</Link> page with your code and phone number.</li>
            <li><b>Use</b> the service. No sign-up is needed.</li>
          </ol>
          <p className="text-xs text-muted mt-3">Each voucher code works once. Voucher value pays for services and cannot be exchanged for cash.</p>
        </section>
      </div>
    </div>
  )
}
