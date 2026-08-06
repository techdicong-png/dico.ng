'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Search, ShieldBan, ShieldCheck } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const token = localStorage.getItem('dico_token')
      // We will use the direct Supabase client to fetch users for now, 
      // but in production, you'd want an /api/admin/users route for strict security.
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

  const filtered = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin Panel
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">User Management</h1>
        <p className="text-sm text-muted">Suspend or activate user accounts.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-sm" />
          </div>
          
          <div className="w-full overflow-x-auto pb-2">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-bold tracking-wider uppercase text-muted">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2 pr-4">CIVICT</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Action</th>
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
                      <Button 
                        size="sm" 
                        variant={u.is_active ? 'destructive' : 'outline'} 
                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                      >
                        {u.is_active ? <ShieldBan className="h-4 w-4 mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </Button>
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