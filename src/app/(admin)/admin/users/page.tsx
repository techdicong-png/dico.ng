'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Search, ShieldBan, ShieldCheck, Wallet } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fundingId, setFundingId] = useState<string | null>(null)
  const [fundAmount, setFundAmount] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const token = localStorage.getItem('dico_token')
      const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      toast.error('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleUserStatus(id: string, currentStatus: boolean) {
    const loadingToast = toast.loading('Updating user status...')
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      if (res.ok) {
        toast.success(`User ${!currentStatus ? 'activated' : 'suspended'}!`, { id: loadingToast })
        setUsers(users.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u))
      } else {
        throw new Error('Failed to update user.')
      }
    } catch {
      toast.error('Failed to update user.', { id: loadingToast })
    }
  }

  async function fundAccount(id: string) {
    const amount = parseInt(fundAmount)
    if (!amount || amount <= 0) return toast.error('Enter a valid amount')

    const loadingToast = toast.loading(`Funding account with ${amount} CIVICT...`)
    try {
      const token = localStorage.getItem('dico_token')
      const res = await fetch('/api/admin/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: id, amount })
      })
      
      if (res.ok) {
        const data = await res.json()
        toast.success(`Account funded successfully! New balance: ${data.newBalance}`, { id: loadingToast })
        setUsers(users.map(u => u.id === id ? { ...u, civict_balance: data.newBalance } : u))
        setFundingId(null)
        setFundAmount('')
      } else {
        throw new Error('Failed to fund account.')
      }
    } catch {
      toast.error('Failed to fund account.', { id: loadingToast })
    }
  }

  const filtered = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
            Admin Panel
          </span>
          <h1 className="font-serif text-2xl font-black text-ink">User Management</h1>
          <p className="text-sm text-muted">Suspend, activate, or fund user accounts.</p>
        </div>
        {/* Added Logout Button for Admin */}
        <Button variant="outline" onClick={() => { localStorage.clear(); window.location.href = '/login' }}>
          Logout Admin
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-sm" />
          </div>
          
          <div className="w-full overflow-x-auto pb-2">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-bold tracking-wider uppercase text-muted">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2 pr-4">CIVICT</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-border-light">
                    <td className="py-3 pr-4 font-semibold text-ink">{u.full_name}</td>
                    <td className="py-3 pr-4 text-muted">{u.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                    </td>
                    <td className="py-3 pr-4 font-bold text-forest">₡ {u.civict_balance || 0}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.is_active ? 'default' : 'destructive'} className="text-[10px]">
                        {u.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-2">
                        {fundingId === u.id ? (
                          <div className="flex gap-2">
                            <Input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="Amount" className="h-8 w-24" />
                            <Button size="sm" className="bg-forest hover:bg-forest-mid" onClick={() => fundAccount(u.id)}>Send</Button>
                            <Button size="sm" variant="ghost" onClick={() => setFundingId(null)}>X</Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setFundingId(u.id); setFundAmount('') }}>
                              <Wallet className="h-4 w-4 mr-1" /> Fund
                            </Button>
                            <Button size="sm" variant={u.is_active ? 'destructive' : 'outline'} onClick={() => toggleUserStatus(u.id, u.is_active)}>
                              {u.is_active ? <ShieldBan className="h-4 w-4 mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
                              {u.is_active ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}