import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { RoyaltyAdmin } from '@/components/admin/RoyaltyAdmin'

export default async function AdminRoyaltyPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/login')

  const [rates, totals, leaders] = await Promise.all([
    supabaseAdmin.from('royalty_rates').select('role, amount_naira'),
    supabaseAdmin.from('royalty_role_totals').select('*'),
    supabaseAdmin.from('leaders').select('*, users:user_id(full_name, email)').eq('is_active', true).order('created_at'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">Loyalty Royalty</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">
          Set the naira amount each leadership level earns per transaction, appoint zonal and national directors, and see what has accrued.
        </p>
      </div>
      {(rates.error || totals.error) && (
        <p className="text-sm text-red-600">Could not load royalty data. Has the royalty migration (006_royalty.sql) been run?</p>
      )}
      <RoyaltyAdmin
        initialRates={(rates.data || []) as any[]}
        initialTotals={(totals.data || []) as any[]}
        initialLeaders={(leaders.data || []) as any[]}
      />
    </div>
  )
}
