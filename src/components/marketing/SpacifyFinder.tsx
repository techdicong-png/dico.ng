'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NIGERIA_DATA } from '@/data/nigeria'

type Ward = { state: string; lga: string; ward: string; lat: number; lon: number; km: number }
type Unit = { code: string | null; name: string; state: string; lga: string; ward: string; latitude: number; longitude: number; km: number }
type Plan = { denomination: number; days: number; price: number | null }
type Access = { active: boolean; expires_at: string | null; via: string | null; plans: Plan[] }

const field = 'h-11 w-full rounded-lg border border-mint-line bg-white px-3 text-sm text-ink outline-none focus:border-gold'
const dist = (km: number) => km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
const dirUrl = (lat: number, lon: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
const embed = (lat: number, lon: number) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.012},${lat - 0.008},${lon + 0.012},${lat + 0.008}&layer=mapnik&marker=${lat},${lon}`
const days = (n: number) => n === 1 ? '1 day' : `${n} days`

export function SpacifyFinder() {
  const [access, setAccess] = useState<Access | null>(null)
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [wards, setWards] = useState<Ward[] | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [saved, setSaved] = useState('')
  const [st, setSt] = useState('')
  const [lga, setLga] = useState('')
  const [ward, setWard] = useState('')

  const loadAccess = () => fetch('/api/spacify/access').then(r => r.json()).then(setAccess).catch(() => setAccess({ active: false, expires_at: null, via: null, plans: [] }))
  useEffect(() => { loadAccess() }, [])

  async function unlock(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setUnlocking(true)
    try {
      const res = await fetch('/api/services/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, phone, service: 'spacify' }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not unlock')
      setCode(''); await loadAccess()
    } catch (err: any) { setError(err.message) } finally { setUnlocking(false) }
  }

  function locate() {
    setError(''); setSaved('')
    if (!navigator.geolocation) return setError('Your browser cannot share its location. Pick your ward below instead.')
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const res = await fetch(`/api/spacify/nearby?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          const d = await res.json()
          if (res.status === 402) { await loadAccess(); throw new Error('Your Spacify access has ended. Redeem a voucher to continue.') }
          if (!res.ok) throw new Error(d.error || 'Could not look up your location')
          setWards(d.wards); setUnits(d.pollingUnits || [])
        } catch (e: any) { setError(e.message) } finally { setBusy(false) }
      },
      err => {
        setBusy(false)
        setError(err.code === 1
          ? 'Location is blocked. Allow it in your browser settings, or pick your ward below instead.'
          : 'We could not get your location. Move to an open area and try again, or pick your ward below.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  async function save(s: string, l: string, w: string) {
    setError(''); setSaved('')
    const res = await fetch('/api/spacify/set-location', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: s, lga: l, ward: w }) })
    const d = await res.json()
    if (res.ok) setSaved(`Saved: ${w}, ${l}, ${s}`)
    else setError(res.status === 401 ? 'Please sign in first, then save your location.' : d.error || 'Could not save')
  }

  const top = wards?.[0]
  const lgas = st ? Object.keys(NIGERIA_DATA[st] || {}).sort() : []
  const wardList = st && lga ? NIGERIA_DATA[st]?.[lga] || [] : []

  return (
    <div className="space-y-4">
      {access === null && <p className="text-sm text-muted text-center">Loading...</p>}

      {access && !access.active && (
        <form onSubmit={unlock} className="bg-white border border-gold/40 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-ink">Unlock DICO Spacify</h2>
          <p className="text-xs text-muted">Spacify finds your nearest ward and polling area from your location. Open it with a DICO voucher. No account needed.</p>
          {access.plans.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {access.plans.map(p => (
                <div key={p.denomination} className="rounded-lg bg-mint/50 px-3 py-2 text-xs">
                  <span className="font-bold text-ink">{p.denomination} CIVICT voucher</span>
                  <span className="block text-muted">{days(p.days)} of access{p.price ? ` · ₦${p.price.toLocaleString()}` : ''}</span>
                </div>
              ))}
            </div>
          )}
          <input className={`${field} font-mono tracking-wider uppercase`} placeholder="ED-XXXX-XXXX-XXXX" value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" />
          <input className={field} inputMode="tel" placeholder="Your phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full h-11" disabled={unlocking || code.trim().length < 8 || phone.replace(/\D/g, '').length < 10}>{unlocking ? 'Checking…' : 'Unlock Spacify'}</Button>
          <p className="text-[11px] text-muted">
            Used a code before? Enter the same code and phone number to open Spacify on this device (up to 3 devices). <Link href="/buy-voucher" className="underline text-ink">Buy a voucher</Link>
          </p>
        </form>
      )}

      {access?.active && (
        <>
          <div className="bg-white border border-mint-line rounded-xl p-5 space-y-3">
            <p className="text-[11px] text-forest font-semibold">
              {access.via === 'admin' ? 'Admin access' : `Spacify is open until ${new Date(access.expires_at!).toLocaleString()}`}
            </p>
            <Button className="w-full h-11" onClick={locate} disabled={busy}>{busy ? 'Finding you…' : 'Use my location'}</Button>
            <p className="text-[11px] text-muted">
              Your phone will ask permission first. Your location is used once to find the nearest places. It is not saved, not shared, and nobody else can see it.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && <p className="text-sm text-forest font-semibold">{saved}</p>}
          </div>

          {wards && (
            <div className="bg-white border border-mint-line rounded-xl p-5 space-y-3">
              {units.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-bold text-ink text-sm">Nearest polling units</h2>
                  {units.map((u, i) => (
                    <div key={i} className="rounded-lg border border-mint-line p-3 text-sm">
                      <p className="font-semibold text-ink">{u.name}</p>
                      <p className="text-xs text-muted">{u.ward}, {u.lga}, {u.state} · {dist(u.km)} away</p>
                      <a href={dirUrl(u.latitude, u.longitude)} target="_blank" rel="noopener noreferrer" className="text-xs underline text-ink">Directions</a>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="font-bold text-ink text-sm">Nearest wards</h2>
              {top && top.km > 25 && <p className="text-xs text-red-600">The nearest mapped ward is {dist(top.km)} away. You may be outside the mapped area.</p>}
              {wards.map((w, i) => (
                <div key={i} className="rounded-lg border border-mint-line p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-semibold text-ink text-sm">{w.ward}</p><p className="text-xs text-muted">{w.lga}, {w.state}</p></div>
                    <p className="text-xs font-semibold text-ink shrink-0">{dist(w.km)}</p>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <a href={dirUrl(w.lat, w.lon)} target="_blank" rel="noopener noreferrer" className="text-xs underline text-ink">Directions</a>
                    <button onClick={() => save(w.state, w.lga, w.ward)} className="text-xs underline text-forest font-semibold">This is my ward</button>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-muted">Wards are matched by their centre point, so near a boundary the nearest ward may not be yours. Check the name before you save.</p>
              {top && <iframe title="Nearest ward on the map" loading="lazy" src={embed(top.lat, top.lon)} className="w-full h-56 rounded-lg border border-mint-line" />}
              {top && <p className="text-[11px] text-muted">The map shows the centre of the nearest ward, not your position.</p>}
            </div>
          )}
        </>
      )}

      <div className="bg-white border border-mint-line rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-ink text-sm">Choose your ward (free)</h2>
        <select className={field} value={st} onChange={e => { setSt(e.target.value); setLga(''); setWard('') }}>
          <option value="">State</option>{Object.keys(NIGERIA_DATA).sort().map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={field} value={lga} onChange={e => { setLga(e.target.value); setWard('') }} disabled={!st}>
          <option value="">LGA</option>{lgas.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className={field} value={ward} onChange={e => setWard(e.target.value)} disabled={!lga}>
          <option value="">Ward</option>{wardList.map(w => <option key={w}>{w}</option>)}
        </select>
        <Button variant="outline" className="w-full" disabled={!ward} onClick={() => save(st, lga, ward)}>Save as my location</Button>
        {!access?.active && error && <p className="text-sm text-red-600">{error}</p>}
        {!access?.active && saved && <p className="text-sm text-forest font-semibold">{saved}</p>}
        <p className="text-[11px] text-muted">Saving your location sets which candidates you see. <Link href="/login" className="underline">Sign in</Link> first if you have not.</p>
      </div>
    </div>
  )
}
