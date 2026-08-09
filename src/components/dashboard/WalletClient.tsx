'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet, ArrowUpRight, ArrowDownLeft, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function WalletClient({ initialBalance, initialHistory }: { initialBalance: number, initialHistory: any[] }) {
  const [balance, setBalance] = useState(initialBalance)
  const [history, setHistory] = useState<any[]>(initialHistory)
  
  const [recipientEmail, setRecipientEmail] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferring, setTransferring] = useState(false)

  async function handleTransfer() {
    if (!recipientEmail || !transferAmount) return toast.error('Enter email and amount')
    
    setTransferring(true)
    const token = localStorage.getItem('dico_token')
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientEmail, amount: parseInt(transferAmount) })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Transfer initiated! Pending Admin approval.')
        setBalance(balance - parseInt(transferAmount))
        setRecipientEmail('')
        setTransferAmount('')
      } else {
        throw new Error(data.error || 'Transfer failed')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
          Civic Wallet
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Your CIVICT Balance</h1>
        <p className="text-sm text-muted dark:text-[#c0d0c4]">Earn tokens by participating in civic activities.</p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-mid rounded-xl p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(200,150,10,0.15),transparent_40%)] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Available Balance</span>
          </div>
          <p className="font-serif text-4xl md:text-5xl font-black mb-2">
            <span className="text-gold text-2xl md:text-3xl">₡</span> {balance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send CIVICT Form */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4 text-forest" /> Send CIVICT (P2P)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted">Send CIVICT to another voter or candidate by their email. Transfers require Admin approval.</p>
            <div>
              <label className="text-xs font-semibold text-ink mb-1.5 block">Recipient Email</label>
              <Input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="voter@example.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink mb-1.5 block">Amount (CIVICT)</label>
              <Input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="e.g. 50" />
            </div>
            <Button onClick={handleTransfer} disabled={transferring} className="w-full bg-forest hover:bg-forest-mid">
              {transferring ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Initiate Transfer
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No transactions yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((tx, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border-light last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{tx.description}</p>
                        <p className="text-xs text-muted">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-serif text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} ₡
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}