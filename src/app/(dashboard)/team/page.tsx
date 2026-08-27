'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Shield, Mail, Plus, X, ChevronRight, BadgeCheck } from 'lucide-react'

type TeamMember = {
  id: string
  full_name: string
  email: string
  role_label: string
  added_at: string
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', desc: 'Full access — manage sessions, posts, team' },
  { value: 'editor', label: 'Editor', desc: 'Can create posts and respond to questions' },
  { value: 'analyst', label: 'Analyst', desc: 'View analytics and reports only' },
  { value: 'moderator', label: 'Moderator', desc: 'Moderate chat and Q&A during live sessions' },
]

export default function TeamPage() {
  const router = useRouter()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviteMsg, setInviteMsg] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    loadMembers()
  }, [router])

  async function loadMembers() {
    const token = localStorage.getItem('dico_token')
    try {
      const data = await (await fetch('/api/team', { headers: { 'Authorization': `Bearer ${token}` } })).json()
      setMembers(data.members || [])
    } catch {}
    setLoading(false)
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return
    setInviteMsg('')
    const token = localStorage.getItem('dico_token')
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) { setInviteMsg(data.error || 'Failed'); return }
      setInviteMsg('✅ Invitation sent!')
      setInviteEmail('')
      setTimeout(() => setShowInvite(false), 1500)
      loadMembers()
    } catch { setInviteMsg('Network error') }
  }

  async function removeMember(id: string) {
    const token = localStorage.getItem('dico_token')
    try {
      await fetch(`/api/team/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      setMembers(members.filter(m => m.id !== id))
    } catch {}
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Campaign Team
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Your Team</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">Manage your campaign staff — invite, assign roles, control access.</p>
      </div>

      {/* Invite button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-ink dark:text-white font-semibold">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </p>
        <button onClick={() => setShowInvite(!showInvite)}
          className="bg-forest hover:bg-forest-mid text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all inline-flex items-center gap-2">
          {showInvite ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showInvite ? 'Cancel' : 'Invite Member'}
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-ink dark:text-white">Invite Team Member</h3>
          <div>
            <label className="text-xs font-semibold text-ink dark:text-white mb-1 block">Email Address</label>
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60 dark:placeholder:text-[#c0d0c4]/60"
              placeholder="colleague@example.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink dark:text-white mb-1 block">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map(r => (
                <button key={r.value} onClick={() => setInviteRole(r.value)}
                  className={`text-left p-3 rounded-lg border text-sm transition-all ${
                    inviteRole === r.value
                      ? 'border-forest bg-forest-light dark:bg-[#1b3a2b] text-ink dark:text-white'
                      : 'border-border dark:border-[#1f3a2c] text-muted dark:text-[#c0d0c4] hover:border-forest/30 dark:hover:border-forest-700'
                  }`}>
                  <p className="font-semibold text-ink dark:text-white">{r.label}</p>
                  <p className="text-[10px] text-muted dark:text-[#c0d0c4] mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={sendInvite}
            className="bg-forest hover:bg-forest-mid text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
            Send Invitation
          </button>
          {inviteMsg && <p className={`text-sm ${inviteMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{inviteMsg}</p>}
        </div>
      )}

      {/* Team list */}
      {loading ? (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
          <div className="w-5 h-5 border-2 border-forest dark:border-forest-700 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
          <Users className="h-10 w-10 text-muted dark:text-[#c0d0c4] mx-auto mb-3" />
          <p className="text-sm text-muted dark:text-[#c0d0c4]">No team members yet. Invite your campaign staff.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map(m => {
            const role = ROLE_OPTIONS.find(r => r.value === m.role_label)
            return (
              <div key={m.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-4 flex items-center gap-4 hover:border-forest/30 dark:hover:border-forest-700 transition-all">
                <div className="w-10 h-10 rounded-full bg-forest-light dark:bg-[#1b3a2b] text-forest dark:text-forest-700 flex items-center justify-center font-serif font-bold text-base shrink-0">
                  {m.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink dark:text-white">{m.full_name}</p>
                  <p className="text-xs text-muted dark:text-[#c0d0c4] flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {m.email}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-forest-light dark:bg-[#1b3a2b] text-forest dark:text-forest-700 px-2 py-0.5 rounded">
                    {role?.label || m.role_label}
                  </span>
                  <p className="text-[10px] text-muted dark:text-[#c0d0c4] mt-1">
                    Added {new Date(m.added_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button onClick={() => removeMember(m.id)}
                  className="text-muted dark:text-[#c0d0c4] hover:text-red-500 p-1 rounded transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Role guide */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5">
        <h3 className="text-xs font-bold tracking-widest uppercase text-muted dark:text-[#c0d0c4] mb-3">Role Permissions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLE_OPTIONS.map(r => (
            <div key={r.value} className="text-center p-3 bg-forest-faint dark:bg-[#0f1d16] rounded-lg">
              <Shield className="h-4 w-4 text-forest dark:text-forest-700 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-ink dark:text-white">{r.label}</p>
              <p className="text-[10px] text-muted dark:text-[#c0d0c4] mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}