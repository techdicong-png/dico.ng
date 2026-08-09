'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserCheck, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function FollowButton({ candidateId, initialFollowing, initialCount }: { 
  candidateId: string, 
  initialFollowing: boolean, 
  initialCount: number 
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggleFollow() {
    setLoading(true)
    try {
      const res = await fetch(`/api/candidates/${candidateId}/follow`, {
        method: 'POST',
      })
      const data = await res.json()
      
      if (res.ok) {
        setFollowing(data.isFollowing)
        setCount(data.followerCount)
        toast.success(data.isFollowing ? 'Followed successfully!' : 'Unfollowed.')
      } else {
        throw new Error(data.error || 'Failed to toggle follow')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={toggleFollow} 
      disabled={loading}
      className={following ? "w-full md:w-auto border border-forest text-forest bg-white hover:bg-forest-faint" : "w-full md:w-auto bg-forest hover:bg-forest-mid text-white"}
    >
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : following ? <UserCheck className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
      {following ? 'Following' : 'Follow'}
      <span className="ml-2 text-xs opacity-80">({count.toLocaleString()})</span>
    </Button>
  )
}