// src/app/(dashboard)/team/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const PERM_BADGES: Record<string, string> = {
  view_analytics: 'bg-forest-light text-forest',
  manage_sessions: 'bg-blue-100 text-blue-800',
  manage_polls: 'bg-blue-100 text-blue-800',
  respond_reports: 'bg-gold-pale text-amber-800',
  manage_team: 'bg-red-100 text-red-800',
}

export default function TeamPage() {
  const router = useRouter()
  const [team, setTeam] = useState<any[]>([])
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }

    async function load() {
      const user = JSON.parse(localStorage.getItem('dico_user') || '{}')
      const cands = await (await fetch('/api/candidates', { headers: { 'Authorization': `Bearer ${token}` } })).json()
      const own = (cands.candidates || []).find((c: any) => c.users?.email === user.email)
      if (!own) return
      setCandidateId(own.id)
      const data = await (await fetch(`/api/team/candidate/${own.id}`, { headers: { 'Authorization': `Bearer ${token}` } })).json()
      setTeam(data.team || [])
    }
    load()
  }, [router])

  async function invite() {
    if (!inviteEmail || !candidateId) return
    const token = localStorage.getItem('dico_token')
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ email: inviteEmail, candidate_id: candidateId, permissions: ['view_analytics', 'manage_sessions'] }),
    })
    const data = await res.json()
    if (!res.ok) { setInviteMsg(data.error || 'Failed'); return }
    setInviteMsg(`${data.message} ✓`)
    setInviteEmail('')
  }

  async function remove(memberId: string) {
    if (!confirm('Remove this team member?')) return
    const token = localStorage.getItem('dico_token')
    await fetch(`/api/team/${memberId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    setTeam(team.filter(m => m.id !== memberId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
            Campaign Team
          </span>
          <h1 className="font-serif text-2xl font-black text-ink">Your Team</h1>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button className="bg-forest hover:bg-forest-mid">+ Invite Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              <Button onClick={invite} className="w-full bg-forest hover:bg-forest-mid">Send Invitation</Button>
              {inviteMsg && <p className="text-sm text-muted-text">{inviteMsg}</p>}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {team.length === 0 ? (
            <p className="text-sm text-muted-text text-center py-8">No team members yet.</p>
          ) : (
            <div className="space-y-3">
              {team.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-forest text-white font-serif text-sm font-bold flex items-center justify-center">
                      {(m.users?.full_name || '?')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{m.users?.full_name}</p>
                      <p className="text-xs text-muted-text">{m.users?.email}</p>
                      <div className="flex gap-1 mt-1">
                        {(m.permissions || []).map((p: string) => (
                          <Badge key={p} variant="secondary" className={`text-[10px] ${PERM_BADGES[p] || ''}`}>
                            {p.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => remove(m.id)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
