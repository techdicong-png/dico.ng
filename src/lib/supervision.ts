import { supabaseAdmin } from '@/lib/supabase'

// Who can see whom (read-only):
//   Main Admin, National Directors -> everyone      Zonal Director -> the states of their zone
//   State Sole Distributor -> their state           LGA distributor -> themselves and their ward distributors
//   Ward distributor -> themselves
export type Scope = {
  kind: 'all' | 'zone' | 'state' | 'lga' | 'ward'
  label: string
  states: string[] | null     // limit by state (null = not limited this way)
  ids: string[] | null        // limit to specific distributors (null = not limited this way)
}

export async function getSupervisionScope(userId: string, role: string): Promise<Scope | null> {
  if (role === 'admin') return { kind: 'all', label: 'All of Nigeria · Main Admin', states: null, ids: null }

  const { data: leaders } = await supabaseAdmin.from('leaders').select('role, zone').eq('user_id', userId).eq('is_active', true)
  if (leaders?.some(l => l.role === 'national_director')) return { kind: 'all', label: 'All of Nigeria · National Director', states: null, ids: null }

  const zonal = leaders?.find(l => l.role === 'zonal_director')
  if (zonal?.zone) {
    const { data: z } = await supabaseAdmin.from('state_zones').select('state').eq('zone', zonal.zone)
    return { kind: 'zone', label: `${zonal.zone} zone · Zonal Director`, states: (z ?? []).map(x => x.state).sort(), ids: null }
  }

  const { data: me } = await supabaseAdmin.from('distributors').select('id, level, state, lga, ward').eq('user_id', userId).eq('is_active', true).maybeSingle()
  if (!me) return null
  if (me.level === 'sole') return { kind: 'state', label: `${me.state} State · Sole Distributor`, states: [me.state], ids: null }
  if (me.level === 'major') {
    const { data: kids } = await supabaseAdmin.from('distributors').select('id').eq('parent_id', me.id)
    return { kind: 'lga', label: `${me.lga}, ${me.state} · LGA distributor`, states: null, ids: [me.id, ...(kids ?? []).map(k => k.id)] }
  }
  return { kind: 'ward', label: `${me.ward}, ${me.lga} · Ward distributor`, states: null, ids: [me.id] }
}

// The state the viewer asked to narrow to, only if it is inside their scope.
export function pickState(scope: Scope, requested: string | null): string | null {
  if (!requested) return null
  if (scope.states && !scope.states.includes(requested)) return null
  return requested
}
