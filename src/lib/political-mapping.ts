import { SENATORIAL_DISTRICT_LGAS, FEDERAL_CONSTITUENCY_LGAS } from '@/data/political-areas'

export type CandidateTarget =
  | { scope: 'all' }
  | { scope: 'state', state: string }
  | { scope: 'lgas', state: string, lgas: string[] }
  | { scope: 'lga', state: string, lga: string }
  | { scope: 'ward', state: string, lga: string, ward: string };

export type VoterLocation = { state?: string | null, lga?: string | null, ward?: string | null }

const norm = (x?: string | null) => (x || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const parts = (x: string) => x.split('/').map(norm).filter(Boolean)

// Finds the LGAs of a senatorial district / federal constituency by name. Names saved by older
// registrations (e.g. "Oredo/Orhionmwon") are matched by the parts they share with the official name.
function findAreaLgas(table: Record<string, string[]> | undefined, name?: string | null): string[] | null {
  if (!table || !name) return null
  const n = norm(name)
  for (const k of Object.keys(table)) if (norm(k) === n) return table[k]
  const mine = new Set(parts(name))
  let best: string[] | null = null, score = 0
  for (const k of Object.keys(table)) {
    const kp = parts(k)
    const inter = kp.filter(p => mine.has(p)).length
    const s = inter / new Set([...kp, ...mine]).size
    if (s > score) { score = s; best = table[k] }
  }
  return score >= 0.5 ? best : null
}

export function getCandidateTargetAreas(candidate: any): CandidateTarget {
  const office = (candidate.office || '').toLowerCase();
  const state = candidate.state || '';
  const lga = candidate.lga || '';
  const ward = candidate.ward || '';

  // President: everyone
  if (office.includes('president')) return { scope: 'all' };

  // Governor / State House of Assembly: the whole state
  if (office.includes('governor') || office.includes('assembly')) return { scope: 'state', state };

  // Senator: the LGAs of their senatorial district (whole state if the district is unknown)
  if (office.includes('senator')) {
    const lgas = findAreaLgas(SENATORIAL_DISTRICT_LGAS[state], candidate.senatorial_district);
    if (lgas) return { scope: 'lgas', state, lgas };
    return { scope: 'state', state };
  }

  // House of Reps: the LGAs of their federal constituency (whole state if the constituency is unknown)
  if (office.includes('rep') || office.includes('federal')) {
    const lgas = findAreaLgas(FEDERAL_CONSTITUENCY_LGAS[state], candidate.federal_constituency);
    if (lgas) return { scope: 'lgas', state, lgas };
    return { scope: 'state', state };
  }

  // LGA chairman: their LGA
  if (office.includes('chairman') || office.includes('lga')) {
    if (lga) return { scope: 'lga', state, lga };
    return { scope: 'state', state };
  }

  // Councillor: their ward
  if (office.includes('councillor') || office.includes('ward')) {
    if (lga && ward) return { scope: 'ward', state, lga, ward };
    if (lga) return { scope: 'lga', state, lga };
    return { scope: 'state', state };
  }

  // Unknown office
  if (lga) return { scope: 'lga', state, lga };
  return { scope: 'state', state };
}

// Is this voter inside the area the candidate stands for?
export function voterMatchesTarget(target: CandidateTarget, voter: VoterLocation): boolean {
  const same = (a?: string | null, b?: string | null) => !!norm(a) && norm(a) === norm(b)
  switch (target.scope) {
    case 'all': return true
    case 'state': return same(voter.state, target.state)
    case 'lgas': return same(voter.state, target.state) && target.lgas.some(l => same(l, voter.lga))
    case 'lga': return same(voter.state, target.state) && same(voter.lga, target.lga)
    case 'ward': return same(voter.state, target.state) && same(voter.lga, target.lga) && same(voter.ward, target.ward)
  }
}
