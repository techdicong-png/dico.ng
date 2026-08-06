'use client'

import { useState } from 'react'
import { Store, Search, ShoppingCart, ChevronRight } from 'lucide-react'

const categories = ['All Items', 'Civic Merch', 'Services', 'Digital Goods']

const items = [
  { cat: 'Civic Merch', icon: 'tshirt', title: 'Verified Voter Tee', desc: 'Premium cotton shirt with official DICO verification emblem.', price: '1,200', btn: 'Buy Now' },
  { cat: 'Services', icon: 'laptop-code', title: 'Campaign Web Design', desc: 'Professional 3-page website setup for local civic campaigns.', price: '15,000', btn: 'Hire Now' },
  { cat: 'Digital Goods', icon: 'id-card', title: 'Digital Voter ID', desc: 'Blockchain-verified digital identification card for your wallet.', price: '500', btn: 'Purchase' },
  { cat: 'Services', icon: 'bullhorn', title: 'Town Hall Promo', desc: 'Boost your upcoming session to verified voters in your constituency.', price: '8,500', btn: 'Promote' },
  { cat: 'Civic Merch', icon: 'mug-hot', title: 'Constituency Mug', desc: 'Ceramic mug featuring the DICO forest-green crest.', price: '800', btn: 'Buy Now' },
  { cat: 'Civic Merch', icon: 'cap', title: 'Branded Face Cap', desc: 'Adjustable cap with embroidered DICO logo.', price: '2,000', btn: 'Buy Now' },
  { cat: 'Digital Goods', icon: 'print', title: 'Custom Flyers (1000)', desc: 'High-quality campaign flyers with your candidate details.', price: '8,500', btn: 'Order' },
  { cat: 'Services', icon: 'megaphone', title: 'Loud Megaphone', desc: 'Portable PA system for rallies and town hall meetings.', price: '15,000', btn: 'Buy Now' },
]

const iconMap: Record<string, string> = {
  tshirt: '👕', 'laptop-code': '💻', 'id-card': '🪪', bullhorn: '📢',
  'mug-hot': '☕', cap: '🧢', print: '🖨️', megaphone: '📣',
}

export default function MarketPage() {
  const [activeFilter, setActiveFilter] = useState('All Items')
  const [search, setSearch] = useState('')

  const filtered = items.filter(item => {
    const matchCat = activeFilter === 'All Items' || item.cat === activeFilter
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">
            Marketplace
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Dico Online Market</h1>
          <p className="text-sm text-muted dark:text-[#c0d0c4]">Trade civic goods, services, and merchandise using your CIVICT balance.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gold hover:bg-gold-hover text-[#2d2107] transition-all">
          <Store className="h-4 w-4" /> Become a Vendor
        </button>
      </div>

      {/* Search */}
      <div className="bg-card dark:bg-[#11241b] border border-border-tint dark:border-[#1f3a2c] rounded-lg px-4 py-3 flex items-center gap-2.5">
        <Search className="h-4 w-4 text-muted dark:text-[#c0d0c4]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search for goods and services..."
          className="w-full bg-transparent border-none outline-none text-sm text-ink dark:text-white placeholder:text-muted/60 dark:placeholder:text-[#c0d0c4]/60 font-sans" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              activeFilter === cat
                ? 'bg-forest-800 text-white border-forest-800 dark:bg-white dark:text-forest-800 dark:border-white'
                : 'bg-card dark:bg-[#11241b] text-muted dark:text-[#c0d0c4] border-border-tint dark:border-[#1f3a2c] hover:border-forest-800'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((item, i) => (
          <div key={i}
            className="bg-card dark:bg-[#11241b] border border-border-tint dark:border-[#1f3a2c] rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.42)] hover:border-gold dark:hover:border-gold transition-all">
            {/* Image */}
            <div className="h-32 bg-mint dark:bg-[#102019] flex items-center justify-center text-4xl text-forest-800 dark:text-[#d4ebdf]">
              {iconMap[item.icon] || '📦'}
            </div>
            {/* Body */}
            <div className="p-4 flex flex-col flex-1">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gold-500 dark:text-gold mb-1">{item.cat}</p>
              <h3 className="font-serif font-bold text-ink dark:text-white mb-2">{item.title}</h3>
              <p className="text-xs text-muted dark:text-[#c0d0c4] flex-1 mb-3">{item.desc}</p>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="font-bold text-ink dark:text-white">₡ {item.price}</span>
              </div>
              <button className="w-full py-2 rounded-lg text-sm font-semibold bg-forest-800 dark:bg-white text-white dark:text-forest-800 hover:bg-forest-700 dark:hover:bg-[#e8faf2] transition-all font-sans">
                {item.btn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card dark:bg-[#11241b] border border-border-tint dark:border-[#1f3a2c] rounded-xl py-16 text-center">
          <Store className="h-10 w-10 text-muted dark:text-[#c0d0c4] mx-auto mb-3" />
          <p className="text-sm text-muted dark:text-[#c0d0c4]">No items found matching your search.</p>
        </div>
      )}
    </div>
  )
}