/**
 * OKAR - Composant de Route Protégée
 * 
 * ARCHITECTURE ANTI-BOUCLE:
 * 
 * Ce composant suit la règle d'or:
 * 1. Si loading → Afficher Spinner
 * 2. Si !loading && !user → Rediriger vers login
 * 3. Si !loading && user → Vérifier les rôles
 * 4. Si rôle incorrect → Rediriger vers le bon dashboard
 * 
 * JAMAIS de redirect pendant le loading!
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, User } from '@/context/AuthProvider'
import { Loader2 } from 'lucide-react'

// Configuration des routes par rôle
const DASHBOARD_ROUTES: Record<string, string> = {
  superadmin: '/dashboard/superadmin',
  garage_certified: '/dashboard/garage',
  garage_pending: '/dashboard/garage',
  driver: '/dashboard/driver',
}

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: User['role'][]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // RÈGLE D'OR: Ne rien faire pendant le loading
    if (isLoading) return

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      router.push('/login')
      return
    }

    // Si des rôles sont spécifiés, vérifier l'autorisation
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Rediriger vers le dashboard approprié
      const correctRoute = DASHBOARD_ROUTES[user.role] || '/login'
      router.push(correctRoute)
      return
    }
  }, [isLoading, user, allowedRoles, router])

  // RÈGLE D'OR: Afficher le spinner pendant le loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur, afficher le spinner (le redirect est en cours)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Si les rôles sont spécifiés et que l'utilisateur n'a pas le bon rôle
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Tout est bon, afficher le contenu
  return <>{children}</>
}

export default ProtectedRoute
