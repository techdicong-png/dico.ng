'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Send, ThumbsUp, CheckCircle, Radio } from 'lucide-react'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Question = {
  id: string
  question_text: string
  answer_text: string | null
  upvote_count: number
  user_id: string
  users: { full_name: string } | null
}

export function LiveSessionRoom({ sessionId, isCandidate }: { sessionId: string, isCandidate: boolean }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')

  const user = JSON.parse(localStorage.getItem('dico_user') || '{}')

  useEffect(() => {
    fetchQuestions()
    
    // Subscribe to new questions and updates in real-time
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'questions', filter: `session_id=eq.${sessionId}` }, 
        (payload) => {
          // Add new question to the top of the list
          setQuestions(prev => [payload.new as Question, ...prev])
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'questions', filter: `session_id=eq.${sessionId}` }, 
        (payload) => {
          // Update existing question (e.g., upvote or answer)
          setQuestions(prev => prev.map(q => q.id === (payload.new as Question).id ? payload.new as Question : q))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  async function fetchQuestions() {
    setLoading(true)
    const { data } = await supabase
      .from('questions')
      .select('*, users(full_name)')
      .eq('session_id', sessionId)
      .order('upvote_count', { ascending: false })
    
    setQuestions(data || [])
    setLoading(false)
  }

  async function askQuestion() {
    if (!newQuestion.trim()) return
    const token = localStorage.getItem('dico_token')
    
    const { error } = await supabase.from('questions').insert({
      session_id: sessionId,
      user_id: user.id,
      question_text: newQuestion,
      upvote_count: 0
    })

    if (error) {
      toast.error('Failed to ask question.')
    } else {
      toast.success('Question asked!')
      setNewQuestion('')
    }
  }

  async function upvote(questionId: string) {
    // Optimistic UI update
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, upvote_count: q.upvote_count + 1 } : q))
    
    const { data } = await supabase.from('questions').select('upvote_count').eq('id', questionId).single()
    if (data) {
      await supabase.from('questions').update({ upvote_count: data.upvote_count + 1 }).eq('id', questionId)
    }
  }

  async function submitAnswer(questionId: string) {
    if (!answerText.trim()) return
    const token = localStorage.getItem('dico_token')
    
    const { error } = await supabase.from('questions').update({ 
      answer_text: answerText,
      answered_at: new Date().toISOString()
    }).eq('id', questionId)

    if (error) {
      toast.error('Failed to submit answer.')
    } else {
      toast.success('Answer submitted!')
      setAnsweringId(null)
      setAnswerText('')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Video / Stream Area */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-forest rounded-xl p-8 h-64 flex flex-col items-center justify-center text-white">
          <Radio className="h-12 w-12 text-red-500 animate-pulse mb-3" />
          <h3 className="font-serif text-xl font-black">Live Session in Progress</h3>
          <p className="text-white/60 text-sm">Real-time Q&A is active</p>
        </div>

        {/* Ask Question Box (Voters only) */}
        {!isCandidate && (
          <div className="bg-white border border-border rounded-xl p-4 flex gap-2">
            <Input 
              value={newQuestion} 
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="Type your question for the candidate..."
              onKeyDown={e => e.key === 'Enter' && askQuestion()}
            />
            <Button onClick={askQuestion} className="bg-forest hover:bg-forest-mid">
              <Send className="h-4 w-4 mr-2" /> Ask
            </Button>
          </div>
        )}

        {/* Questions Feed */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
          ) : questions.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center text-muted">
              No questions yet. Be the first to ask!
            </div>
          ) : (
            questions.map(q => (
              <div key={q.id} className="bg-white border border-border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-ink text-sm">{q.question_text}</p>
                    <p className="text-xs text-muted mt-1">Asked by {q.users?.full_name || 'Anonymous'}</p>
                  </div>
                  <button 
                    onClick={() => upvote(q.id)}
                    className="flex items-center gap-1 text-xs font-bold text-forest bg-forest-light px-2 py-1 rounded hover:bg-forest hover:text-white transition-all"
                  >
                    <ThumbsUp className="h-3 w-3" /> {q.upvote_count}
                  </button>
                </div>

                {/* Answer Section */}
                {q.answer_text ? (
                  <div className="mt-3 p-3 bg-mint rounded-lg border-l-4 border-forest">
                    <p className="text-xs font-bold text-forest mb-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Answered
                    </p>
                    <p className="text-sm text-ink">{q.answer_text}</p>
                  </div>
                ) : isCandidate && answeringId === q.id ? (
                  <div className="mt-3 flex gap-2">
                    <Input 
                      value={answerText} 
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder="Type your answer..."
                      autoFocus
                    />
                    <Button size="sm" onClick={() => submitAnswer(q.id)} className="bg-forest hover:bg-forest-mid">Send</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAnsweringId(null)}>Cancel</Button>
                  </div>
                ) : isCandidate ? (
                  <button 
                    onClick={() => { setAnsweringId(q.id); setAnswerText('') }}
                    className="mt-2 text-xs font-semibold text-gold hover:underline"
                  >
                    Answer this question
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar: Live Stats / Info */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-border rounded-xl p-4">
          <h3 className="font-bold text-ink mb-3">Session Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Questions Asked</span>
              <span className="font-bold text-ink">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Questions Answered</span>
              <span className="font-bold text-ink">{questions.filter(q => q.answer_text).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Total Upvotes</span>
              <span className="font-bold text-ink">{questions.reduce((sum, q) => sum + q.upvote_count, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}