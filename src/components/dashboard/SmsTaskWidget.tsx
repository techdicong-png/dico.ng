'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Smartphone, Gift, X } from 'lucide-react'
import { toast } from 'sonner'

type Campaign = {
  id: string
  message: string
  reward_civict: number
  candidates: { full_name: string } | null
}

export function SmsTaskWidget() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [phones, setPhones] = useState<string[]>(['', '', '', '', ''])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    setLoading(true)
    try {
      const res = await fetch('/api/sms/active-campaigns')
      const data = await res.json()
      if (res.ok) setCampaigns(data.campaigns || [])
    } catch (err) {
      console.error('Failed to load SMS campaigns')
    } finally {
      setLoading(false)
    }
  }

  async function sendSms() {
    const validPhones = phones.map(p => p.replace(/\s/g, '')).filter(p => p.length >= 11)
    if (validPhones.length < 5) return toast.error('Please enter at least 5 valid phone numbers.')

    setSending(true)
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: activeCampaign?.id, phoneNumbers: validPhones })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        setActiveCampaign(null)
        setPhones(['', '', '', '', ''])
        fetchCampaigns()
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading || campaigns.length === 0) return null

  return (
    <div className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-5 w-5 text-forest dark:text-forest-700" />
        <h3 className="font-serif text-lg font-bold text-ink dark:text-white">Campaign Tasks</h3>
      </div>
      <p className="text-xs text-muted dark:text-[#c0d0c4] mb-4">Share these messages with friends to earn CIVICT!</p>

      {!activeCampaign ? (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="bg-sand dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="text-sm text-ink dark:text-white font-medium">{c.message}</p>
                <span className="text-[10px] font-bold bg-gold/10 text-gold px-2 py-1 rounded whitespace-nowrap">
                  <Gift className="inline h-3 w-3 mr-1" /> {c.reward_civict} ₡
                </span>
              </div>
              <Button size="sm" className="w-full bg-forest hover:bg-forest-mid mt-2" onClick={() => setActiveCampaign(c)}>
                <Send className="h-3 w-3 mr-2" /> Share Now
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-slide-down">
          <button onClick={() => setActiveCampaign(null)} className="text-xs text-muted dark:text-[#c0d0c4] mb-3 flex items-center gap-1">
            <X className="h-3 w-3" /> Cancel
          </button>
          <div className="bg-white dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg p-3 mb-4">
            <p className="text-[10px] font-bold uppercase text-muted dark:text-[#c0d0c4] mb-1">Message Preview</p>
            <p className="text-sm text-ink dark:text-white">
              <strong>{activeCampaign.candidates?.full_name?.split(' ')[0]}:</strong> {activeCampaign.message}
            </p>
          </div>
          <p className="text-xs font-semibold text-ink dark:text-white mb-2">Enter 5 phone numbers:</p>
          <div className="space-y-2 mb-3">
            {phones.map((phone, index) => (
              <Input key={index} type="tel" value={phone} onChange={e => {
                const newPhones = [...phones]; newPhones[index] = e.target.value; setPhones(newPhones)
              }} placeholder={`0801 234 5678 #${index + 1}`} className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
            ))}
          </div>
          <Button onClick={sendSms} disabled={sending} className="w-full bg-gold hover:bg-gold-hover text-ink font-bold">
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send & Earn {activeCampaign.reward_civict} ₡
          </Button>
        </div>
      )}
    </div>
  )
}