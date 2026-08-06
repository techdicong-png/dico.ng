'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Plus, X, Loader2, Radio, MapPin, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
// NEW: Import the PostCard component
import { PostCard } from '@/components/dashboard/PostCard'

// Initialize Supabase client inline
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PromiseType = {
  id: string; text: string; status: 'fulfilled' | 'in-progress' | 'pending'; note: string | null
}

export function CandidateHub({ candidateId, initialName, candidateLga, avatarUrl }: { candidateId: string, initialName: string, candidateLga: string, avatarUrl?: string }) {  const [posts, setPosts] = useState<any[]>([])
  const [promises, setPromises] = useState<PromiseType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Composer state
  const [postText, setPostText] = useState('')
  const [postMedia, setPostMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  // Promise inline input state
  const [isAddingPromise, setIsAddingPromise] = useState(false)
  const [newPromiseText, setNewPromiseText] = useState('')

  // Live modal state
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false)
  const [liveTitle, setLiveTitle] = useState('')

  const lgaSlug = candidateLga.toLowerCase().replace(/\s/g, '-')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [postsRes, promisesRes] = await Promise.all([
        supabase.from('posts').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
        supabase.from('candidate_promises').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false })
      ])
      
      if (postsRes.data) setPosts(postsRes.data)
      if (promisesRes.data) setPromises(promisesRes.data as PromiseType[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Show local preview immediately so it doesn't look broken
    const localPreviewUrl = URL.createObjectURL(file)
    setPostMedia({
      url: localPreviewUrl,
      type: file.type.startsWith('video') ? 'video' : 'image'
    })

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${candidateId}/${Date.now()}.${ext}`
    
    // Upload to the new public 'candidate-posts' bucket
    const { error } = await supabase.storage.from('candidate-posts').upload(path, file)
    if (error) {
      toast.error('Upload failed. Please try again.')
      setPostMedia(null) // Remove preview if upload fails
    } else {
      const { data } = supabase.storage.from('candidate-posts').getPublicUrl(path)
      // Replace local preview with the permanent Supabase URL
      setPostMedia({
        url: data.publicUrl,
        type: file.type.startsWith('video') ? 'video' : 'image'
      })
      toast.success('Media attached.')
    }
    setUploading(false)
  }

  async function submitPost() {
    if (!postText && !postMedia) return
    setPosting(true)
    
    const { data: newPost, error } = await supabase.from('posts').insert({
      candidate_id: candidateId,
      content: postText,
      image_url: postMedia?.url || null,
    }).select().single()

    if (!error && newPost) {
      setPosts([newPost, ...posts])
      setPostText('')
      setPostMedia(null)
      toast.success('Post published successfully!')
    } else {
      toast.error('Failed to publish post.')
    }
    setPosting(false)
  }

  async function addPromise() {
    if (!newPromiseText) return
    
    const { data, error } = await supabase.from('candidate_promises').insert({
      candidate_id: candidateId,
      text: newPromiseText,
      status: 'pending'
    }).select().single()

    if (!error && data) {
      setPromises([data, ...promises])
      setNewPromiseText('')
      setIsAddingPromise(false)
      toast.success('Promise added.')
    } else {
      toast.error('Failed to add promise.')
    }
  }

  async function updatePromiseStatus(id: string, status: any) {
    await supabase.from('candidate_promises').update({ status }).eq('id', id)
    setPromises(promises.map(p => p.id === id ? { ...p, status } : p))
  }

  function startLive() {
    setIsLiveModalOpen(true)
  }

  function endLive() {
    setIsLiveModalOpen(false)
    setLiveTitle('')
    toast.success('Live session ended. (In production, a replay would be saved to your feed)')
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-forest" /></div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Profile Header */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-br from-forest to-forest-mid"></div>
        <div className="px-6 pb-6 -mt-12 flex items-start md:items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="w-24 h-24 rounded-full bg-white border-4 border-black/10 flex items-center justify-center font-serif text-4xl font-black text-forest shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white border-4 border-black/10 flex items-center justify-center font-serif text-4xl font-black text-forest shrink-0">
                {initialName.charAt(0)}
              </div>
            )}
            <div className="pb-2">
              <h1 className="font-serif text-sm md:text-2xl font-black text-ink flex flex-col md:flex-row items-start md:items-center gap-2">
                {initialName}
                <span className="text-xs font-bold bg-forest-light text-forest px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              </h1>
              <p className="text-sm text-muted pt-6">Candidate Profile & Media Hub</p>
              
              <Link 
                href={`/lga/${lgaSlug}`} 
                className="text-xs font-normal md:font-semibold text-gold hover:underline inline-flex items-center gap-1 bg-gold/10 px-2 py-1 rounded whitespace-nowrap"
              >
                <MapPin className="h-3 w-3" /> View {candidateLga} LGA Hub & Ads
              </Link>
            </div>
          </div>
          <Button onClick={startLive} className="bg-red-600 hover:bg-red-700 text-white">
            <Radio className="h-4 w-4 mr-2 animate-pulse" /> Go Live
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Promises */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-bold text-ink">Campaign Promises</h3>
              <button onClick={() => setIsAddingPromise(!isAddingPromise)} className="text-forest hover:bg-forest-faint p-1 rounded">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {isAddingPromise && (
              <div className="mb-4 flex flex-col gap-2 animate-slide-down">
                <Textarea 
                  value={newPromiseText} 
                  onChange={(e) => setNewPromiseText(e.target.value)} 
                  placeholder="What do you promise to achieve?" 
                  rows={2}
                  className="text-sm"
                />
                <Button size="sm" onClick={addPromise} className="bg-forest hover:bg-forest-mid w-full">Add Promise</Button>
              </div>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {promises.length === 0 && <p className="text-sm text-muted">No promises added yet.</p>}
              {promises.map(p => (
                <div key={p.id} className="border-l-4 border-forest pl-3 py-1">
                  <p className="text-sm font-medium text-ink">{p.text}</p>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => updatePromiseStatus(p.id, 'fulfilled')} 
                      className={`text-[10px] px-2 py-0.5 rounded ${p.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      Fulfilled
                    </button>
                    <button 
                      onClick={() => updatePromiseStatus(p.id, 'in-progress')} 
                      className={`text-[10px] px-2 py-0.5 rounded ${p.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      In Progress
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Composer & Feed */}
        <div className="md:col-span-2 space-y-6">
          {/* Composer */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <h3 className="font-serif text-lg font-bold text-ink mb-4">Post an Update</h3>
            <Textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="Share an update with your constituents..." rows={3} />
            
            {postMedia && (
              <div className="mt-3 relative rounded-lg overflow-hidden">
                {postMedia.type === 'image' ? (
                  <Image src={postMedia.url} alt="Upload" width={500} height={300} className="w-full max-h-64 object-cover" />
                ) : (
                  <video src={postMedia.url} controls className="w-full max-h-64 object-cover" />
                )}
                <button onClick={() => setPostMedia(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-light">
              <div className="flex gap-2">
                <label className="cursor-pointer p-2 rounded-lg hover:bg-forest-faint text-muted">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                </label>
              </div>
              <Button onClick={submitPost} disabled={posting || (!postText && !postMedia)} className="bg-forest hover:bg-forest-mid">
                {posting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Publish Post
              </Button>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {posts.length === 0 && <p className="text-center text-muted py-8">No posts yet. Share your first update!</p>}
            {posts.map(post => (
             <PostCard key={post.id} post={post} initialName={initialName} avatarUrl={avatarUrl} />
            ))}
          </div>
        </div>
      </div>

      {/* GO LIVE MODAL */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsLiveModalOpen(false)}>
          <div className="bg-[#0B140F] rounded-2xl w-full max-w-md overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-white font-serif text-xl font-bold mb-2">Start Live Session</h3>
              <p className="text-white/60 text-sm mb-4">Enter a title for your session. Voters will be notified you are live.</p>
              <Input 
                value={liveTitle} 
                onChange={(e) => setLiveTitle(e.target.value)} 
                placeholder="e.g. Weekly Constituency Q&A" 
                className="bg-white/5 border-white/10 text-white mb-4"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/5" onClick={() => setIsLiveModalOpen(false)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white w-full" onClick={endLive}>
                  <Radio className="h-4 w-4 mr-2 animate-pulse" /> Go Live Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}