'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, Send, Heart, MessageCircle, Share2, Bookmark, Gift } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function PostCard({ post, initialName, avatarUrl }: { post: any, initialName: string, avatarUrl?: string }) {
  const [user, setUser] = useState<any>(null)
  
  // 🔴 OPTIMIZATION: Initialize state directly from the post object passed by the API!
  const [likes, setLikes] = useState(post.like_count || 0)
  const [liked, setLiked] = useState(post.liked_by_me || false)
  
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
    fetchSaveStatus()
  }, [])

  async function fetchSaveStatus() {
    if (!user?.id) return
    const { data } = await supabase.from('post_saves').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
    if (data) setSaved(true)
  }

  // 🔴 CRITICAL FIX: Call the secure API route instead of direct Supabase inserts!
  async function toggleLike() {
    if (!user) return toast.error('Please log in to like posts.')
    
    const token = localStorage.getItem('dico_token')
    
    // Optimistic UI update
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikes(wasLiked ? likes - 1 : likes + 1)

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to toggle like')
      
      const data = await res.json()
      setLiked(data.liked)
      // Note: We don't strictly need to update `likes` here because the API returns boolean,
      // our optimistic update is visually accurate enough until refresh.
    } catch (err: any) {
      // Revert UI if API fails
      setLiked(wasLiked)
      setLikes(wasLiked ? likes + 1 : likes - 1)
      toast.error('Failed to update like.')
    }
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

  async function toggleComments() {
    if (showComments) {
      setShowComments(false)
      return
    }
    setShowComments(true)
    fetchComments()
  }

  async function submitComment() {
    if (!commentText.trim() || !user) return
    const token = localStorage.getItem('dico_token')
    
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
      // Check user balance
      const { data: userData } = await supabase.from('users').select('civict_balance').eq('id', user.id).single()
      if (userData?.civict_balance < amount) {
        throw new Error('Insufficient CIVICT balance')
      }

      // Deduct from voter
      await supabase.from('users').update({ civict_balance: userData?.civict_balance - amount }).eq('id', user.id)

      // Add to candidate
      const { data: candData } = await supabase.from('candidates').select('user_id').eq('id', post.candidate_id).single()
      if (candData) {
        const { data: candUser } = await supabase.from('users').select('civict_balance').eq('id', candData.user_id).single()
        await supabase.from('users').update({ civict_balance: (candUser?.civict_balance || 0) + amount }).eq('id', candData.user_id)
      }

      // Record transaction
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
    <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold overflow-hidden">
          {avatarUrl ? <Image src={avatarUrl} alt={initialName} width={40} height={40} className="w-full h-full object-cover" /> : initialName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-ink dark:text-white">{initialName}</p>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">{new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>
      
      <p className="text-sm text-ink dark:text-white mb-3 whitespace-pre-line">{post.content}</p>
      
      {post.image_url && (
        <Image src={post.image_url} alt="Post" width={500} height={300} className="w-full rounded-lg max-h-96 object-cover mb-4" />
      )}
      
      {/* Social Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-[#1f3a2c]">
        <div className="flex items-center gap-4 text-muted dark:text-[#c0d0c4]">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
            <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-current' : ''}`} />
            <span>{likes > 0 ? likes : 'Like'}</span>
          </button>
          
          <button onClick={toggleComments} className="flex items-center gap-1.5 text-sm hover:text-forest dark:hover:text-forest-700 transition-colors">
            <MessageCircle className="h-[18px] w-[18px]" />
            <span>Comment</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-muted dark:text-[#c0d0c4]">
          <button onClick={() => setShowGiftInput(!showGiftInput)} className="flex items-center gap-1.5 text-sm hover:text-gold transition-colors">
            <Gift className="h-[18px] w-[18px]" />
            <span>Gift</span>
          </button>
          <button onClick={toggleSave} className={`hover:text-forest transition-colors ${saved ? 'text-forest dark:text-forest-700' : ''}`}>
            <Bookmark className={`h-[18px] w-[18px] ${saved ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleShare} className="hover:text-forest transition-colors">
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Gift Input Section */}
      {showGiftInput && (
        <div className="mt-4 pt-4 border-t border-border-light dark:border-[#1f3a2c] animate-slide-down">
          <p className="text-xs text-muted dark:text-[#c0d0c4] mb-2">Gift CIVICT to support {initialName}</p>
          <div className="flex gap-2">
            <input type="number" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} placeholder="Amount" className="flex-1 bg-white dark:bg-[#0f1d16] text-ink dark:text-white border border-border dark:border-[#1f3a2c] rounded-md px-3 py-1.5 text-sm" />
            <button onClick={sendGift} disabled={gifting} className="bg-gold hover:bg-gold-hover text-ink font-semibold px-4 py-1.5 rounded-md text-sm flex items-center gap-1 disabled:opacity-50">
              {gifting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4 mr-1" />}
              Send Gift
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border-light dark:border-[#1f3a2c] space-y-4 animate-slide-down">
          <div className="flex gap-2">
            <input 
              placeholder="Write a comment..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              className="flex-1 bg-white dark:bg-[#0f1d16] text-ink dark:text-white border border-border dark:border-[#1f3a2c] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-gold"
            />
            <button onClick={submitComment} className="bg-forest dark:bg-forest text-white rounded-md p-2 hover:bg-forest-mid">
              <Send className="h-4 w-4" />
            </button>
          </div>

          {loadingComments ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted dark:text-[#c0d0c4] text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-light dark:bg-[#1b3a2b] text-forest dark:text-forest-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {c.users?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="bg-sand dark:bg-[#0f1d16] rounded-lg px-3 py-2 flex-1">
                    <p className="text-xs font-bold text-ink dark:text-white">{c.users?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-ink/80 dark:text-[#c0d0c4]">{c.comment}</p>
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