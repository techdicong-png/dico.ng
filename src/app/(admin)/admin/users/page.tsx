// src/app/(admin)/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => setUsers(d.users || []))
  }, [])

  async function toggleUser(id: string, active: boolean) {
    const token = localStorage.getItem('dico_token')
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_active: !active }),
    })
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !active } : u))
  }

  const filtered = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded inline-block mb-2">
          Admin
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">User Management</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-bold tracking-wider uppercase text-[#3D5246]">
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
                    <td className="py-3 pr-4 text-[#3D5246]">{u.email}</td>
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
                      <Button size="sm" variant="outline" onClick={() => toggleUser(u.id, u.is_active)}>
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
