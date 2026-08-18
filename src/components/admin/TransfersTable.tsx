'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

type Transfer = {
  id: string
  amount: number
  status: string
  created_at: string
  sender: { full_name: string } | null
  recipient: { full_name: string } | null
}

export function TransfersTable({ initialData }: { initialData: Transfer[] }) {
  const [transfers, setTransfers] = useState<Transfer[]>(initialData)

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const loadingToast = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} transfer...`)
    
    try {
      const res = await fetch(`/api/admin/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (res.ok) {
        toast.success(`Transfer ${status}!`, { id: loadingToast })
        setTransfers(transfers.map(t => t.id === id ? { ...t, status } : t))
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update transfer')
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {transfers.length === 0 && (
        <Card className="col-span-full dark:bg-[#11241b] dark:border-[#1f3a2c]">
          <CardContent className="py-12 text-center text-muted dark:text-[#c0d0c4]">No pending transfers.</CardContent>
        </Card>
      )}
      
      {transfers.map(transfer => (
        <Card key={transfer.id} className={`${transfer.status === 'pending' ? 'border-gold' : ''} dark:bg-[#11241b] dark:border-[#1f3a2c]`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-ink dark:text-white text-lg">₡ {transfer.amount}</p>
              <Badge variant={transfer.status === 'approved' ? 'default' : transfer.status === 'rejected' ? 'destructive' : 'secondary'}>
                {transfer.status}
              </Badge>
            </div>
            
            <div className="space-y-1 mb-4 text-sm">
              <p className="text-muted dark:text-[#c0d0c4]">From: <span className="font-semibold text-ink dark:text-white">{transfer.sender?.full_name || 'Unknown'}</span></p>
              <p className="text-muted dark:text-[#c0d0c4]">To: <span className="font-semibold text-ink dark:text-white">{transfer.recipient?.full_name || 'Unknown'}</span></p>
              <p className="text-xs text-muted dark:text-[#c0d0c4] mt-1">{new Date(transfer.created_at).toLocaleString()}</p>
            </div>

            {transfer.status === 'pending' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(transfer.id, 'approved')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" className="w-full" onClick={() => updateStatus(transfer.id, 'rejected')}>
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