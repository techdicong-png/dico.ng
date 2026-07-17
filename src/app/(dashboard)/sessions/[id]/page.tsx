// src/app/(dashboard)/sessions/[id]/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LiveSessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [chat, setChat] = useState<any[]>([])
  const [viewers, setViewers] = useState(0)
  const [qText, setQText] = useState('')
  const [chatText, setChatText] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')

    // Load session data
    fetch(`/api/sessions/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setSession(d.session)
        setQuestions(d.questions || [])
      })

    // Subscribe to real-time changes
    const channel = supabase.channel(`session:${id}`)

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'join',
          payload: { user_name: user.full_name || 'Anonymous' },
        })
      }
    })

    channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
      setChat(prev => [...prev, payload])
    })

    channel.on('broadcast', { event: 'question' }, ({ payload }) => {
      setQuestions(prev => [{ ...payload, id: Date.now() }, ...prev])
    })

    channel.on('broadcast', { event: 'viewer_count' }, ({ payload }) => {
      setViewers(payload.count)
    })

    // Track viewer count
    const interval = setInterval(() => {
      channel.send({ type: 'broadcast', event: 'ping', payload: {} })
    }, 30000)

    return () => { channel.unsubscribe(); clearInterval(interval) }
  }, [id, router])

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  async function submitQuestion() {
    if (!qText.trim()) return
    const token = localStorage.getItem('dico_token')
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')

    const res = await fetch('/api/questions/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ candidate_id: session?.candidate_id, question_text: qText, session_id: id }),
    })
    const data = await res.json()
    if (res.ok) {
      supabase.channel(`session:${id}`).send({
        type: 'broadcast', event: 'question',
        payload: { question_text: qText, user_name: user.full_name, ward: user.ward },
      })
      setQText('')
    }
  }

  function sendChat() {
    if (!chatText.trim()) return
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')
    supabase.channel(`session:${id}`).send({
      type: 'broadcast', event: 'chat',
      payload: { user_name: user.full_name, ward: user.ward, message: chatText, time: new Date().toISOString() },
    })
    setChatText('')
  }

  return (
    <div className="grid grid-cols-[1fr_320px] h-[calc(100vh-3.5rem)]">
      {/* Main */}
      <div className="overflow-y-auto p-6 space-y-6">
        {session && (
          <>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="destructive" className="animate-pulse">● LIVE</Badge>
                <span className="text-sm text-muted-text">{viewers} viewers</span>
              </div>
              <h1 className="font-serif text-2xl font-black text-ink">{session.title}</h1>
              <p className="text-sm text-muted-text">🎙️ {session.candidates?.full_name} · {session.topic}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Viewers', value: viewers },
                { label: 'Questions', value: questions.length },
                { label: 'Demand', value: session.demand_topic || '–' },
              ].map(s => (
                <div key={s.label} className="bg-forest-faint rounded-lg p-3 text-center">
                  <p className="font-serif text-xl font-black text-forest">{s.value}</p>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-muted-text">{s.label}</p>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">❓ Ask a Question <span className="text-gold text-xs">+20 CIVICT</span></CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={qText} onChange={e => setQText(e.target.value)} placeholder="Type your question..." />
                  <Button onClick={submitQuestion} className="bg-forest hover:bg-forest-mid">Ask (+20 ₡)</Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="font-semibold text-ink">Live Questions</h2>
              {questions.map((q: any) => (
                <Card key={q.id}>
                  <CardContent className="py-3">
                    <p className="text-sm text-ink">{q.question_text}</p>
                    <p className="text-xs text-muted-text mt-1">by {q.user_name || q.users?.full_name || 'Voter'} {q.ward ? `· ${q.ward}` : ''}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Chat sidebar */}
      <div className="border-l border-border bg-white flex flex-col">
        <div className="p-3 border-b border-border text-xs font-bold tracking-wider uppercase text-muted-text">Session Chat</div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chat.map((msg, i) => (
            <div key={i} className="bg-forest-faint rounded-lg p-2">
              <p className="text-xs font-bold text-forest">{msg.user_name} <span className="font-normal text-muted-text">· {msg.ward || ''}</span></p>
              <p className="text-sm text-ink">{msg.message}</p>
            </div>
          ))}
          <div ref={chatEnd} />
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <Input value={chatText} onChange={e => setChatText(e.target.value)} placeholder="Type a message..." className="text-sm" />
          <Button size="sm" onClick={sendChat} className="bg-forest hover:bg-forest-mid">→</Button>
        </div>
      </div>
    </div>
  )
}
