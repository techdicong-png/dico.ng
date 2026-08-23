'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Search, Plus, X, Loader2, Upload, Image as ImageIcon, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MarketPage() {
  const [items, setItems] = useState<any[]>([])
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  
  // Modal state
  const [showSellModal, setShowSellModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [listing, setListing] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'physical', image_url: '' })

  const categories = ['All', 'Physical', 'Digital', 'Service']

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*, users(full_name)')
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
    
    if (data) setItems(data)
    if (error) toast.error('Failed to load marketplace items.')
    setLoading(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('marketplace-items').upload(path, file)
    if (error) {
      toast.error('Image upload failed.')
    } else {
      const { data } = supabase.storage.from('marketplace-items').getPublicUrl(path)
      setForm(prev => ({ ...prev, image_url: data.publicUrl }))
      toast.success('Image uploaded.')
    }
    setUploading(false)
  }

  async function handleList() {
    if (!form.title || !form.price) return toast.error('Title and price are required.')
    
    setListing(true)
    const token = localStorage.getItem('dico_token')
    const res = await fetch('/api/marketplace/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price_civict: parseInt(form.price),
        image_url: form.image_url,
        category: form.category
      })
    })

    if (res.ok) {
      toast.success('Item listed successfully!')
      setShowSellModal(false)
      setForm({ title: '', description: '', price: '', category: 'physical', image_url: '' })
      fetchItems()
    } else {
      toast.error('Failed to list item.')
    }
    setListing(false)
  }

   async function handleBuy(itemId: string, title: string, price: number) {
      setBuyingId(itemId)
      const token = localStorage.getItem('dico_token')
      
      try {
        const res = await fetch('/api/marketplace/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ itemId })
        })
        
        const data = await res.json()
        if (res.ok) {
          toast.success(`Purchase successful! ${price} CIVICT deducted for "${title}".`)
          fetchItems() // Refresh list to show item as sold
        } else {
          throw new Error(data.error || 'Failed to purchase')
        }
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setBuyingId(null)
      }
    }

  const filtered = items.filter(item => {
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    const matchesCat = activeFilter === 'All' || item.category.toLowerCase() === activeFilter.toLowerCase()
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-forest-800 dark:text-white bg-forest-light dark:bg-[#1b3a2b] px-2.5 py-1 rounded inline-block mb-2">Marketplace</span>
          <h1 className="font-serif text-2xl md:text-3xl font-black text-ink dark:text-white">Dico Online Market</h1>
          <p className="text-sm text-muted dark:text-[#c0d0c4]">Trade civic goods, services, and merchandise using CIVICT.</p>
        </div>
        <Button onClick={() => setShowSellModal(true)} className="bg-gold hover:bg-gold-hover text-ink">
          <Plus className="h-4 w-4 mr-2" /> Sell an Item
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted dark:text-[#c0d0c4]" />
          <input
            type="text"
            placeholder="Search for goods and services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 text-sm text-ink dark:text-white bg-white dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-forest"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                activeFilter === cat 
                  ? 'bg-forest text-white border-forest' 
                  : 'bg-white dark:bg-[#0f1d16] text-muted dark:text-[#c0d0c4] border-border dark:border-[#1f3a2c] hover:border-forest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-forest dark:text-forest-700" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-16 text-center">
          <Store className="h-10 w-10 text-muted dark:text-[#c0d0c4] mx-auto mb-3" />
          <p className="text-muted dark:text-[#c0d0c4]">No items found. Be the first to list an item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl overflow-hidden hover:shadow-md transition-all group">
              <div className="h-40 bg-mint dark:bg-[#1b3a2b] flex items-center justify-center text-4xl text-forest-800 dark:text-forest-700 overflow-hidden">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} width={300} height={160} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted dark:text-[#c0d0c4]" />
                )}
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gold mb-1">{item.category}</p>
                <h3 className="font-bold text-ink dark:text-white mb-1 truncate">{item.title}</h3>
                <p className="text-xs text-muted dark:text-[#c0d0c4] mb-3 line-clamp-2 h-8">{item.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink dark:text-white">₡ {item.price_civict.toLocaleString()}</span>
                  {item.is_sold ? (
                     <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-md">SOLD</span>
                  ) : (
                    <Button 
                      size="sm" 
                      className="bg-forest hover:bg-forest-mid"
                      onClick={() => handleBuy(item.id, item.title, item.price_civict)}
                      disabled={buyingId === item.id}
                    >
                      {buyingId === item.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5 mr-1" />}
                      {buyingId === item.id ? 'Buying...' : 'Buy'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SELL ITEM MODAL */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSellModal(false)}>
          <div className="bg-white dark:bg-[#11241b] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-forest text-white p-5 flex justify-between items-center sticky top-0">
              <h3 className="font-serif text-xl font-bold">List a New Item</h3>
              <button onClick={() => setShowSellModal(false)}><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <Label className="text-ink dark:text-white">Product Image</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border dark:border-[#1f3a2c] rounded-md">
                  <div className="space-y-1 text-center">
                    {form.image_url ? (
                      <div className="relative inline-block">
                        <Image src={form.image_url} alt="Preview" width={128} height={128} className="max-h-32 mx-auto rounded" />
                        <button type="button" onClick={() => setForm({...form, image_url: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"><X className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <>
                        {uploading ? <Loader2 className="mx-auto h-10 w-10 text-muted dark:text-[#c0d0c4] animate-spin" /> : <Upload className="mx-auto h-10 w-10 text-muted dark:text-[#c0d0c4]" />}
                        <div className="flex text-sm text-muted dark:text-[#c0d0c4] justify-center">
                          <label htmlFor="item-image" className="relative cursor-pointer bg-white dark:bg-[#11241b] rounded-md font-medium text-forest hover:text-gold">
                            <span>Upload a file</span>
                            <input id="item-image" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="title" className="text-ink dark:text-white">Item Title</Label>
                <Input id="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Campaign Flyers (1000 pcs)" className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-ink dark:text-white">Price (CIVICT)</Label>
                  <Input id="price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="e.g. 500" className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]" />
                </div>
                <div>
                  <Label htmlFor="category" className="text-ink dark:text-white">Category</Label>
                  <select 
                    id="category" 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-[#0f1d16] text-ink dark:text-white border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-forest"
                  >
                    <option value="physical">Physical Good</option>
                    <option value="digital">Digital (E-book/Software)</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-ink dark:text-white">Description</Label>
                <Textarea 
                  id="description" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  rows={3} 
                  placeholder="Describe the item or service..." 
                  className="bg-white dark:bg-[#0f1d16] dark:text-white dark:border-[#1f3a2c]"
                />
              </div>

              <Button onClick={handleList} disabled={listing} className="w-full bg-forest hover:bg-forest-mid h-11">
                {listing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Store className="h-4 w-4 mr-2" />}
                List Item for Sale
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}