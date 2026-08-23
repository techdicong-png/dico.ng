'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function InviteLink({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const link = `${window.location.origin}/register?ref=${userId}`
    if (navigator.share) {
      navigator.share({ title: 'Join me on DICO', url: link })
    } else {
      navigator.clipboard.writeText(link)
      toast.success('Invite link copied to clipboard!')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
          <i className="fa-solid fa-share-nodes text-gold"></i>
        </div>
        <div>
          <h3 className="font-bold text-sm text-ink dark:text-white">Invite Friends & Earn 50 CIVICT</h3>
          <p className="text-xs text-muted dark:text-[#c0d0c4]">Share your unique link with family and friends.</p>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <input 
          readOnly 
          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${userId}`}
          className="w-full md:w-64 text-xs bg-sand dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg px-3 py-2 text-muted dark:text-[#c0d0c4] focus:outline-none"
        />
        <button 
          onClick={handleShare}
          className="bg-forest hover:bg-forest-mid text-white text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
        >
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  )
}