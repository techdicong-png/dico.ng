'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ImageUp, Trash2, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function CandidatePostsPage() {
  const router = useRouter()
  const [candidateId, setCandidateId] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    loadData()
  }, [router])

  async function loadData() {
    const token = localStorage.getItem('dico_token')
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')
    try {
      const cands = await (await fetch('/api/candidates', { headers: { 'Authorization': `Bearer ${token}` } })).json()
      const own = (cands.candidates || []).find((c: any) => c.users?.email === user.email)
      if (!own) return
      setCandidateId(own.id)
      const data = await (await fetch(`/api/posts?candidate_id=${own.id}`, { headers: { 'Authorization': `Bearer ${token}` } })).json()
      setPosts(data.posts || [])
    } catch {}
  }

  async function uploadFile(file: File) {
    setUploading(true)
    const token = localStorage.getItem('dico_token')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
      })
      const data = await res.json()
      setImageUrl(data.url)
    } catch {}
    setUploading(false)
  }

  async function createPost() {
    if (!title.trim() || !content.trim() || !candidateId) return
    setPosting(true)
    const token = localStorage.getItem('dico_token')
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ candidate_id: candidateId, title, content, image_url: imageUrl || null }),
      })
      setTitle(''); setContent(''); setImageUrl('')
      if (fileInput.current) fileInput.current.value = ''
      setShowForm(false)
      setSuccessMsg('Post published!')
      setTimeout(() => setSuccessMsg(''), 3000)
      loadData()
    } catch {}
    setPosting(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
            Content
          </span>
          <h1 className="font-serif text-2xl font-black text-ink">Your Posts</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}
          className="bg-forest hover:bg-forest-mid text-sm">
          {showForm ? 'Cancel' : '+ New Post'}
        </Button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
          <CheckCircle className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Create Form — collapsible */}
      {showForm && (
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-ink">New Post</h2>
          <input placeholder="Post title / topic" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12" />
          <textarea placeholder="Write your post..." value={content} onChange={e => setContent(e.target.value)} rows={5}
            className="w-full px-3.5 py-2.5 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 resize-y" />

          {/* Image upload */}
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" ref={fileInput} accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading}
              className="border-border text-muted hover:text-ink">
              <ImageUp className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Add Image'}
            </Button>
            {imageUrl && (
              <div className="relative">
                <Image src={imageUrl} alt="Preview" width={80} height={80} className="rounded-lg object-cover h-16 w-20" />
                <button onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">×</button>
              </div>
            )}
          </div>

          <Button onClick={createPost} disabled={posting || !title.trim() || !content.trim()}
            className="bg-forest hover:bg-forest-mid">
            {posting ? 'Posting...' : 'Publish Post'}
          </Button>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 && !showForm && (
        <div className="bg-white border border-border rounded-xl py-14 text-center">
          <p className="text-sm text-muted">No posts yet. Create your first post.</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post: any) => (
          <div key={post.id} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-5">
              {post.title && <h3 className="font-bold text-ink text-lg mb-2">{post.title}</h3>}
              <p className="text-sm text-ink whitespace-pre-line">{post.content}</p>
              {post.image_url && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <Image src={post.image_url} alt="Post image" className="w-full max-h-72 object-cover" width={600} height={400} />
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                <span>❤️ {post.like_count || 0}</span>
                <span>💬 {post.comment_count || 0}</span>
                <span className="ml-auto">{new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
