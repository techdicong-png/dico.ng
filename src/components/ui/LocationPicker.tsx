'use client'

import { useState } from 'react'
import { NIGERIA_DATA, STATES } from '@/data/nigeria'

interface LocationPickerProps {
  onLocationChange: (state: string, lga: string, ward: string) => void
  defaultState?: string
  defaultLga?: string
  defaultWard?: string
}

export function LocationPicker({ onLocationChange, defaultState, defaultLga, defaultWard }: LocationPickerProps) {
  const [selectedState, setSelectedState] = useState(defaultState || '')
  const [selectedLga, setSelectedLga] = useState(defaultLga || '')
  const [selectedWard, setSelectedWard] = useState(defaultWard || '')

  const lgas = selectedState ? Object.keys(NIGERIA_DATA[selectedState] || {}).sort() : []
  const wards = selectedState && selectedLga ? (NIGERIA_DATA[selectedState][selectedLga] || []) : []

  function handleStateChange(value: string) {
    setSelectedState(value)
    setSelectedLga('')
    setSelectedWard('')
    onLocationChange(value, '', '')
  }

  function handleLgaChange(value: string) {
    setSelectedLga(value)
    setSelectedWard('')
    onLocationChange(selectedState, value, '')
  }

  function handleWardChange(value: string) {
    setSelectedWard(value)
    onLocationChange(selectedState, selectedLga, value)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-[#0D1B12]">State</label>
        <select value={selectedState} onChange={e => handleStateChange(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-[#D8E4DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D2B]">
          <option value="">Select state</option>
          {STATES.map(s => <option key={s} value={s}>{s} State</option>)}
        </select>
      </div>
      {selectedState && (
        <div>
          <label className="text-sm font-semibold text-[#0D1B12]">Local Government Area</label>
          <select value={selectedLga} onChange={e => handleLgaChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-[#D8E4DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D2B]">
            <option value="">Select LGA</option>
            {lgas.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      )}
      {selectedLga && wards.length > 0 && (
        <div>
          <label className="text-sm font-semibold text-[#0D1B12]">Ward</label>
          <select value={selectedWard} onChange={e => handleWardChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-[#D8E4DC] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D2B]">
            <option value="">Select ward</option>
            {wards.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}
