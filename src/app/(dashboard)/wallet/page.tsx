'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Clock, Award, TrendingUp } from 'lucide-react'

const txHistory = [
  { type: 'earn', desc: 'Town Hall Attendance Reward', date: 'Yesterday', amount: '+₡ 80' },
  { type: 'spend', desc: 'Market Purchase: Digital Voter ID', date: '2 days ago', amount: '-₡ 500' },
  { type: 'earn', desc: 'Poll Participation Bonus', date: '5 days ago', amount: '+₡ 50' },
  { type: 'earn', desc: 'Report Resolution Reward', date: '1 week ago', amount: '+₡ 150' },
  { type: 'spend', desc: 'Market Purchase: Verified Voter Tee', date: '2 weeks ago', amount: '-₡ 1,200' },
  { type: 'earn', desc: 'Constituency Referral Bonus', date: '3 weeks ago', amount: '+₡ 200' },
]

const stats = [
  { icon: Award, label: 'CIVICT Earned', value: '₡ 4,850', sub: 'All time' },
  { icon: TrendingUp, label: 'This Month', value: '₡ 340', sub: '+₡ 80 from last month' },
  { icon: Clock, label: 'Pending Rewards', value: '₡ 120', sub: '2 unclaimed' },
]

export default function WalletPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) router.push('/login')
  }, [router])

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
        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border border-white/5" />
        <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full border border-gold/10" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Available Balance</span>
          </div>
          <p className="font-serif text-4xl md:text-5xl font-black mb-2">
            <span className="text-gold text-2xl md:text-3xl">₡</span> 2,450
          </p>
          <p className="text-white/60 text-sm">+340 earned this month</p>

          <div className="flex gap-3 mt-6">
            <button className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
              <ArrowUpRight className="h-4 w-4" /> Withdraw
            </button>
            <button className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-[#2d2107] font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
              <Plus className="h-4 w-4" /> Top Up
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5">
            <s.icon className="h-5 w-5 text-gold mb-3" />
            <p className="font-serif text-xl font-black text-ink dark:text-white">{s.value}</p>
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4] mt-1">{s.label}</p>
            <p className="text-xs text-muted dark:text-[#c0d0c4] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* How to Earn */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="text-base font-bold text-ink dark:text-white">🎯 Earn More CIVICT</h3>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { action: 'Vote in a Poll', reward: '+10 ₡', desc: 'Share your opinion on constituency issues' },
              { action: 'Attend Town Hall', reward: '+80 ₡', desc: 'Join live sessions with candidates' },
              { action: 'File a Report', reward: '+15 ₡', desc: 'Report infrastructure problems in your area' },
              { action: 'Refer a Friend', reward: '+200 ₡', desc: 'Invite verified voters to join DICO' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-forest-faint dark:bg-[#0f1d16] border border-border-light dark:border-[#1f3a2c]">
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-white">{item.action}</p>
                  <p className="text-xs text-muted dark:text-[#c0d0c4]">{item.desc}</p>
                </div>
                <span className="text-sm font-bold text-gold shrink-0 ml-3">{item.reward}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl">
        <div className="px-5 py-4 border-b border-border dark:border-[#1f3a2c]">
          <h3 className="text-base font-bold text-ink dark:text-white">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border dark:border-[#1f3a2c]">
                <th className="text-left px-5 py-3 text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">Description</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">Date</th>
                <th className="text-right px-5 py-3 text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {txHistory.map((tx, i) => (
                <tr key={i} className="border-b border-border-light dark:border-[#1f3a2c] last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'earn' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {tx.type === 'earn' ? (
                          <ArrowDownLeft className={`h-4 w-4 ${tx.type === 'earn' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                        ) : (
                          <ArrowUpRight className={`h-4 w-4 ${tx.type === 'earn' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                        )}
                      </div>
                      <p className="text-sm font-medium text-ink dark:text-white">{tx.desc}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted dark:text-[#c0d0c4]">{tx.date}</td>
                  <td className={`px-5 py-3.5 text-sm font-bold text-right ${
                    tx.type === 'earn' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {txHistory.length === 0 && (
        <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-16 text-center">
          <Wallet className="h-10 w-10 text-muted dark:text-[#c0d0c4] mx-auto mb-3" />
          <p className="text-sm text-muted dark:text-[#c0d0c4]">No transactions yet.</p>
        </div>
      )}
    </div>
  )
}
