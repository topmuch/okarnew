/**
 * CleanCheck - Authentication Middleware
 *
 * Only protects API routes (except auth routes).
 * Dashboard auth is handled client-side in DashboardLayout.
 * This avoids redirect loops through preview proxies that strip cookies.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /api/cleancheck/* routes (except auth)
  const isProtectedApi = pathname.startsWith('/api/cleancheck/') &&
    !pathname.startsWith('/api/cleancheck/auth/')

  // Public report and scan API routes
  const isPublicApi = pathname.startsWith('/api/cleancheck/reports/') ||
    pathname.startsWith('/api/cleancheck/ratings/')

  if (isProtectedApi && !isPublicApi) {
    // For API routes, try to extract token from cookie or Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  // For all other routes (dashboard, pages, etc.), pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
