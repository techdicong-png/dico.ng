import geo from '@/data/ward-geo.json'

// Ward centre points for all 8,809 wards (state -> LGA -> [ward, latitude, longitude]).
// Used server-side only. The user's own coordinates are never stored or logged.
type Row = { state: string; lga: string; ward: string; lat: number; lon: number }

// Sokoto/Yabo lists the same ward names as Sokoto/Binji in the source data, so its names cannot be trusted.
const UNRELIABLE = new Set(['Sokoto|Yabo'])

let ROWS: Row[] | null = null
function rows(): Row[] {
  if (ROWS) return ROWS
  ROWS = []
  const g = geo as unknown as Record<string, Record<string, [string, number, number][]>>
  for (const state of Object.keys(g)) for (const lga of Object.keys(g[state])) {
    if (UNRELIABLE.has(`${state}|${lga}`)) continue
    for (const [ward, lat, lon] of g[state][lga]) ROWS.push({ state, lga, ward, lat, lon })
  }
  return ROWS
}

export function inNigeria(lat: number, lon: number) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= 4 && lat <= 14 && lon >= 2.5 && lon <= 15
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function nearestWards(lat: number, lon: number, k = 5) {
  const best: (Row & { km: number })[] = []
  for (const r of rows()) {
    const km = distanceKm(lat, lon, r.lat, r.lon)
    if (best.length < k || km < best[best.length - 1].km) {
      best.push({ ...r, km })
      best.sort((a, b) => a.km - b.km)
      if (best.length > k) best.pop()
    }
  }
  return best.map(b => ({ state: b.state, lga: b.lga, ward: b.ward, lat: b.lat, lon: b.lon, km: Math.round(b.km * 100) / 100 }))
}
