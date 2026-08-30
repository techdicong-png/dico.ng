'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Smartphone, Megaphone, Users, X, ChevronDown } from 'lucide-react'
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
  
  const [directMessage, setDirectMessage] = useState('')
  const [sendingBlast, setSendingBlast] = useState(false)

  // State for Audience Modal
  const [showAudience, setShowAudience] = useState(false)
  const [voters, setVoters] = useState<any[]>([])
  const [loadingVoters, setLoadingVoters] = useState(false)
  const [voterRegion, setVoterRegion] = useState('')
  
  // State for Blast Limit & Selected Voters
  const [blastLimit, setBlastLimit] = useState(10)
  const [selectedVoters, setSelectedVoters] = useState<string[]>([])
  const [expandedLgas, setExpandedLgas] = useState<Record<string, boolean>>({})

  // Group voters by LGA for the UI
  const groupedVoters = useMemo(() => {
    return voters.reduce((acc, v) => {
      const lga = v.lga || 'Unknown LGA';
      if (!acc[lga]) acc[lga] = [];
      acc[lga].push(v);
      return acc;
    }, {} as Record<string, any[]>)
  }, [voters])

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
      toast.success('Voter Canvassing Campaign launched!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function sendDirectBlast() {
    if (directMessage.trim().length < 10) return toast.error('Message must be at least 10 characters.')
    
    setSendingBlast(true)
    try {
      const payload: any = { message: directMessage, limit: blastLimit }
      
      if (selectedVoters.length > 0) {
        payload.phoneNumbers = selectedVoters
        payload.limit = selectedVoters.length
      }

      const res = await fetch('/api/sms/direct-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setDirectMessage('')
      setSelectedVoters([])
      toast.success(data.message)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSendingBlast(false)
    }
  }

  async function fetchAudience() {
    setLoadingVoters(true)
    try {
      const res = await fetch('/api/sms/voters')
      const data = await res.json()
      if (res.ok) {
        setVoters(data.voters || [])
        setVoterRegion(data.regionName || 'your constituency')
        setShowAudience(true)
      } else {
        throw new Error(data.error || 'Failed to load audience')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingVoters(false)
    }
  }

  function toggleVoter(phone: string) {
    setSelectedVoters(prev => 
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    )
  }

  function toggleSelectAll() {
    if (selectedVoters.length === voters.length) {
      setSelectedVoters([])
    } else {
      setSelectedVoters(voters.map(v => v.phone))
    }
  }

  function toggleSelectLga(lga: string, votersInLga: any[]) {
    const phonesInLga = votersInLga.map(v => v.phone)
    const allSelected = phonesInLga.every(p => selectedVoters.includes(p))
    
    if (allSelected) {
      // Deselect only this LGA
      setSelectedVoters(prev => prev.filter(p => !phonesInLga.includes(p)))
    } else {
      // Select this LGA (add to existing)
      setSelectedVoters(prev => Array.from(new Set([...prev, ...phonesInLga])))
    }
  }

  function toggleExpandLga(lga: string) {
    setExpandedLgas(prev => ({ ...prev, [lga]: !prev[lga] }))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          SMS Canvassing
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Campaign SMS</h1>
      </div>

      {/* Direct Voter Blast Section */}
      <div className="bg-forest text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-gold" />
          <h3 className="font-serif text-lg font-bold">Direct Voter Blast</h3>
        </div>
        <p className="text-xs text-white/70 mb-4">
          Send an SMS directly to the phones of verified voters registered in your constituency. This does not reward the voters; it goes straight from you to them.
        </p>
        
        {/* Audience Button */}
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={fetchAudience} 
            disabled={loadingVoters} 
            variant="outline" 
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            {loadingVoters ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
            {loadingVoters ? 'Loading...' : 'Select Recipients'}
          </Button>
          
          {selectedVoters.length > 0 && (
            <Button 
              onClick={() => setSelectedVoters([])} 
              variant="outline" 
              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
            >
              Clear ({selectedVoters.length})
            </Button>
          )}
        </div>

        <Textarea
          value={directMessage}
          onChange={e => setDirectMessage(e.target.value)}
          rows={3}
          maxLength={160}
          placeholder="e.g. I am hosting a live town hall on DICO tomorrow at 4PM. Join me to ask your questions!"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mb-2"
        />
        
        {/* Limit Selector UI - Only shows if no one is manually selected */}
        {selectedVoters.length === 0 && (
          <div className="flex justify-between items-center text-xs mb-4">
            <span className="font-semibold text-white/70">{directMessage.length}/160 characters</span>
            <div className="flex items-center gap-2">
              <span className="text-white/70">Quick Send to:</span>
              <select 
                value={blastLimit}
                onChange={e => setBlastLimit(Number(e.target.value))}
                className="bg-white/10 border border-white/20 text-white rounded-md px-2 py-1 text-xs focus:outline-none"
              >
                <option value={10} className="text-ink">10 people</option>
                <option value={20} className="text-ink">20 people</option>
                <option value={50} className="text-ink">50 people</option>
                <option value={100} className="text-ink">100 people</option>
              </select>
            </div>
          </div>
        )}

        {selectedVoters.length > 0 && (
          <div className="flex justify-between items-center text-xs mb-4">
            <span className="font-semibold text-white/70">{directMessage.length}/160 characters</span>
            <span className="text-gold font-bold">Sending to {selectedVoters.length} selected</span>
          </div>
        )}

        <Button onClick={sendDirectBlast} disabled={sendingBlast || directMessage.trim().length < 10} className="w-full bg-gold hover:bg-gold-hover text-ink font-bold h-11">
          {sendingBlast ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          {sendingBlast ? 'Sending Blast...' : 'Send Direct Blast'}
        </Button>
      </div>

      {/* Voter Canvassing (Viral) Section */}
      <div className="space-y-6">
        <div className="border-t border-border dark:border-[#1f3a2c] pt-6">
          <h3 className="font-serif text-lg font-bold text-ink dark:text-white mb-2">Voter Canvassing (Viral)</h3>
          <div className="bg-gold/10 border border-gold/30 dark:border-gold/20 rounded-xl p-4 flex items-start gap-3 mb-4">
            <Smartphone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-ink dark:text-white leading-relaxed">
              Voters in your constituency will see your campaign. They enter phone numbers from their phonebook and hit send — they can't edit your message. They earn 15 CIVICT for sharing.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-6">
          <h3 className="font-serif text-base font-bold text-ink dark:text-white mb-4">New Viral Campaign Message</h3>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            maxLength={160}
            placeholder="e.g. Town hall meeting this Friday at 4PM. Come meet your next Senator!"
            className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c] mb-2"
          />
          <div className="flex justify-between items-center mt-2 text-xs mb-4">
            <span className={`font-semibold ${message.length > 140 ? 'text-amber-500' : 'text-muted dark:text-[#c0d0c4]'}`}>
              {message.length}/160 characters
            </span>
            <span className="text-muted dark:text-[#c0d0c4]">Reward: 15 ₡ per voter</span>
          </div>
          <Button onClick={createCampaign} disabled={loading || message.trim().length < 10} className="w-full bg-forest hover:bg-forest-mid h-11">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Launch Viral Campaign
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                      c.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                      'bg-gray-100 text-gray-600 dark:bg-[#0f1d16] dark:text-[#c0d0c4]'
                    }`}>
                      {c.status === 'active' ? '● Active' : c.status === 'completed' ? '✅ Completed' : '⏸ Paused'}
                    </span>
                  </div>
                  <p className="text-sm text-ink dark:text-white">{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Target Audience Modal - Grouped by LGA */}
      {showAudience && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAudience(false)}>
          <div className="bg-white dark:bg-[#11241b] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-border dark:border-[#1f3a2c] shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-forest text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-serif text-lg font-bold">Select Recipients</h3>
                <p className="text-xs text-white/70">{voters.length} voters in {voterRegion}</p>
              </div>
              <button onClick={() => setShowAudience(false)}><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-3 border-b border-border dark:border-[#1f3a2c] flex justify-between items-center bg-sand dark:bg-[#0f1d16]">
              <span className="text-xs font-bold text-ink dark:text-white">{selectedVoters.length} selected</span>
              <Button size="sm" variant="outline" onClick={toggleSelectAll} className="dark:bg-[#11241b] dark:text-white dark:border-[#1f3a2c]">
                {selectedVoters.length === voters.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {Object.keys(groupedVoters).length === 0 ? (
                <p className="text-center text-muted dark:text-[#c0d0c4] py-8">No voters with phone numbers found in your constituency yet.</p>
              ) : (
                Object.entries(groupedVoters).map(([lga, lgaVoters]) => {
                  const phonesInLga = lgaVoters.map(v => v.phone)
                  const allSelected = phonesInLga.every(p => selectedVoters.includes(p))
                  const isExpanded = expandedLgas[lga]
                  
                  return (
                    <div key={lga} className="border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden">
                      {/* LGA Header */}
                      <div className="p-3 bg-forest-light dark:bg-[#1b3a2b] flex items-center justify-between">
                        <button onClick={() => toggleExpandLga(lga)} className="flex items-center gap-2 text-ink dark:text-white font-bold text-sm">
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                          {lga} LGA
                          <span className="text-xs font-normal text-muted dark:text-[#c0d0c4]">({lgaVoters.length})</span>
                        </button>
                        <Button 
                          size="sm" 
                          variant={allSelected ? "destructive" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => toggleSelectLga(lga, lgaVoters)}
                        >
                          {allSelected ? 'Clear LGA' : 'Select All'}
                        </Button>
                      </div>
                      
                      {/* Voter List (Collapsible for performance) */}
                      {isExpanded && (
                        <div className="p-2 space-y-1 max-h-60 overflow-y-auto bg-white dark:bg-[#11241b]">
                          {lgaVoters.map((v) => (
                            <div 
                              key={v.phone} 
                              className={`flex items-center gap-3 p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                                selectedVoters.includes(v.phone) 
                                  ? 'bg-forest-light dark:bg-[#1b3a2b] border border-forest dark:border-forest-700' 
                                  : 'hover:bg-sand dark:hover:bg-[#0f1d16]'
                              }`}
                              onClick={() => toggleVoter(v.phone)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedVoters.includes(v.phone)}
                                onChange={() => toggleVoter(v.phone)}
                                className="h-4 w-4 accent-forest cursor-pointer"
                              />
                              <span className="text-ink dark:text-white font-medium flex-1 truncate">{v.full_name}</span>
                              <span className="text-muted dark:text-[#c0d0c4] font-mono text-xs">{v.phone}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
            
            <div className="p-4 border-t border-border dark:border-[#1f3a2c]">
              <Button onClick={() => setShowAudience(false)} className="w-full bg-forest hover:bg-forest-mid">
                Done ({selectedVoters.length} selected)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}