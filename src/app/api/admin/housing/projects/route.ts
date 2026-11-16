import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, rpcError } from '@/lib/voucher-auth'

async function admin(req: Request) { const s = await getSession(req); return s && s.role === 'admin' ? s : null }

export async function GET(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await supabaseAdmin.from('housing_projects').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
  return NextResponse.json({ projects: data ?? [] })
}

const schema = z.object({
  name: z.string().trim().min(3).max(150),
  state: z.string().min(2).max(40),
  lga: z.string().max(80).optional(),
  description: z.string().max(4000).optional(),
  status: z.enum(['planned', 'active', 'completed']).optional(),
  landSize: z.string().max(100).optional(),
  designSummary: z.string().max(2000).optional(),
  buildingsCount: z.number().int().min(1).max(100000).optional(),
  constructionSize: z.string().max(200).optional(),
  purpose: z.string().max(500).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  drawingsUrl: z.string().max(500).optional(),
  isPublished: z.boolean().optional(),
})

export async function POST(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the project details: ' + parsed.error.issues[0].path.join('.') + ' ' + parsed.error.issues[0].message }, { status: 400 })
  const d = parsed.data
  if (d.drawingsUrl && !/^https?:\/\//i.test(d.drawingsUrl)) return NextResponse.json({ error: 'The drawings link must start with http:// or https://' }, { status: 400 })
  const { data, error } = await supabaseAdmin.rpc('save_housing_project', {
    p: { name: d.name, state: d.state, lga: d.lga ?? '', description: d.description ?? '', status: d.status ?? 'planned', land_size: d.landSize ?? '',
         design_summary: d.designSummary ?? '', buildings_count: d.buildingsCount ?? '', construction_size: d.constructionSize ?? '', purpose: d.purpose ?? '',
         start_date: d.startDate ?? '', completion_date: d.completionDate ?? '', drawings_url: d.drawingsUrl ?? '', is_published: d.isPublished },
  })
  if (error) return NextResponse.json({ error: rpcError(error.message) === 'Request failed' ? error.message : rpcError(error.message) }, { status: 400 })
  return NextResponse.json({ success: true, id: data })
}
