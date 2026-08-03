'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Video, Plus, X, Loader2, CheckCircle, AlertCircle, Radio } from 'lucide-react'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PromiseType = {
  id: string; text: string; status: 'fulfilled' | 'in-progress' | 'pending'; note: string | null
}

export function CandidateHub({ candidateId, initialName }: { candidateId: string, initialName: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [promises, setPromises] = useState<PromiseType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Composer state
  const [postText, setPostText] = useState('')
  const [postMedia, setPostMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  // Live modal state
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false)
  const [liveTitle, setLiveTitle] = useState('')

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
    
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${candidateId}/posts/${Date.now()}.${ext}`
    
    const { error } = await supabase.storage.from('candidate-docs').upload(path, file)
    if (error) {
      alert('Upload failed')
    } else {
      const { data } = supabase.storage.from('candidate-docs').getPublicUrl(path)
      setPostMedia({
        url: data.publicUrl,
        type: file.type.startsWith('video') ? 'video' : 'image'
      })
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
      // video_url: postMedia?.type === 'video' ? postMedia.url : null (if your schema has video_url)
    }).select().single()

    if (!error && newPost) {
      setPosts([newPost, ...posts])
      setPostText('')
      setPostMedia(null)
    }
    setPosting(false)
  }

  async function addPromise() {
    const text = prompt('Enter new campaign promise:')
    if (!text) return
    
    const { data, error } = await supabase.from('candidate_promises').insert({
      candidate_id: candidateId,
      text,
      status: 'pending'
    }).select().single()

    if (!error && data) {
      setPromises([data, ...promises])
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
    alert('Live session ended. (In production, this would save a replay to your feed)')
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-forest" /></div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-br from-forest to-forest-mid"></div>
        <div className="px-6 pb-6 -mt-12 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center font-serif text-4xl font-black text-forest">
              {initialName.charAt(0)}
            </div>
            <div className="pb-2">
              <h1 className="font-serif text-2xl font-black text-ink flex items-center gap-2">
                {initialName}
                <span className="text-xs font-bold bg-forest-light text-forest px-2 py-1 rounded">Verified</span>
              </h1>
              <p className="text-sm text-muted">Candidate Profile & Media Hub</p>
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
              <button onClick={addPromise} className="text-forest hover:bg-forest-faint p-1 rounded"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {promises.length === 0 && <p className="text-sm text-muted">No promises added yet.</p>}
              {promises.map(p => (
                <div key={p.id} className="border-l-4 border-forest pl-3 py-1">
                  <p className="text-sm font-medium text-ink">{p.text}</p>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => updatePromiseStatus(p.id, 'fulfilled')} className={`text-[10px] px-2 py-0.5 rounded ${p.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Fulfilled</button>
                    <button onClick={() => updatePromiseStatus(p.id, 'in-progress')} className={`text-[10px] px-2 py-0.5 rounded ${p.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>In Progress</button>
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
                  <Image src={postMedia.url} alt="Upload" className="w-full max-h-64 object-cover" width={500} height={300} />
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
              <div key={post.id} className="bg-white border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold">
                    {initialName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{initialName}</p>
                    <p className="text-xs text-muted">{new Date(post.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm text-ink mb-3 whitespace-pre-line">{post.content}</p>
                {post.image_url && (
                  <Image src={post.image_url} alt="Post" className="w-full rounded-lg max-h-96 object-cover" width={500} height={300} />
                )}
              </div>
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