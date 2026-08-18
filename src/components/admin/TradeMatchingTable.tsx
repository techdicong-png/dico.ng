'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowRightLeft, Loader2 } from 'lucide-react'

type Listing = {
  id: string
  user_id: string
  type: 'buy' | 'sell'
  amount_civict: number
  rate_naira: number
  status: string
  users: { full_name: string, email: string } | null
}

export function TradeMatchingTable({ initialListings }: { initialListings: Listing[] }) {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [matching, setMatching] = useState<string | null>(null)

  const buyOrders = listings.filter(l => l.type === 'buy')
  const sellOrders = listings.filter(l => l.type === 'sell')

  async function executeTrade(sellOrder: Listing) {
    const matchedBuyOrder = buyOrders.find(b => b.amount_civict >= sellOrder.amount_civict)
    
    if (!matchedBuyOrder) {
      toast.error('No matching buy order found for this amount.')
      return
    }

    setMatching(sellOrder.id)
    const loadingToast = toast.loading('Executing trade...')

    try {
      const res = await fetch('/api/admin/market/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sell_id: sellOrder.id, buy_id: matchedBuyOrder.id })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Trade executed successfully! CIVICT transferred.', { id: loadingToast })
        setListings(prev => prev.filter(l => l.id !== sellOrder.id && l.id !== matchedBuyOrder.id))
      } else {
        throw new Error(data.error || 'Failed to execute trade')
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast })
    } finally {
      setMatching(null)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Sell Orders */}
      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardContent className="pt-6">
          <h3 className="font-serif text-lg font-bold text-ink dark:text-white mb-4">Sell Orders (Voters)</h3>
          <div className="space-y-3">
            {sellOrders.length === 0 && <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-4">No open sell orders.</p>}
            {sellOrders.map(order => (
              <div key={order.id} className="border border-border dark:border-[#1f3a2c] rounded-lg p-3 flex flex-col gap-2 bg-sand/50 dark:bg-[#0f1d16]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">{order.users?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted dark:text-[#c0d0c4]">{order.users?.email}</p>
                  </div>
                  <Badge variant="secondary" className="dark:bg-[#1b3a2b] dark:text-white">Selling</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-ink dark:text-white">₡ {order.amount_civict}</span>
                  <span className="text-muted dark:text-[#c0d0c4]">@ ₦{order.rate_naira} each</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-forest hover:bg-forest-mid mt-1"
                  onClick={() => executeTrade(order)}
                  disabled={matching === order.id}
                >
                  {matching === order.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRightLeft className="h-4 w-4 mr-2" />}
                  Match & Execute
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Buy Orders */}
      <Card className="dark:bg-[#11241b] dark:border-[#1f3a2c]">
        <CardContent className="pt-6">
          <h3 className="font-serif text-lg font-bold text-ink dark:text-white mb-4">Buy Orders (Candidates)</h3>
          <div className="space-y-3">
            {buyOrders.length === 0 && <p className="text-sm text-muted dark:text-[#c0d0c4] text-center py-4">No open buy orders.</p>}
            {buyOrders.map(order => (
              <div key={order.id} className="border border-border dark:border-[#1f3a2c] rounded-lg p-3 flex flex-col gap-2 bg-sand/50 dark:bg-[#0f1d16]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">{order.users?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted dark:text-[#c0d0c4]">{order.users?.email}</p>
                  </div>
                  <Badge variant="default" className="bg-gold text-ink">Buying</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-ink dark:text-white">₡ {order.amount_civict}</span>
                  <span className="text-muted dark:text-[#c0d0c4]">@ ₦{order.rate_naira} each</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}