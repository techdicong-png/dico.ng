// src/app/(dashboard)/candidate/posts/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ImageUp } from 'lucide-react'
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
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    loadData()
  }, [router])

  async function loadData() {
    const token = localStorage.getItem('dico_token')
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')
    const cands = await (await fetch('/api/candidates', { headers: { 'Authorization': `Bearer ${token}` } })).json()
    const own = (cands.candidates || []).find((c: any) => c.users?.email === user.email)
    if (!own) return
    setCandidateId(own.id)
    const data = await (await fetch(`/api/posts?candidate_id=${own.id}`, { headers: { 'Authorization': `Bearer ${token}` } })).json()
    setPosts(data.posts || [])
  }

  async function uploadFile(file: File) {
    setUploading(true)
    const token = localStorage.getItem('dico_token')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
    })
    const data = await res.json()
    setImageUrl(data.url)
    setUploading(false)
  }

  async function createPost() {
    if (!title.trim() || !content.trim() || !candidateId) return
    setPosting(true)
    const token = localStorage.getItem('dico_token')
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ candidate_id: candidateId, title, content, image_url: imageUrl || null }),
    })
    setTitle(''); setContent(''); setImageUrl('')
    setPosting(false)
    loadData()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Content
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Create Post</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input placeholder="Post title / topic" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Write your post... Use **bold** and *italic* with markdown" value={content} onChange={e => setContent(e.target.value)} rows={5} />
          
          <div className="flex items-center gap-3">
            <input type="file" ref={fileInput} accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading}>
              <ImageUp className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Add Image'}
            </Button>
            {imageUrl && <span className="text-xs text-green-600">✓ Image uploaded</span>}
          </div>

          <Button onClick={createPost} disabled={posting || !title.trim() || !content.trim()} className="bg-forest hover:bg-forest-mid">
            {posting ? 'Posting...' : 'Publish Post'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold text-ink">Your Posts</h2>
        {posts.length === 0 && <p className="text-sm text-muted-text text-center py-8">No posts yet.</p>}
        {posts.map((post: any) => (
          <Card key={post.id}>
            <CardContent className="pt-4">
              {post.title && <h3 className="font-bold text-ink text-lg mb-2">{post.title}</h3>}
              <p className="text-sm text-ink whitespace-pre-line">{post.content}</p>
              {post.image_url && <Image src={post.image_url} alt="Post image" className="mt-3 rounded-lg object-cover" width={600} height={400} />}
              <div className="flex gap-4 mt-3 text-xs text-muted-text">
                <span>❤️ {post.like_count || 0}</span>
                <span>💬 {post.comment_count || 0}</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
