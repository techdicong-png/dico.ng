'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollReveal } from '@/components/sections/ScrollReveal'
import { Upload, Loader2, Image as ImageIcon, Megaphone, X, Check, ChevronDown } from 'lucide-react'
import { NIGERIA_DATA } from '@/data/nigeria'
import { toast } from 'sonner'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ACTIVE_STATES = ['Edo', 'Delta', 'FCT Abuja', 'Nasarawa']

export default function AdvertisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  
  const [form, setForm] = useState({
    business_name: '', 
    description: '',
    link_url: ''
  })

  const [openState, setOpenState] = useState<string | null>(null)
  const [selectedLgas, setSelectedLgas] = useState<string[]>([])

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) {
      toast.error('Please log in to submit an advertisement.')
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  const toggleLga = (lga: string) => {
    setSelectedLgas(prev => 
      prev.includes(lga) ? prev.filter(l => l !== lga) : [...prev, lga]
    )
  }

  const selectAllLgas = (state: string) => {
    const stateLgas = Object.keys(NIGERIA_DATA[state] || {})
    const allSelected = stateLgas.every(lga => selectedLgas.includes(lga))
    
    if (allSelected) {
      // Remove all LGAs of this state
      setSelectedLgas(prev => prev.filter(lga => !stateLgas.includes(lga)))
    } else {
      // Add all LGAs of this state
      setSelectedLgas(prev => Array.from(new Set([...prev, ...stateLgas])))
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Max 2MB.')
      return
    }

    setUploading(true)
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')
    const ext = file.name.split('.').pop()
    const path = `${user.id || 'anon'}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('advertisements').upload(path, file)
    if (error) {
      toast.error('Upload failed.')
    } else {
      const { data } = supabase.storage.from('advertisements').getPublicUrl(path)
      setImageUrl(data.publicUrl)
      toast.success('Banner uploaded.')
    }
    setUploading(false)
  }

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!imageUrl || !form.business_name || !form.link_url || selectedLgas.length === 0) {
      toast.error('Please fill all fields and select at least one LGA.')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('dico_token')
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')

    // Derive selected states from the selected LGAs
    const targetStates = ACTIVE_STATES.filter(state => 
      Object.keys(NIGERIA_DATA[state] || {}).some(lga => selectedLgas.includes(lga))
    )

    try {
      const res = await fetch('/api/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          ...form, 
          image_url: imageUrl, 
          user_id: user.id,
          target_states: targetStates,
          target_lgas: selectedLgas
        })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Ad submitted! It will appear once approved by Admin.')
        
        // Dynamically redirect to the correct dashboard based on user role
        const dashboardPath = user.role === 'candidate' ? '/dashboard/candidate' : user.role === 'admin' ? '/admin' : '/dashboard/voter';
                            
        router.push(dashboardPath)
      } else {
        throw new Error(data.error || 'Failed to submit')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  if (!isAuthed) return null

  return (
    <div className="min-h-screen bg-sand py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
              <Megaphone className="h-6 w-6 text-gold" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-black text-ink mb-2">Advertise on DICO</h1>
            <p className="text-muted text-sm md:text-base max-w-md mx-auto">
              Reach thousands of verified voters. Target specific Local Government Areas.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-forest" /> Submit Your Ad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Image Upload */}
                <div>
                  <Label className="mb-2 block">Advert Banner (Max 2MB)</Label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border rounded-md hover:border-forest transition-colors cursor-pointer">
                    <div className="space-y-1 text-center">
                      {imageUrl ? (
                        <div className="relative inline-block">
                          <Image src={imageUrl} alt="Preview" width={300} height={128} className="max-h-40 mx-auto rounded shadow-sm" />
                          <button type="button" onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {uploading ? <Loader2 className="mx-auto h-10 w-10 text-muted animate-spin" /> : <ImageIcon className="mx-auto h-10 w-10 text-muted" />}
                          <div className="flex text-sm text-muted justify-center">
                            <label htmlFor="ad-image" className="relative cursor-pointer bg-white rounded-md font-medium text-forest hover:text-gold">
                              <span>{uploading ? 'Uploading...' : 'Upload a file'}</span>
                              <input id="ad-image" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                            </label>
                          </div>
                          <p className="text-xs text-muted">PNG, JPG, WEBP up to 2MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name">Business / Campaign Name</Label>
                    <Input id="business_name" name="business_name" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="link_url">Website Link (https://...)</Label>
                    <Input id="link_url" name="link_url" type="url" value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} required className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Ad Description (Optional)</Label>
                  <Textarea id="description" name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="A short call-to-action for voters..." className="mt-1.5" />
                </div>

                {/* Selected LGAs Chips */}
                {selectedLgas.length > 0 && (
                  <div className="bg-forest-light/50 border border-forest-light p-3 rounded-lg">
                    <p className="text-xs font-bold text-forest mb-2">{selectedLgas.length} LGAs Selected:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLgas.map(lga => (
                        <button 
                          type="button" 
                          key={lga} 
                          onClick={() => toggleLga(lga)}
                          className="flex items-center gap-1 bg-white border border-forest text-forest text-xs font-medium px-2 py-1 rounded-full hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-colors"
                        >
                          {lga} <X className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accordion State/LGA Selector */}
                <div>
                  <Label className="mb-2 block">Select Target Location(s)</Label>
                  <div className="space-y-2">
                    {ACTIVE_STATES.map(state => {
                      const stateLgas = Object.keys(NIGERIA_DATA[state] || {}).sort()
                      const isAllSelected = stateLgas.every(lga => selectedLgas.includes(lga))
                      
                      return (
                        <div key={state} className="border border-border rounded-lg overflow-hidden">
                          <button 
                            type="button" 
                            className="w-full p-3 flex items-center justify-between bg-white hover:bg-sand transition-colors"
                            onClick={() => setOpenState(openState === state ? null : state)}
                          >
                            <span className="font-semibold text-ink text-sm">{state} State</span>
                            <div className="flex items-center gap-2">
                              {/* Select All Button */}
                              {openState === state && (
                                <span 
                                  className="text-xs font-semibold text-forest bg-forest-light px-2 py-1 rounded"
                                  onClick={(e) => { e.stopPropagation(); selectAllLgas(state) }}
                                >
                                  {isAllSelected ? 'Deselect All' : 'Select All'}
                                </span>
                              )}
                              <ChevronDown className={`h-4 w-4 text-muted transition-transform ${openState === state ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          
                          {openState === state && (
                            <div className="p-3 bg-sand border-t border-border flex flex-wrap gap-2 animate-slide-down">
                              {stateLgas.map(lga => (
                                <button 
                                  type="button" 
                                  key={lga} 
                                  onClick={() => toggleLga(lga)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    selectedLgas.includes(lga) 
                                      ? 'bg-forest text-white border-forest' 
                                      : 'bg-white text-muted border-border hover:border-forest'
                                  }`}
                                >
                                  {selectedLgas.includes(lga) && <Check className="inline h-3 w-3 mr-1" />}
                                  {lga}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-forest hover:bg-forest-mid h-11" disabled={loading || uploading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Megaphone className="h-4 w-4 mr-2" />}
                    Submit for Approval
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  )
}