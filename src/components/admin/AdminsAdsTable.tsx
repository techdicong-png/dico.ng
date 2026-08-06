'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

type Ad = {
  id: string
  business_name: string
  description: string | null
  target_states: string[]
  target_lgas: string[]
  image_url: string
  link_url: string
  status: string
  created_at: string
}

export function AdminAdsTable({ initialData }: { initialData: Ad[] }) {
  const [ads, setAds] = useState<Ad[]>(initialData)

  async function updateStatus(id: string, status: 'active' | 'rejected') {
    const loadingToast = toast.loading(`Updating ad status to ${status}...`)
    
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (res.ok) {
        toast.success(`Ad ${status === 'active' ? 'approved' : 'rejected'}!`, { id: loadingToast })
        // Update local state to remove it from the pending view
        setAds(ads.map(ad => ad.id === id ? { ...ad, status } : ad))
      } else {
        throw new Error('Failed to update status.')
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast })
    }
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ads.length === 0 && (
        <Card className="col-span-full"><CardContent className="py-12 text-center text-muted">No ads submitted yet.</CardContent></Card>
      )}
      
      {ads.map(ad => (
        <Card key={ad.id} className={ad.status === 'pending' ? 'border-gold' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-ink text-sm">{ad.business_name}</p>
                <p className="text-xs text-muted">{ad.target_lgas.join(', ')}, {ad.target_states.join(', ')}</p>
              </div>
              <Badge variant={ad.status === 'active' ? 'default' : ad.status === 'rejected' ? 'destructive' : 'secondary'}>
                {ad.status}
              </Badge>
            </div>
            
            <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block mb-3 group">
              <Image src={ad.image_url} alt={ad.business_name} width={300} height={128} className="w-full h-32 object-cover rounded border border-border" />
            </a>

            {ad.status === 'pending' && (
              <div className="flex gap-2">
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(ad.id, 'active')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus(ad.id, 'rejected')}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}