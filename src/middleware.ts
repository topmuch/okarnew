/**
 * OKAR - Middleware d'Authentification Sécurisé v2
 * 
 * ARCHITECTURE CORRIGÉE:
 * 1. Vérification SYNCHRONE du cookie (pas de DB)
 * 2. Validation du rôle via headers injectés
 * 3. Protection contre les boucles de redirection
 * 4. Callback URL preservation
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes publiques accessibles sans authentification
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/search',
  '/report',
])

// Préfixes de routes publiques
const PUBLIC_PREFIXES = [
  '/garage/',      // Profil public des garages
  '/api/auth/',    // Routes d'authentification
  '/api/public/',  // API publique
]

// Routes protégées par rôle
const ROLE_ROUTES: Record<string, string[]> = {
  superadmin: ['/dashboard/superadmin'],
  garage_certified: ['/dashboard/garage'],
  garage_pending: ['/dashboard/garage'],
  driver: ['/dashboard/driver'],
}

// Mapping inverse pour redirection automatique
const DEFAULT_DASHBOARD: Record<string, string> = {
  superadmin: '/dashboard/superadmin',
  garage_certified: '/dashboard/garage',
  garage_pending: '/dashboard/garage',
  driver: '/dashboard/driver',
}

// Préfixes à ignorer (assets, api interne)
const IGNORED_PREFIXES = [
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/logo.svg',
  '/images/',
]

/**
 * Vérifie si une route est publique
 */
function isPublicRoute(pathname: string): boolean {
  // Route exactement publique
  if (PUBLIC_ROUTES.has(pathname)) return true
  
  // Préfixe public
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }
  
  return false
}

/**
 * Vérifie si une route doit être ignorée
 */
function shouldIgnoreRoute(pathname: string): boolean {
  for (const prefix of IGNORED_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }
  return false
}

/**
 * Détermine le rôle requis pour une route
 */
function getRequiredRole(pathname: string): string | null {
  for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
    for (const route of routes) {
      if (pathname.startsWith(route)) {
        return role
      }
    }
  }
  return null
}

/**
 * Vérifie si un rôle peut accéder à une route
 */
function canAccessRoute(role: string, requiredRole: string): boolean {
  // Rôles équivalents pour garage
  if (requiredRole === 'garage_certified' || requiredRole === 'garage_pending') {
    return role === 'garage_certified' || role === 'garage_pending'
  }
  return role === requiredRole
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Ignorer les assets statiques
  if (shouldIgnoreRoute(pathname)) {
    return NextResponse.next()
  }

  // 2. Permettre les routes publiques
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // 3. Vérifier la présence du cookie de session
  const sessionToken = request.cookies.get('okar_session')?.value

  // Pas de session → Rediriger vers login
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl, 307)
  }

  // 4. Récupérer le rôle depuis le cookie ou header
  // Note: Le rôle est injecté par l'API de login dans un cookie séparé
  const userRole = request.cookies.get('okar_user_role')?.value

  // 5. Vérifier les droits d'accès pour les routes protégées
  const requiredRole = getRequiredRole(pathname)
  
  if (requiredRole && userRole) {
    if (!canAccessRoute(userRole, requiredRole)) {
      // Rediriger vers le bon dashboard
      const correctRoute = DEFAULT_DASHBOARD[userRole] || '/login'
      return NextResponse.redirect(new URL(correctRoute, request.url), 307)
    }
  }

  // 6. Laisser passer - la validation complète se fait côté serveur dans les API
  // et côté client dans AuthProvider
  const response = NextResponse.next()
  
  // Injecter le token dans les headers pour les API routes
  response.headers.set('x-session-token', sessionToken)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
