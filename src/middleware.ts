import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// src/middleware.ts
const publicPaths = ['/', '/login', '/register', '/forgot-password', '/api/auth/login', '/api/auth/register', '/api/otp/forgot-password', '/api/otp/reset-password', '/api/health']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next()
  // Allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/icons')) return NextResponse.next()

  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add user info to request headers for API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
