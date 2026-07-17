// src/app/(dashboard)/redeem/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function RedeemPage() {
  const router = useRouter()
  const [rate, setRate] = useState<any>(null)
  const [kyc, setKyc] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [banks, setBanks] = useState<any[]>([])
  const [bankCode, setBankCode] = useState('')
  const [acctNum, setAcctNum] = useState('')
  const [acctName, setAcctName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }

    async function load() {
      const [info, kycData, balData, banksData, histData] = await Promise.all([
        fetch('/api/redeem/info', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/redeem/kyc', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/civict/balance', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/redeem/banks', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/redeem/history', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      ])
      setRate(info)
      setKyc(kycData.kyc)
      setBalance(balData.balance || 0)
      setBanks(banksData.banks || [])
      setHistory(histData.redemptions || [])
    }
    load()
  }, [router])

  async function verifyBank() {
    if (!bankCode || acctNum.length !== 10) return
    setLoading(true)
    const token = localStorage.getItem('dico_token')
    try {
      const res = await fetch('/api/redeem/kyc/verify-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ account_number: acctNum, bank_code: bankCode }),
      })
      const data = await res.json()
      if (res.ok) {
        setAcctName(data.account_name)
        setKyc({ ...data, kyc_status: 'verified' })
      }
    } finally { setLoading(false) }
  }

  async function redeem() {
    if (!amount || !rate) return
    const token = localStorage.getItem('dico_token')
    setLoading(true); setMsg('')
    try {
      const res = await fetch('/api/redeem/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ civict_amount: parseInt(amount) }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Failed'); return }
      setMsg(`✅ Redemption submitted! ${data.summary?.net_naira} on the way.`)
      setBalance(balance - parseInt(amount))
      setAmount('')
    } finally { setLoading(false) }
  }

  const gross = parseInt(amount || '0') && rate ? parseInt(amount) / rate.rate?.civict_per_naira : 0
  const fee = gross * (rate?.platform_fee_pct || 0) / 100
  const net = gross - fee

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-gold bg-gold/10 px-2.5 py-1 rounded inline-block mb-2">
          CIVICT → Nigerian Naira
        </span>
        <h1 className="font-serif text-2xl font-black text-ink">Redeem</h1>
      </div>

      <div className="bg-gradient-to-br from-[#071E12] to-[#0F5438] rounded-xl p-6 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-serif text-2xl font-black text-gold">{rate?.rate?.civict_per_naira?.toLocaleString() || '–'}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-white/40">CIVICT per ₦1</p>
          </div>
          <div>
            <p className="font-serif text-2xl font-black text-white">{(rate?.min_civict || 0).toLocaleString()}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-white/40">Min to Redeem</p>
          </div>
          <div>
            <p className="font-serif text-2xl font-black text-white">₦{(rate?.max_naira_daily || 0).toLocaleString()}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-white/40">Max Daily</p>
          </div>
        </div>
      </div>

      {/* KYC */}
      <Card>
        <CardHeader><CardTitle className="text-base">1. Verify Your Bank Account</CardTitle></CardHeader>
        <CardContent>
          {kyc?.kyc_status === 'verified' ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span>✅</span>
              <div>
                <p className="text-sm font-semibold text-ink">{kyc.account_name}</p>
                <p className="text-xs text-muted-text">{kyc.bank_name} · {kyc.account_number}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <select value={bankCode} onChange={e => setBankCode(e.target.value)} className="w-full h-10 px-3 border border-border rounded-md text-sm">
                <option value="">Select bank</option>
                {banks.map((b: any) => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
              <Input placeholder="Account number (10 digits)" maxLength={10} value={acctNum} onChange={e => setAcctNum(e.target.value.replace(/\D/g, ''))} />
              <Button onClick={verifyBank} disabled={loading || acctNum.length !== 10} className="bg-forest hover:bg-forest-mid">Verify</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redeem */}
      <Card>
        <CardHeader><CardTitle className="text-base">2. Redeem CIVICT</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold">CIVICT to Redeem</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Min 5,000 CIVICT" />
            <p className="text-xs text-muted-text mt-1">Available: <strong>{balance.toLocaleString()}</strong> CIVICT</p>
          </div>

          {parseInt(amount || '0') > 0 && (
            <div className="p-3 bg-forest-faint rounded-lg text-sm space-y-1">
              <div className="flex justify-between"><span>Gross</span><span>₦{gross.toFixed(2)}</span></div>
              <div className="flex justify-between text-red-600"><span>Fee ({rate?.platform_fee_pct || 0}%)</span><span>-₦{fee.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-forest border-t border-border pt-1 mt-1"><span>You receive</span><span>₦{net.toFixed(2)}</span></div>
            </div>
          )}

          <Button onClick={redeem} disabled={loading || !kyc || !amount} className="w-full bg-gold hover:bg-gold/90 text-ink font-bold">
            {loading ? 'Processing...' : 'Redeem CIVICT → Naira'}
          </Button>
          {msg && <p className="text-sm text-muted-text">{msg}</p>}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Redemption History</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-text text-center py-4">No redemptions yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((r: any) => (
                <div key={r.id} className="flex justify-between py-2 border-b border-border-light last:border-0 text-sm">
                  <div>
                    <p className="font-medium text-ink">₡ {r.civict_amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-text">{new Date(r.requested_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink">{r.naira_net_display}</p>
                    <Badge variant={r.status === 'completed' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
