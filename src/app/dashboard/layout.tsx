/**
 * OKAR - Layout Partagé pour les Dashboards v3
 * 
 * ARCHITECTURE CORRIGÉE:
 * 1. Affiche un loader PENDANT le chargement (isLoading = true)
 * 2. Une fois chargé, si NON authentifié → REDIRIGE vers login
 * 3. Si authentifié → affiche le contenu
 * 
 * IMPORTANT: Ne JAMAIS afficher "Redirection..." sans rediriger!
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Marquer comme monté après le premier render (hydration)
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // Redirection vers login si non authentifié
  useEffect(() => {
    // Attendre que le montage soit fait et le chargement terminé
    if (!mounted || isLoading) return
    
    // Si pas authentifié, rediriger vers login
    if (!isAuthenticated || !user) {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname || '/dashboard')}`
      router.replace(loginUrl)
    }
  }, [mounted, isLoading, isAuthenticated, user, router, pathname])

  // Écran de chargement initial (pendant vérification session)
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-pink-500/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-400 mt-4">Chargement...</p>
        </div>
      </div>
    )
  }

  // Pas connecté - afficher loader pendant la redirection
  // IMPORTANT: Le useEffect ci-dessus déclenche la redirection
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-pink-500/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-400 mt-4">Redirection vers connexion...</p>
        </div>
      </div>
    )
  }

  // Utilisateur connecté - afficher le contenu
  return <>{children}</>
}
