import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/voucher-auth'

const UUID = /^[0-9a-f-]{36}$/i

// Remove a distributor.
//  - No vouchers, payments or sub-distributors on record: deleted outright.
//  - Otherwise: deactivated (kept for the records; hidden from buyers, cannot generate vouchers, earns no royalty).
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { data: d } = await supabaseAdmin.from('distributors').select('id').eq('id', id).maybeSingle()
  if (!d) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })

  const count = async (table: string, filter: (q: any) => any) => {
    const { count } = await filter(supabaseAdmin.from(table).select('id', { count: 'exact', head: true }))
    return count ?? 0
  }
  const [vouchers, payments, children] = await Promise.all([
    count('vouchers', q => q.or(`issuer_id.eq.${id},holder_id.eq.${id}`)),
    count('distributor_payments', q => q.eq('distributor_id', id)),
    count('distributors', q => q.eq('parent_id', id)),
  ])

  if (vouchers + payments + children === 0) {
    const { error } = await supabaseAdmin.from('distributors').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Could not delete this distributor' }, { status: 500 })
    return NextResponse.json({ success: true, result: 'deleted' })
  }

  const { error } = await supabaseAdmin.from('distributors').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Could not deactivate this distributor' }, { status: 500 })
  const why = [vouchers && 'vouchers', payments && 'payments', children && 'sub-distributors'].filter(Boolean).join(', ')
  return NextResponse.json({ success: true, result: 'deactivated', reason: why })
}

// Restore a deactivated distributor.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession(req)
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const { error } = await supabaseAdmin.from('distributors').update({ is_active: true }).eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.code === '23505' ? 'Someone else is active in that place now. Remove them first.' : 'Could not restore' }, { status: 409 })
  }
  return NextResponse.json({ success: true })
}
