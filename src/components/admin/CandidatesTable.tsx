'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, CheckCircle, XCircle, X } from 'lucide-react'

type Registration = {
  id: string
  full_name: string
  email: string
  phone: string
  party: string
  position: string
  lga_constituency: string
  state_constituency: string
  status: string
  submitted_at: string
  doc_id_card: string | null
  doc_party_membership: string | null
  doc_nomination_form: string | null
  doc_cert_return: string | null
  doc_other: string | null
  notes: string | null
  gender: string | null
  date_of_birth: string | null
  home_address: string | null
  state_of_origin: string | null
  lga_of_origin: string | null
  ward: string | null
  senatorial_district: string | null
  federal_constituency: string | null
  level: string | null
  campaign_slogan: string | null
  manifesto_summary: string | null
}

export function CandidatesTable({ initialData }: { initialData: Registration[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [notes, setNotes] = useState('')

  const filtered = initialData.filter(r => {
    const matchesSearch = !search || 
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.party.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function updateStatus(id: string, status: 'verified' | 'rejected') {
    const res = await fetch(`/api/admin/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    })
    if (res.ok) {
      alert(`Candidate ${status} successfully!`)
      setSelectedReg(null)
      window.location.reload()
    } else {
      alert('Failed to update status.')
    }
  }

  async function viewDoc(path: string | null, label: string) {
    if (!path) return alert('No document uploaded for this field.')
    const res = await fetch(`/api/admin/candidate-doc?path=${encodeURIComponent(path)}`)
    const data = await res.json()
    if (data.url) {
      window.open(data.url, '_blank')
    } else {
      alert('Failed to generate document link.')
    }
  }

  function downloadCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Party', 'Position', 'Constituency', 'Status', 'Submitted At']
    const rows = filtered.map(r => [
      r.full_name, r.email, r.phone, r.party, r.position, 
      `${r.lga_constituency}, ${r.state_constituency}`, r.status, 
      new Date(r.submitted_at).toLocaleDateString()
    ])
    
    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dico-candidates-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-2xl font-black text-forest">{initialData.length}</p><p className="text-xs text-muted uppercase">Total</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-black text-gold">{initialData.filter(r => r.status === 'pending').length}</p><p className="text-xs text-muted uppercase">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-black text-green-600">{initialData.filter(r => r.status === 'verified').length}</p><p className="text-xs text-muted uppercase">Verified</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-black text-red-600">{initialData.filter(r => r.status === 'rejected').length}</p><p className="text-xs text-muted uppercase">Rejected</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Candidate Registrations</CardTitle>
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input placeholder="Search by name, email, party..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 text-sm bg-white border border-border rounded-lg">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            {/* Added min-w-[800px] to force horizontal scroll on mobile */}
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted">
                  <th className="pb-2 pr-4">Candidate</th>
                  <th className="pb-2 pr-4">Party</th>
                  <th className="pb-2 pr-4">Constituency</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Submitted</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border-light hover:bg-forest-faint/30">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-ink">{r.full_name}</p>
                      <p className="text-xs text-muted">{r.email}</p>
                    </td>
                    <td className="py-3 pr-4 font-medium">{r.party}</td>
                    <td className="py-3 pr-4 text-xs">{r.lga_constituency}, {r.state_constituency}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={r.status === 'verified' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted">{new Date(r.submitted_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedReg(r); setNotes(r.notes || '') }}>
                        <Eye className="h-4 w-4 mr-1" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted">No registrations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReg(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-forest text-white p-5 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold">{selectedReg.full_name}</h3>
                <p className="text-sm text-white/70">{selectedReg.party} · {selectedReg.position}</p>
              </div>
              <button onClick={() => setSelectedReg(null)}><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong className="block text-xs text-muted uppercase mb-1">Email</strong> {selectedReg.email}</div>
                <div><strong className="block text-xs text-muted uppercase mb-1">Phone</strong> {selectedReg.phone}</div>
                <div><strong className="block text-xs text-muted uppercase mb-1">Constituency</strong> {selectedReg.lga_constituency}, {selectedReg.state_constituency}</div>
                <div><strong className="block text-xs text-muted uppercase mb-1">Ward</strong> {selectedReg.ward || 'N/A'}</div>
                <div className="col-span-2"><strong className="block text-xs text-muted uppercase mb-1">Manifesto</strong> <p className="bg-sand p-3 rounded">{selectedReg.manifesto_summary || 'N/A'}</p></div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-bold mb-2">Supporting Documents</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_id_card, 'ID Card')}>View ID Card</Button>
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_party_membership, 'Party Membership')}>View Party Membership</Button>
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_nomination_form, 'Nomination Form')}>View Nomination Form</Button>
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_cert_return, 'Certificate of Return')}>View Certificate</Button>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="text-sm font-bold mb-2">Admin Notes</h4>
                <textarea 
                  className="w-full p-2 border border-border rounded h-24 text-sm" 
                  placeholder="Add internal notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(selectedReg.id, 'verified')}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => updateStatus(selectedReg.id, 'rejected')}>
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}