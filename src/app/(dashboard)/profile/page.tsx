'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Input } from '@/components/ui/input'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ 
    full_name: '', phone: '', state: '', lga: '', ward: '', bio: '', avatar_url: '' 
  })

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    
    fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user)
          setForm({
            full_name: d.user.full_name || '',
            phone: d.user.phone || '',
            state: d.user.state || '',
            lga: d.user.lga || '',
            ward: d.user.ward || '',
            bio: d.user.bio || '',
            avatar_url: d.user.avatar_url || ''
          })
        }
      })
      .catch(() => toast.error('Failed to load profile data.'))
  }, [router])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    
    const { error } = await supabase.storage.from('candidate-avatars').upload(path, file)
    if (error) {
      toast.error('Avatar upload failed.')
    } else {
      const { data } = supabase.storage.from('candidate-avatars').getPublicUrl(path)
      setForm(prev => ({ ...prev, avatar_url: data.publicUrl }))
      toast.success('Profile picture updated. Click Save Changes.')
    }
    setUploading(false)
  }

  async function save() {
    setLoading(true)
    const token = localStorage.getItem('dico_token')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      
      const updatedUser = { ...JSON.parse(localStorage.getItem('dico_user') || '{}'), ...data.user }
      localStorage.setItem('dico_user', JSON.stringify(updatedUser))
      
      toast.success('Profile updated successfully!')
      window.location.reload()
      
    } catch (err: any) {
      toast.error(err.message || 'Network error: Could not reach server.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return (
    <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
      <p className="text-sm text-muted dark:text-[#c0d0c4]">Loading...</p>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          My Account
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Profile</h1>
      </div>

      {/* Profile Header with Avatar Upload */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="pt-5 px-5 pb-5 flex items-center gap-6 flex-wrap">
          <div className="relative w-20 h-20 rounded-full bg-forest text-white font-serif text-2xl font-black flex items-center justify-center shrink-0 overflow-hidden border-2 border-dashed border-border dark:border-[#1f3a2c]">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
             form.avatar_url ? <Image src={form.avatar_url} alt={form.full_name} width={80} height={80} className="w-full h-full object-cover" /> : 
             form.full_name?.charAt(0)}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-ink dark:text-white">{form.full_name || 'User'}</h2>
            <p className="text-sm text-muted dark:text-[#c0d0c4]">{user.email}</p>
            <p className="text-xs text-forest dark:text-forest-700 mt-1 flex items-center gap-1 cursor-pointer">
              <Upload className="h-3 w-3" /> Click image to upload new avatar
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="text-base font-bold text-ink dark:text-white">Edit Profile</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white mb-1.5 block">Full Name</label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white mb-1.5 block">Phone</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white mb-1.5 block">State</label>
              <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink dark:text-white mb-1.5 block">LGA</label>
              <Input value={form.lga} onChange={e => setForm({...form, lga: e.target.value})} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-white mb-1.5 block">Ward</label>
            <Input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink dark:text-white mb-1.5 block">Bio</label>
            <textarea 
              value={form.bio} 
              onChange={e => setForm({...form, bio: e.target.value})} 
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm text-ink dark:text-white bg-white dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 resize-y" 
            />
          </div>
          <button onClick={save} disabled={loading}
            className="bg-forest hover:bg-forest-mid text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}