'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Share2, Send, CheckCircle } from 'lucide-react'
import Image from 'next/image'

function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2.5 mb-4">
          <div className="h-3.5 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3.5 w-1/2 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-48 w-full bg-gray-200 rounded-xl animate-pulse mb-3" />
        <div className="flex gap-4">
          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [animatingLike, setAnimatingLike] = useState<Record<string, boolean>>({})
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    loadPosts()
  }, [router])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = '1'
            ;(e.target as HTMLElement).style.transform = 'translateY(0)'
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    Object.values(postRefs.current).forEach(ref => ref && observer.observe(ref))
    return () => observer.disconnect()
  }, [posts])

  async function loadPosts() {
    setLoading(true)
    const token = localStorage.getItem('dico_token')
    try {
      const data = await (await fetch('/api/posts', { headers: { 'Authorization': `Bearer ${token}` } })).json()
      setPosts(data.posts || [])
    } catch {}
    setLoading(false)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'now'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  async function toggleLike(postId: string) {
    if (animatingLike[postId]) return
    setAnimatingLike({ ...animatingLike, [postId]: true })
    setTimeout(() => setAnimatingLike({ ...animatingLike, [postId]: false }), 500)
    const token = localStorage.getItem('dico_token')
    try {
      const data = await (await fetch(`/api/posts/${postId}/like`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      })).json()
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        liked_by_me: data.liked,
        like_count: data.liked ? (p.like_count || 0) + 1 : Math.max(0, (p.like_count || 0) - 1)
      } : p))
    } catch {}
  }

  async function loadComments(postId: string) {
    if (openComments[postId]) {
      setOpenComments({ ...openComments, [postId]: false })
      return
    }
    setLoadingComments({ ...loadingComments, [postId]: true })
    setOpenComments({ ...openComments, [postId]: true })
    const token = localStorage.getItem('dico_token')
    try {
      const data = await (await fetch(`/api/posts/${postId}/comments`, { headers: { 'Authorization': `Bearer ${token}` } })).json()
      setComments({ ...comments, [postId]: data.comments || [] })
    } catch {}
    setLoadingComments({ ...loadingComments, [postId]: false })
  }

  async function addComment(postId: string) {
    const text = commentText[postId]?.trim()
    if (!text) return
    const token = localStorage.getItem('dico_token')
    try {
      await (await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ comment: text }),
      })).json()
      setCommentText({ ...commentText, [postId]: '' })
      loadComments(postId)
      setPosts(posts.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
    } catch {}
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-mid bg-forest-light px-2.5 py-1 rounded inline-block mb-2">
          Feed
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Latest from Candidates</h1>
      </div>

      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="bg-white border border-border rounded-xl py-16 text-center">
          <p className="text-sm text-muted">No posts yet. Follow candidates to see their updates.</p>
        </div>
      )}

      {posts.map((post: any, index: number) => (
        <article
          key={post.id}
          ref={el => { postRefs.current[post.id] = el as HTMLDivElement | null }}
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms`
          }}
          className="bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="px-4 pt-4 pb-2 md:px-5 md:pt-5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-forest to-forest-mid flex items-center justify-center text-white font-serif text-base font-bold">
                  {(post.candidates?.full_name || '?')[0]}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gold rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink truncate">{post.candidates?.full_name}</p>
                <p className="text-xs text-muted truncate">{post.candidates?.party} · {post.candidates?.office}</p>
              </div>
              <span className="text-xs text-muted shrink-0">{timeAgo(post.created_at)}</span>
            </div>
          </div>

          <div className="px-4 md:px-5 pb-2">
            <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{post.content}</p>
          </div>

          {post.image_url && (
            <div className="mx-4 md:mx-5 mb-3 rounded-xl overflow-hidden border border-border-light">
              <Image src={post.image_url} alt="Post image" className="w-full max-h-80 object-cover" width={600} height={400} />
            </div>
          )}

          <div className="px-4 md:px-5 pb-3">
            <div className="flex items-center justify-between pt-3 border-t border-border-light">
              <div className="flex items-center gap-1">
                <button onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    post.liked_by_me ? 'text-red-500 bg-red-50' : 'text-muted hover:text-red-500 hover:bg-red-50'
                  }`}>
                  <Heart className={`h-[18px] w-[18px] active:scale-125 transition-transform ${
                    animatingLike[post.id] ? 'scale-125' : ''
                  } ${post.liked_by_me ? 'fill-current' : ''}`} />
                  {(post.like_count || 0) > 0 && <span>{post.like_count}</span>}
                </button>
                <button onClick={() => loadComments(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    openComments[post.id] ? 'text-ink bg-forest-light' : 'text-muted hover:text-ink hover:bg-forest-light'
                  }`}>
                  <MessageCircle className="h-[18px] w-[18px]" />
                  {(post.comment_count || 0) > 0 && <span>{post.comment_count}</span>}
                </button>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-forest-light transition-all">
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {openComments[post.id] && (
            <div className="px-4 md:px-5 pb-4 border-t border-border-light overflow-hidden">
              {loadingComments[post.id] ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments[post.id]?.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No comments yet. Be the first.</p>
              ) : (
                <div className="space-y-3 py-3 max-h-64 overflow-y-auto">
                  {comments[post.id]?.map((c: any) => (
                    <div key={c.id || c.created_at} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-forest-light text-forest-mid flex items-center justify-center text-xs font-bold shrink-0">
                        {(c.users?.full_name || 'U')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-forest-faint rounded-xl px-3.5 py-2.5">
                          <p className="text-xs font-bold text-ink mb-0.5">{c.users?.full_name || 'User'}</p>
                          <p className="text-sm text-muted leading-relaxed break-words">{c.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <input value={commentText[post.id] || ''}
                  onChange={e => setCommentText({...commentText, [post.id]: e.target.value})}
                  placeholder="Write a comment..."
                  className="flex-1 min-w-0 px-3.5 py-2.5 text-sm text-ink bg-forest-faint/50 border border-border rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60"
                  onKeyDown={e => e.key === 'Enter' && addComment(post.id)} />
                <button onClick={() => addComment(post.id)}
                  className="shrink-0 h-[42px] w-[42px] bg-forest text-white rounded-lg hover:bg-forest-mid active:scale-90 transition-all flex items-center justify-center">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
