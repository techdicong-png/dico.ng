import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function sendNotification(userId: string, title: string, body?: string, link?: string, type: string = 'system') {
  try {
    await supabaseServer.from('notifications').insert({
      user_id: userId,
      title,
      body,
      link,
      type,
      is_read: false
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}