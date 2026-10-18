import { supabaseAdmin } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { getCandidateTargetAreas, voterMatchesTarget, type VoterLocation } from '@/lib/political-mapping'

// A voter sees the candidates whose area they live in (President: everyone; Governor and State
// Assembly: their state; Senator: their senatorial district; House of Reps: their federal
// constituency; LGA chairman: their LGA; Councillor: their ward). Other roles see everything.
export async function getVoterScope(userId: string): Promise<{ restrict: boolean; voter: VoterLocation }> {
  const user = await getAuthUser(userId)
  if (!user || user.role !== 'voter') return { restrict: false, voter: {} }
  return { restrict: true, voter: { state: user.state, lga: user.lga, ward: user.ward } }
}

export async function getVisibleCandidateIds(voter: VoterLocation): Promise<string[]> {
  let q = supabaseAdmin
    .from('candidates')
    .select('id, office, state, lga, ward, senatorial_district, federal_constituency')
    .eq('is_active', true)
  // cheap pre-filter: presidential candidates, plus anyone standing in the voter's state
  q = voter.state ? q.or(`office.ilike.%president%,state.eq."${String(voter.state).replace(/"/g, '')}"`) : q.ilike('office', '%president%')
  const { data } = await q.limit(5000)
  return (data ?? []).filter(c => voterMatchesTarget(getCandidateTargetAreas(c), voter)).map(c => c.id)
}
