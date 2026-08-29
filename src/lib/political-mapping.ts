// Exact LGA mappings for Delta State Senatorial Districts
const DELTA_SENATORIAL_DISTRICTS: Record<string, string[]> = {
  "Delta North": ["Aniocha North", "Aniocha South", "Oshimili North", "Oshimili South", "Ika North East", "Ika South", "Ndokwa East", "Ndokwa West", "Ukwuani"],
  "Delta South": ["Bomadi", "Patani", "Isoko North", "Isoko South", "Warri North", "Warri South", "Warri South West", "Burutu"],
  "Delta Central": ["Okpe", "Sapele", "Uvwie", "Ethiope West", "Ethiope East", "Ughelli North", "Ughelli South", "Udu"]
};

// Exact LGA mappings for Delta State Federal Constituencies
const DELTA_FEDERAL_CONSTITUENCIES: Record<string, string[]> = {
  "Aniocha/Oshimili": ["Aniocha North", "Aniocha South", "Oshimili North", "Oshimili South"],
  "Ika North/South": ["Ika North East", "Ika South"],
  "Ndokwa East/West": ["Ndokwa East", "Ndokwa West", "Ukwuani"],
  "Bomadi/Patani": ["Bomadi", "Patani"],
  "Isoko North/South": ["Isoko North", "Isoko South"],
  "Ethiope East/West": ["Ethiope East", "Ethiope West"],
  "Okpe/Uvwie/Sapele": ["Okpe", "Sapele", "Uvwie"],
  "Ughelli North/South": ["Ughelli North", "Ughelli South", "Udu"],
  "Warri North/South/South-West": ["Warri North", "Warri South", "Warri South West"]
};

export type CandidateTarget = 
  | { scope: 'all' }
  | { scope: 'state', state: string }
  | { scope: 'lgas', lgas: string[] }
  | { scope: 'lga', lga: string | null }
  | { scope: 'ward', lga: string | null, ward: string | null };

export function getCandidateTargetAreas(candidate: any): CandidateTarget {
  const office = (candidate.office || '').toLowerCase();
  const state = candidate.state || '';

  // President: Target everyone
  if (office.includes('president')) return { scope: 'all' };

  // Governor / State House of Assembly: Target whole state
  if (office.includes('governor') || office.includes('assembly')) return { scope: 'state', state: state };

  // Senatorial: Target specific LGAs in the district (if mapped), else fallback to state
  if (office.includes('senator')) {
    if (state === 'Delta' && candidate.senatorial_district) {
      const lgas = DELTA_SENATORIAL_DISTRICTS[candidate.senatorial_district];
      if (lgas) return { scope: 'lgas', lgas: lgas };
    }
    return { scope: 'state', state: state };
  }

  // House of Reps: Target specific LGAs in the federal constituency (if mapped), else fallback to state
  if (office.includes('rep') || office.includes('federal')) {
    if (state === 'Delta' && candidate.federal_constituency) {
      const constituency = candidate.federal_constituency;
      const key = Object.keys(DELTA_FEDERAL_CONSTITUENCIES).find(k => 
        k.split('/').sort().join('/') === constituency.split('/').sort().join('/')
      );
      if (key) return { scope: 'lgas', lgas: DELTA_FEDERAL_CONSTITUENCIES[key] };
    }
    return { scope: 'state', state: state };
  }

  // LGA Chairman: Target specific LGA
  if (office.includes('chairman') || office.includes('lga')) return { scope: 'lga', lga: candidate.lga };

  // Councillor: Target specific Ward
  if (office.includes('councillor') || office.includes('ward')) return { scope: 'ward', lga: candidate.lga, ward: candidate.ward };

  // Default fallback
  return { scope: 'lga', lga: candidate.lga };
}