// src/app/(dashboard)/feed/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, MessageCircle, Send } from 'lucide-react'
import Image from 'next/image'

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    loadPosts()
  }, [router])

  async function loadPosts() {
    const token = localStorage.getItem('dico_token')
    const data = await (await fetch('/api/posts', { headers: { 'Authorization': `Bearer ${token}` } })).json()
     console.log('Posts:', data)
    setPosts(data.posts || [])
  }

  async function toggleLike(postId: string) {
    const token = localStorage.getItem('dico_token')
    const data = await (await fetch(`/api/posts/${postId}/like`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    })).json()
    setPosts(posts.map(p => p.id === postId ? {
      ...p,
      liked_by_me: data.liked,
      like_count: data.liked ? (p.like_count || 0) + 1 : Math.max(0, (p.like_count || 0) - 1)
    } : p))
  }

  async function loadComments(postId: string) {
    const token = localStorage.getItem('dico_token')
    const data = await (await fetch(`/api/posts/${postId}/comments`, { headers: { 'Authorization': `Bearer ${token}` } })).json()
    setComments({ ...comments, [postId]: data.comments || [] })
  }

  async function addComment(postId: string) {
    const text = commentText[postId]?.trim()
    if (!text) return
    const token = localStorage.getItem('dico_token')
    const data = await (await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ comment: text }),
    })).json()
    setCommentText({ ...commentText, [postId]: '' })
    loadComments(postId)
    setPosts(posts.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Feed
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Latest from Candidates</h1>
      </div>

      {posts.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-text">No posts yet. Follow candidates to see their updates.</CardContent></Card>
      )}

      {posts.map((post: any) => (
        <Card key={post.id}>
          <CardContent className="pt-4">
            {/* Candidate info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-forest text-white font-serif text-sm font-bold flex items-center justify-center">
                {(post.candidates?.full_name || '?')[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{post.candidates?.full_name}</p>
                <p className="text-xs text-muted-text">{post.candidates?.party} · {post.candidates?.office}</p>
              </div>
              <span className="ml-auto text-xs text-muted-text">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>

            {/* Content */}
            <p className="text-sm text-ink mb-3">{post.content}</p>
            {post.image_url && (
              <Image src={post.image_url} alt="Post image" className="rounded-lg max-h-96 w-full object-cover mb-3" width={600} height={400} />
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-border-light">
              <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm ${post.liked_by_me ? 'text-red-500' : 'text-muted-text hover:text-red-500'}`}>
                <Heart className={`h-4 w-4 ${post.liked_by_me ? 'fill-current' : ''}`} />
                {post.like_count || 0}
              </button>
              <button onClick={() => loadComments(post.id)} className="flex items-center gap-1.5 text-sm text-muted-text hover:text-ink">
                <MessageCircle className="h-4 w-4" />
                {post.comment_count || 0}
              </button>
            </div>

            {/* Comments */}
            {comments[post.id] && (
              <div className="mt-3 pt-3 border-t border-border-light space-y-2">
                {comments[post.id].map((c: any, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="font-semibold text-ink shrink-0">{c.users?.full_name || 'User'}</span>
                    <span className="text-muted-text">{c.comment}</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input value={commentText[post.id] || ''} onChange={e => setCommentText({...commentText, [post.id]: e.target.value})}
                    placeholder="Write a comment..." className="text-sm" />
                  <Button size="sm" onClick={() => addComment(post.id)} className="bg-forest hover:bg-forest-mid">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
