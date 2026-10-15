import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { DistributorsAdmin } from '@/components/admin/DistributorsAdmin'
import { NG_STATES } from '@/data/ng-states'

export default async function AdminDistributorsPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/login')

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .select('*, users:user_id(full_name, email, phone)')
    .order('state')

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink dark:text-white">Distributors &amp; VGI</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">
          Register state Sole Distributors, activate their Voucher Generator Interface, and top up voucher credit.
        </p>
      </div>
      {error && (
        <p className="text-sm text-red-600">
          Could not load distributors. Has the voucher migration (001_voucher_network.sql) been run?
        </p>
      )}
      <DistributorsAdmin initialData={(data || []) as any[]} states={NG_STATES} />
    </div>
  )
}
