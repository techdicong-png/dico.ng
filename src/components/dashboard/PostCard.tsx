'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Send, Heart, MessageCircle, Share2, Bookmark, Gift } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function PostCard({ post, initialName, avatarUrl }: { post: any, initialName: string, avatarUrl?: string }) {
  const [user, setUser] = useState<any>(null)
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  
  // Gift state
  const [showGiftInput, setShowGiftInput] = useState(false)
  const [giftAmount, setGiftAmount] = useState('10')
  const [gifting, setGifting] = useState(false)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('dico_user') || '{}')
    setUser(u)
    fetchLikes()
    fetchSaveStatus()
  }, [])

  async function fetchLikes() {
    const { count } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id)
    setLikes(count || 0)
    
    if (user?.id) {
      const { data } = await supabase.from('post_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
      if (data) setLiked(true)
    }
  }

  async function fetchSaveStatus() {
    if (!user?.id) return
    const { data } = await supabase.from('post_saves').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
    if (data) setSaved(true)
  }

  async function fetchComments() {
    setLoadingComments(true)
    const { data } = await supabase
      .from('post_comments')
      .select('*, users(full_name)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
    
    setComments(data || [])
    setLoadingComments(false)
  }

  async function toggleLike() {
    if (!user) return toast.error('Please log in to like posts.')
    
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      setLikes(likes - 1)
      setLiked(false)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id })
      setLikes(likes + 1)
      setLiked(true)
    }
  }

  async function toggleSave() {
    if (!user) return toast.error('Please log in to save posts.')
    
    if (saved) {
      await supabase.from('post_saves').delete().eq('post_id', post.id).eq('user_id', user.id)
      setSaved(false)
      toast.success('Removed from saved.')
    } else {
      await supabase.from('post_saves').insert({ post_id: post.id, user_id: user.id })
      setSaved(true)
      toast.success('Post saved!')
    }
  }

  async function submitComment() {
    if (!commentText.trim() || !user) return
    const { data, error } = await supabase.from('post_comments')
      .insert({ post_id: post.id, user_id: user.id, comment: commentText })
      .select('*, users(full_name)')
      .single()

    if (!error && data) {
      setComments([data, ...comments])
      setCommentText('')
    } else {
      toast.error('Failed to post comment.')
    }
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/candidates/${post.candidate_id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `${initialName} on DICO`, url: shareUrl })
      } catch (err) { /* User cancelled share */ }
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  async function sendGift() {
    const amount = parseInt(giftAmount)
    if (!amount || amount <= 0) return toast.error('Enter a valid amount')
    if (!user) return toast.error('Please log in to gift CIVICT.')

    setGifting(true)
    try {
      // 1. Check user balance
      const { data: userData } = await supabase.from('users').select('civict_balance').eq('id', user.id).single()
      if (userData?.civict_balance < amount) {
        throw new Error('Insufficient CIVICT balance')
      }

      // 2. Deduct from voter
      await supabase.from('users').update({ civict_balance: userData?.civict_balance - amount }).eq('id', user.id)

      // 3. Add to candidate
      const { data: candData } = await supabase.from('candidates').select('user_id').eq('id', post.candidate_id).single()
      if (candData) {
        const { data: candUser } = await supabase.from('users').select('civict_balance').eq('id', candData.user_id).single()
        await supabase.from('users').update({ civict_balance: (candUser?.civict_balance || 0) + amount }).eq('id', candData.user_id)
      }

      // 4. Record transaction
      await supabase.from('civict_transactions').insert({
        user_id: user.id,
        type: 'gift',
        amount: -amount,
        description: `Gifted to ${initialName}`
      })

      toast.success(`Successfully gifted ${amount} CIVICT to ${initialName}!`)
      setShowGiftInput(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send gift')
    } finally {
      setGifting(false)
    }
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold overflow-hidden">
          {avatarUrl ? <Image src={avatarUrl} alt={initialName} width={40} height={40} className="w-full h-full object-cover" /> : initialName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-ink">{initialName}</p>
          <p className="text-xs text-muted">{new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>
      
      <p className="text-sm text-ink mb-3 whitespace-pre-line">{post.content}</p>
      
      {post.image_url && (
        <Image src={post.image_url} alt="Post" width={500} height={300} className="w-full rounded-lg max-h-96 object-cover mb-4" />
      )}
      
      {/* Social Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-border-light">
        <div className="flex items-center gap-4 text-muted">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
            <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-current' : ''}`} />
            <span>{likes > 0 ? likes : 'Like'}</span>
          </button>
          
          <button onClick={() => { setShowComments(!showComments); if (!showComments) fetchComments() }} className="flex items-center gap-1.5 text-sm hover:text-forest transition-colors">
            <MessageCircle className="h-[18px] w-[18px]" />
            <span>Comment</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-muted">
          <button onClick={() => setShowGiftInput(!showGiftInput)} className="flex items-center gap-1.5 text-sm hover:text-gold transition-colors">
            <Gift className="h-[18px] w-[18px]" />
            <span>Gift</span>
          </button>
          <button onClick={toggleSave} className={`hover:text-forest transition-colors ${saved ? 'text-forest' : ''}`}>
            <Bookmark className={`h-[18px] w-[18px] ${saved ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleShare} className="hover:text-forest transition-colors">
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Gift Input Section */}
      {showGiftInput && (
        <div className="mt-4 pt-4 border-t border-border-light animate-slide-down">
          <p className="text-xs text-muted mb-2">Gift CIVICT to support {initialName}</p>
          <div className="flex gap-2">
            <Input type="number" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} placeholder="Amount" className="flex-1" />
            <Button onClick={sendGift} disabled={gifting} className="bg-gold hover:bg-gold-hover text-ink">
              {gifting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4 mr-2" />}
              Send Gift
            </Button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border-light space-y-4 animate-slide-down">
          <div className="flex gap-2">
            <Input 
              placeholder="Write a comment..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              className="flex-1"
            />
            <Button size="icon" onClick={submitComment} className="bg-forest hover:bg-forest-mid">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {loadingComments ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-light text-forest flex items-center justify-center text-xs font-bold shrink-0">
                    {c.users?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="bg-sand rounded-lg px-3 py-2 flex-1">
                    <p className="text-xs font-bold text-ink">{c.users?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-ink/80">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}