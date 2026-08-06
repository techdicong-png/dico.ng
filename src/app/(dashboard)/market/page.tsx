'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MarketPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState('50')

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('dico_user') || '{}')
    setUser(u)
    loadListings()
  }, [])

  async function loadListings() {
    setLoading(true)
    const { data } = await supabase
      .from('civict_market_listings')
      .select('*, users(full_name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    
    setListings(data || [])
    setLoading(false)
  }

  async function placeListing(type: 'buy' | 'sell') {
    if (!amount || !rate) return toast.error('Please enter amount and rate')
    
    const token = localStorage.getItem('dico_token')
    const res = await fetch('/api/market/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ type, amount_civict: parseInt(amount), rate_naira: parseFloat(rate) })
    })

    const data = await res.json()
    if (res.ok) {
      toast.success(`${type === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`)
      setAmount('')
      loadListings()
    } else {
      toast.error(data.error || 'Failed to place order')
    }
  }

  const buyOrders = listings.filter(l => l.type === 'buy')
  const sellOrders = listings.filter(l => l.type === 'sell')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-gold bg-gold/10 px-2.5 py-1 rounded inline-block mb-2">
          CIVICT Market
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink">Trade CIVICT</h1>
        <p className="text-sm text-muted">Buy and sell CIVICT tokens. Current base price: ₦50.00</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-forest text-white">
          <CardContent className="pt-6">
            <Wallet className="h-5 w-5 text-gold mb-2" />
            <p className="font-serif text-2xl font-black">₡ {user?.civict_balance || 0}</p>
            <p className="text-xs text-white/60 uppercase">Your Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
            <p className="font-serif text-2xl font-black text-green-600">₦52.00</p>
            <p className="text-xs text-muted uppercase">Today's High</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <TrendingDown className="h-5 w-5 text-red-600 mb-2" />
            <p className="font-serif text-2xl font-black text-red-600">₦48.00</p>
            <p className="text-xs text-muted uppercase">Today's Low</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trading Panel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Place Order</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold">Amount (CIVICT)</label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 100" />
              </div>
              <div>
                <label className="text-xs font-semibold">Rate (₦ per CIVICT)</label>
                <Input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="50" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => placeListing('buy')}>
                <ArrowUpCircle className="h-4 w-4 mr-2" /> Place Buy Order
              </Button>
              <Button className="bg-forest hover:bg-forest-mid" onClick={() => placeListing('sell')}>
                <ArrowDownCircle className="h-4 w-4 mr-2" /> Place Sell Order
              </Button>
            </div>
            <p className="text-xs text-muted">Note: Placing a sell order locks the CIVICT in your wallet until matched or cancelled.</p>
          </CardContent>
        </Card>

        {/* Market Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Order Book</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy Orders ({buyOrders.length})</TabsTrigger>
                <TabsTrigger value="sell">Sell Orders ({sellOrders.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="buy" className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {buyOrders.length === 0 ? <p className="text-sm text-muted text-center py-4">No buy orders.</p> : 
                  buyOrders.map(o => (
                    <div key={o.id} className="flex justify-between items-center p-2 border border-border-light rounded text-sm">
                      <span className="font-medium text-ink">{o.users?.full_name || 'Anonymous'}</span>
                      <span className="text-muted">₡ {o.amount_civict} @ ₦{o.rate_naira}</span>
                    </div>
                  ))
                }
              </TabsContent>
              <TabsContent value="sell" className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {sellOrders.length === 0 ? <p className="text-sm text-muted text-center py-4">No sell orders.</p> : 
                  sellOrders.map(o => (
                    <div key={o.id} className="flex justify-between items-center p-2 border border-border-light rounded text-sm">
                      <span className="font-medium text-ink">{o.users?.full_name || 'Anonymous'}</span>
                      <span className="text-muted">₡ {o.amount_civict} @ ₦{o.rate_naira}</span>
                    </div>
                  ))
                }
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}