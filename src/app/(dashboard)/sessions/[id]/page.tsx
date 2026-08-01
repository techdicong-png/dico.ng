// src/app/(dashboard)/sessions/[id]/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Play, MessageCircle, ThumbsUp, Send, Users, Clock, ChevronRight } from 'lucide-react'

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
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('dico_token')
    if (!token) { router.push('/login'); return }
    const user = JSON.parse(localStorage.getItem('dico_user') || '{}')

    fetch(`/api/sessions/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setSession(d.session)
        setQuestions(d.questions || [])
        setIsLive(d.session?.status === 'live')
      })

    const channel = supabase.channel(`session:${id}`)

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast', event: 'join',
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] min-h-[calc(100vh-3.5rem)]">
      {/* ========== MAIN ========== */}
      <div className="overflow-y-auto p-4 md:p-6 space-y-6">
        {session && (
          <>
            {/* Video Placeholder */}
            <div className="relative bg-gradient-to-br from-forest-dark via-forest-mid to-forest rounded-xl overflow-hidden h-64 md:h-80 flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute w-32 h-32 rounded-full border border-white/20 top-10 right-10 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-20 h-20 rounded-full border border-gold/20 bottom-10 left-10 animate-[spin_15s_linear_infinite_reverse]" />
              
              {isLive ? (
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card/20 backdrop-blur flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 md:h-10 md:w-10 text-white ml-1" />
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-white/80 text-xs font-bold tracking-widest uppercase">Live Stream</span>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-card/20 backdrop-blur flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <span className="text-white/60 text-xs font-bold tracking-widest uppercase">Watch Replay</span>
                </div>
              )}
            </div>

            {/* Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-forest-800 dark:text-[#d4ebdf] bg-forest-light dark:bg-[#1b3a2b] px-2 py-0.5 rounded">Replay</span>
                  )}
                  <span className="text-xs text-muted dark:text-[#c0d0c4] flex items-center gap-1">
                    <Users className="h-3 w-3" /> {viewers} watching
                  </span>
                </div>
                <h1 className="font-serif text-xl md:text-2xl font-black text-ink dark:text-white">{session.title}</h1>
                <p className="text-sm text-muted dark:text-[#c0d0c4]">🎙️ {session.candidates?.full_name} · {session.candidates?.party} · {session.candidates?.office}</p>
              </div>

              {session.scheduled_at && (
                <span className="text-xs text-muted dark:text-[#c0d0c4] flex items-center gap-1 bg-forest-faint dark:bg-[#1b3a2b] px-3 py-1.5 rounded-lg shrink-0">
                  <Clock className="h-3 w-3" />
                  {new Date(session.scheduled_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Users, label: 'Viewers', value: viewers },
                { icon: MessageCircle, label: 'Questions', value: questions.length },
                { icon: ThumbsUp, label: 'Upvotes', value: session.demand_topic || '–' },
                { icon: Clock, label: 'Duration', value: session.duration || 'Live' },
              ].map(s => (
                <div key={s.label} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-4">
                  <s.icon className="h-4 w-4 text-muted dark:text-[#c0d0c4] mb-1.5" />
                  <p className="font-serif text-lg font-black text-ink dark:text-white">{s.value}</p>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-muted dark:text-[#c0d0c4]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Ask Question */}
            <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-5">
              <h3 className="text-sm font-bold text-ink dark:text-white mb-3">
                Ask a Question <span className="text-gold text-xs font-normal ml-2">+20 CIVICT</span>
              </h3>
              <div className="flex gap-2">
                <input value={qText} onChange={e => setQText(e.target.value)}
                  placeholder="Type your question for the candidate..."
                  className="flex-1 px-3.5 py-2.5 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60"
                  onKeyDown={e => e.key === 'Enter' && submitQuestion()} />
                <button onClick={submitQuestion}
                  className="bg-forest hover:bg-forest-mid text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 shrink-0">
                  <Send className="h-3.5 w-3.5" /> Ask
                </button>
              </div>
            </div>

            {/* Live Questions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-ink dark:text-white">Live Questions</h3>
                <span className="text-[10px] font-bold text-forest-800 dark:text-[#d4ebdf] bg-forest-light dark:bg-[#1b3a2b] px-2 py-0.5 rounded">{questions.length}</span>
              </div>
              {questions.length === 0 ? (
                <div className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl py-8 text-center">
                  <p className="text-sm text-muted dark:text-[#c0d0c4]">No questions yet. Be the first to ask!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions.map((q: any) => (
                    <div key={q.id} className="bg-card dark:bg-[#11241b] border border-border dark:border-[#1f3a2c] rounded-xl p-4 hover:border-forest/30 dark:hover:border-gold/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest-light dark:bg-[#1b3a2b] text-forest-800 dark:text-[#d4ebdf] flex items-center justify-center text-xs font-bold shrink-0">
                          {(q.user_name || q.users?.full_name || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink dark:text-white">{q.question_text}</p>
                          <p className="text-xs text-muted dark:text-[#c0d0c4] mt-1">
                            by {q.user_name || q.users?.full_name || 'Voter'} {q.ward ? `· ${q.ward}` : ''}
                          </p>
                        </div>
                        <button className="text-muted dark:text-[#c0d0c4] hover:text-forest dark:hover:text-white text-xs flex items-center gap-1 shrink-0">
                          <ThumbsUp className="h-3.5 w-3.5" /> {q.upvote_count || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ========== CHAT SIDEBAR ========== */}
      <div className="border-l border-border dark:border-[#1f3a2c] bg-card dark:bg-[#11241b] flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">
        <div className="p-3 border-b border-border dark:border-[#1f3a2c] flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-forest dark:text-forest-700" />
          <span className="text-xs font-bold tracking-wider uppercase text-ink dark:text-white">Session Chat</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chat.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted dark:text-[#c0d0c4]">No messages yet.</p>
            </div>
          ) : (
            chat.map((msg, i) => (
              <div key={i} className="bg-forest-faint dark:bg-[#0f1d16] rounded-lg p-2.5">
                <p className="text-xs font-bold text-forest dark:text-forest-700">
                  {msg.user_name}
                  <span className="font-normal text-muted dark:text-[#c0d0c4] ml-1.5">· {msg.ward || 'Ward'}</span>
                </p>
                <p className="text-sm text-ink dark:text-white mt-0.5">{msg.message}</p>
              </div>
            ))
          )}
          <div ref={chatEnd} />
        </div>

        <div className="p-3 border-t border-border dark:border-[#1f3a2c] flex gap-2">
          <input value={chatText} onChange={e => setChatText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm text-ink dark:text-white bg-card dark:bg-[#0f1d16] border border-border dark:border-[#1f3a2c] rounded-lg focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/12 placeholder:text-muted/60"
            onKeyDown={e => e.key === 'Enter' && sendChat()} />
          <button onClick={sendChat}
            className="h-9 w-9 bg-forest hover:bg-forest-mid text-white rounded-lg flex items-center justify-center transition-all shrink-0">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
