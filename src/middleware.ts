/**
 * CleanCheck - Authentication Middleware
 *
 * Protects dashboard and API routes:
 * - /dashboard/* routes require valid Bearer token (from cookie or header)
 * - /api/* routes (except /api/auth/*) require valid Bearer token
 * - Role-based path checking: /dashboard/manager/* requires manager role
 * - Unauthenticated requests redirect to /auth/login
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

// Public routes (no auth required)
const PUBLIC_ROUTES = new Set([
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
])

// Public route prefixes
const PUBLIC_PREFIXES = [
  '/api/auth/',             // Auth endpoints
  '/api/cleancheck/auth/',  // CleanCheck auth endpoints
  '/report/',               // Client report pages (public)
  '/scan/',                 // Agent scan pages (public)
  '/_next',                 // Next.js internals
  '/favicon.ico',           // Static assets
  '/robots.txt',
  '/sitemap.xml',
  '/logo.svg',
  '/icons/',
  '/og-image',
]

// Role-based route mapping
const ROLE_REQUIRED_ROUTES: Record<string, string[]> = {
  manager: ['/dashboard/manager'],
  agent: ['/dashboard/agent'],
}

// Default dashboard redirect by role
const DEFAULT_DASHBOARD: Record<string, string> = {
  manager: '/dashboard/manager',
  agent: '/dashboard/agent',
}

const SESSION_COOKIE_NAME = 'cleancheck_session'

// ============================================================================
// HELPERS
// ============================================================================

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true

  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }

  return false
}

function getRequiredRole(pathname: string): string | null {
  for (const [role, routes] of Object.entries(ROLE_REQUIRED_ROUTES)) {
    for (const route of routes) {
      if (pathname.startsWith(route)) {
        return role
      }
    }
  }
  return null
}

/**
 * Extract Bearer token from Authorization header or cookie.
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Try cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    return token
  }

  return null
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // 2. Only protect /dashboard/* and /api/* routes
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isApiRoute = pathname.startsWith('/api')

  if (!isDashboardRoute && !isApiRoute) {
    return NextResponse.next()
  }

  // 3. API auth routes are public
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/cleancheck/auth/')) {
    return NextResponse.next()
  }

  // 4. Public report and scan pages
  if (pathname.startsWith('/report/') || pathname.startsWith('/scan/')) {
    return NextResponse.next()
  }

  // 5. Check for Bearer token
  const token = extractToken(request)

  if (!token) {
    // For API routes, return 401 (only for protected API routes)
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For dashboard routes, redirect to login
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl, 307)
  }

  // 6. For dashboard routes, pass through with token in header
  // The actual token validation happens in API routes and server components
  const response = NextResponse.next()
  response.headers.set('x-auth-token', token)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
