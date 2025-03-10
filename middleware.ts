import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { SESSION_COOKIE_NAME } from '@/lib/session'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Get session using the request object
  const session = await getServerSession(req)

  // Forward to dashboard if logged in and trying to access auth pages
  if (session && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Forward to login if not logged in and trying to access protected pages
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Add user info to request headers if session exists
  const response = NextResponse.next()
  if (session) {
    response.headers.set('x-user-id', session.user.id)
    response.headers.set('x-user-role', session.user.role)
    response.headers.set('x-company-id', session.company_id)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 