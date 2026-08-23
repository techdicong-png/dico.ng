'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, CheckCircle, XCircle, X } from 'lucide-react'
import { toast } from 'sonner'

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
    const loadingToast = toast.loading(`Updating candidate status to ${status}...`)
    
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })
      
      if (res.ok) {
        toast.success(`Candidate ${status} successfully!`, { id: loadingToast })
        setSelectedReg(null)
        window.location.reload()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update status.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.', { id: loadingToast })
    }
  }

  async function viewDoc(path: string | null, label: string) {
    if (!path) {
      toast.error(`No document uploaded for ${label}.`)
      return
    }

    const loadingToast = toast.loading(`Generating secure link for ${label}...`)
    
    try {
      const res = await fetch(`/api/admin/candidate-doc?path=${encodeURIComponent(path)}`)
      const data = await res.json()
      
      if (data.url) {
        toast.success(`${label} ready. Opening in new tab...`, { id: loadingToast })
        window.open(data.url, '_blank')
      } else {
        throw new Error('Failed to generate document link.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate document link.', { id: loadingToast })
    }
  }

  function downloadCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Party', 'Position', 'Constituency', 'Status', 'Submitted At']
    const rows = filtered.map(r => [
      r.full_name, r.email, r.phone, r.party, r.position, 
      `${r.lga_constituency}, ${r.state_constituency}`, r.status, 
      new Date(r.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
    
    toast.success('CSV export downloaded successfully.')
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]"><CardContent className="pt-4 md:pt-6"><p className="text-xl md:text-2xl font-black text-forest dark:text-forest-700">{initialData.length}</p><p className="text-xs text-muted dark:text-[#c0d0c4] uppercase">Total</p></CardContent></Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]"><CardContent className="pt-4 md:pt-6"><p className="text-xl md:text-2xl font-black text-gold">{initialData.filter(r => r.status === 'pending').length}</p><p className="text-xs text-muted dark:text-[#c0d0c4] uppercase">Pending</p></CardContent></Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]"><CardContent className="pt-4 md:pt-6"><p className="text-xl md:text-2xl font-black text-green-600">{initialData.filter(r => r.status === 'verified').length}</p><p className="text-xs text-muted dark:text-[#c0d0c4] uppercase">Verified</p></CardContent></Card>
        <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]"><CardContent className="pt-4 md:pt-6"><p className="text-xl md:text-2xl font-black text-red-600">{initialData.filter(r => r.status === 'rejected').length}</p><p className="text-xs text-muted dark:text-[#c0d0c4] uppercase">Rejected</p></CardContent></Card>
      </div>

      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">
          <CardTitle className="text-lg text-ink dark:text-white">Candidate Registrations</CardTitle>
          <Button variant="outline" size="sm" onClick={downloadCSV} className="w-full md:w-auto dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <Input placeholder="Search by name, email, party..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:max-w-sm bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 text-sm bg-white dark:bg-[#0f1d16] dark:text-white border border-border dark:border-[#1f3a2c] rounded-lg w-full md:w-auto">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto pb-2">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border dark:border-[#1f3a2c] text-left text-xs uppercase text-muted dark:text-[#c0d0c4] whitespace-nowrap">
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
                  <tr key={r.id} className="border-b border-border-light dark:border-[#1f3a2c] hover:bg-forest-faint/30 dark:hover:bg-[#1b3a2b]">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-ink dark:text-white whitespace-nowrap">{r.full_name}</p>
                      <p className="text-xs text-muted dark:text-[#c0d0c4] whitespace-nowrap">{r.email}</p>
                    </td>
                    <td className="py-3 pr-4 font-medium whitespace-nowrap text-ink dark:text-white">{r.party}</td>
                    <td className="py-3 pr-4 text-xs whitespace-nowrap text-muted dark:text-[#c0d0c4]">{r.lga_constituency}, {r.state_constituency}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={r.status === 'verified' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'} className="whitespace-nowrap">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted dark:text-[#c0d0c4] whitespace-nowrap">{new Date(r.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="py-3">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedReg(r); setNotes(r.notes || '') }} className="whitespace-nowrap dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">
                        <Eye className="h-4 w-4 mr-1" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted dark:text-[#c0d0c4]">No registrations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReg(null)}>
          <div className="bg-white dark:bg-[#11241b] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-forest text-white p-5 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold">{selectedReg.full_name}</h3>
                <p className="text-sm text-white/70">{selectedReg.party} · {selectedReg.position}</p>
              </div>
              <button onClick={() => setSelectedReg(null)}><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Details */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted dark:text-[#c0d0c4] mb-3 border-b border-border dark:border-[#1f3a2c] pb-1">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Date of Birth</strong> <span className="text-ink dark:text-white">{selectedReg.date_of_birth || 'N/A'}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Gender</strong> <span className="text-ink dark:text-white">{selectedReg.gender || 'N/A'}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Phone</strong> <span className="text-ink dark:text-white">{selectedReg.phone}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Email</strong> <span className="text-ink dark:text-white">{selectedReg.email}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">State of Origin</strong> <span className="text-ink dark:text-white">{selectedReg.state_of_origin || 'N/A'}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">LGA of Origin</strong> <span className="text-ink dark:text-white">{selectedReg.lga_of_origin || 'N/A'}</span></div>
                  <div className="md:col-span-2"><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Home Address</strong> <span className="text-ink dark:text-white">{selectedReg.home_address || 'N/A'}</span></div>
                </div>
              </div>

              {/* Constituency Details */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted dark:text-[#c0d0c4] mb-3 border-b border-border dark:border-[#1f3a2c] pb-1">Constituency Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">State</strong> <span className="text-ink dark:text-white">{selectedReg.state_constituency}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">LGA</strong> <span className="text-ink dark:text-white">{selectedReg.lga_constituency}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Ward</strong> <span className="text-ink dark:text-white">{selectedReg.ward || 'N/A'}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Senatorial District</strong> <span className="text-ink dark:text-white">{selectedReg.senatorial_district || 'N/A'}</span></div>
                  <div className="md:col-span-2"><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Federal Constituency</strong> <span className="text-ink dark:text-white">{selectedReg.federal_constituency || 'N/A'}</span></div>
                </div>
              </div>

              {/* Political Details */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted dark:text-[#c0d0c4] mb-3 border-b border-border dark:border-[#1f3a2c] pb-1">Political Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Party</strong> <span className="text-ink dark:text-white">{selectedReg.party}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Position</strong> <span className="text-ink dark:text-white">{selectedReg.position}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Level</strong> <span className="text-ink dark:text-white">{selectedReg.level || 'N/A'}</span></div>
                  <div><strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Campaign Slogan</strong> <span className="text-ink dark:text-white">{selectedReg.campaign_slogan || 'N/A'}</span></div>
                  <div className="md:col-span-2">
                    <strong className="block text-xs text-muted dark:text-[#c0d0c4] uppercase mb-1">Manifesto Summary</strong> 
                    <p className="bg-sand dark:bg-[#0f1d16] p-3 rounded mt-1 text-ink dark:text-white">{selectedReg.manifesto_summary || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted dark:text-[#c0d0c4] mb-3 border-b border-border dark:border-[#1f3a2c] pb-1">Supporting Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_id_card, 'ID Card')} className="dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">View ID Card</Button>
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_party_membership, 'Party Membership')} className="dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">View Party Membership</Button>
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_nomination_form, 'Nomination Form')} className="dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">View Nomination Form</Button>
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_cert_return, 'Certificate of Return')} className="dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">View Certificate</Button>
                  <Button variant="outline" size="sm" onClick={() => viewDoc(selectedReg.doc_other, 'Other Document')} className="dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]">View Other Doc</Button>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted dark:text-[#c0d0c4] mb-3 border-b border-border dark:border-[#1f3a2c] pb-1">Admin Notes</h4>
                <textarea 
                  className="w-full p-2 border border-border dark:border-[#1f3a2c] bg-white dark:bg-[#0f1d16] text-ink dark:text-white rounded h-24 text-sm focus:outline-none focus:border-forest" 
                  placeholder="Add internal notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-border-light dark:border-[#1f3a2c]">
                {/* 🔴 NEW: Only show Approve if they aren't already verified */}
                {selectedReg.status !== 'verified' && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto" onClick={() => updateStatus(selectedReg.id, 'verified')}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                )}
                
                {/* 🔴 NEW: Only show Reject if they aren't already rejected */}
                {selectedReg.status !== 'rejected' && (
                  <Button variant="destructive" className="w-full md:w-auto" onClick={() => updateStatus(selectedReg.id, 'rejected')}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}