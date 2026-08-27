'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

type Campaign = {
  id: string
  message: string
  reward_civict: number
  status: string
  created_at: string
  target_lga: string | null
  target_state: string | null
}

export function SmsCampaignManager({ candidateName, initialCampaigns }: { candidateName: string, initialCampaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function createCampaign() {
    if (message.trim().length < 10) return toast.error('Message must be at least 10 characters.')
    if (message.length > 160) return toast.error('Message must be 160 characters or less.')

    setLoading(true)
    try {
      const res = await fetch('/api/sms/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setCampaigns([data.campaign, ...campaigns])
      setMessage('')
      toast.success('Campaign launched!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          SMS Canvassing
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Campaign SMS</h1>
      </div>

      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 flex items-start gap-3">
        <Smartphone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
        <p className="text-xs text-ink dark:text-white leading-relaxed">
          Voters in your constituency will see your campaign. They enter phone numbers from their phonebook and hit send — they can't edit your message. Recipients see it as: <strong>"{candidateName.split(' ')[0]}: [your message]"</strong>
        </p>
      </div>

      <div className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-6">
        <h3 className="font-serif text-lg font-bold text-ink dark:text-white mb-4">New Campaign Message</h3>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          maxLength={160}
          placeholder="e.g. Town hall meeting this Friday at 4PM, Ekwuoma Town Hall. Come meet your next Senator!"
          className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
        />
        <div className="flex justify-between items-center mt-2 text-xs">
          <span className={`font-semibold ${message.length > 140 ? 'text-amber-500' : 'text-muted dark:text-[#c0d0c4]'}`}>
            {message.length}/160 characters
          </span>
          <span className="text-muted dark:text-[#c0d0c4]">Reward: 15 ₡ per voter</span>
        </div>
        <Button onClick={createCampaign} disabled={loading || message.trim().length < 10} className="w-full bg-forest hover:bg-forest-mid mt-4 h-11">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Launch Campaign
        </Button>
      </div>

      <div>
        <h3 className="font-serif text-lg font-bold text-ink dark:text-white mb-4">Your Campaigns</h3>
        {campaigns.length === 0 ? (
          <div className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-12 text-center">
            <p className="text-sm text-muted dark:text-[#c0d0c4]">No campaigns yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-[#0f1d16] dark:text-[#c0d0c4]'}`}>
                    {c.status === 'active' ? '● Active' : '⏸ Paused'}
                  </span>
                </div>
                <p className="text-sm text-ink dark:text-white">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}