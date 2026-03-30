/**
 * OKAR - AuthProvider Simplifié v3
 * 
 * ARCHITECTURE SIMPLIFIÉE:
 * 1. Gère l'état d'authentification (user, isLoading, error)
 * 2. FOURNIT les fonctions login/logout/refreshSession
 * 3. NE FAIT AUCUNE REDIRECTION AUTOMATIQUE
 * 
 * Les redirections sont gérées par:
 * - Le middleware (côté serveur)
 * - Le DashboardLayout (côté client)
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Types
export type UserRole = 'superadmin' | 'garage_certified' | 'garage_pending' | 'driver'

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: UserRole
  isApproved: boolean
  subscriptionStatus: 'free' | 'premium' | 'suspended'
}

export type AuthErrorType = 'network' | 'timeout' | 'unauthorized' | 'forbidden' | 'pending' | 'unknown'

export interface AuthError {
  type: AuthErrorType
  message: string
  originalError?: unknown
  code?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError; user?: User }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

// Contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personnalisé
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

// Mapping des erreurs
function mapError(error: unknown, response?: Response, data?: any): AuthError {
  // Timeout
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      type: 'timeout',
      message: 'La requête a pris trop de temps. Veuillez réessayer.',
      originalError: error,
    }
  }
  
  // Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      originalError: error,
    }
  }
  
  // HTTP errors
  if (response) {
    // Pending account - needs approval
    if (response.status === 403 && data?.code === 'ACCOUNT_PENDING') {
      return {
        type: 'pending',
        message: data.error || 'Votre compte est en cours de validation.',
        code: 'ACCOUNT_PENDING',
      }
    }
    if (response.status === 401) {
      return {
        type: 'unauthorized',
        message: 'Session expirée. Veuillez vous reconnecter.',
      }
    }
    if (response.status === 403) {
      return {
        type: 'forbidden',
        message: data?.error || 'Accès non autorisé.',
      }
    }
  }
  
  return {
    type: 'unknown',
    message: data?.error || 'Une erreur inattendue s\'est produite.',
    originalError: error,
  }
}

// Provider
interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  /**
   * Vérifie la session actuelle via l'API
   */
  const refreshSession = useCallback(async () => {
    try {
      setError(null)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // Mettre à jour le cookie de rôle pour le middleware
        if (data.user?.role) {
          document.cookie = `okar_user_role=${data.user.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        }
      } else {
        setUser(null)
        // Nettoyer le cookie de rôle
        document.cookie = 'okar_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } catch (err) {
      const authError = mapError(err)
      console.error('Erreur lors de la vérification de session:', authError)
      setError(authError)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Vérification initiale de la session au montage
   */
  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  /**
   * Fonction de connexion
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        
        // Mettre à jour le cookie de rôle pour le middleware
        if (data.user?.role) {
          document.cookie = `okar_user_role=${data.user.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        }
        
        return { success: true, user: data.user }
      }

      // Utiliser mapError avec les données pour gérer le cas pending
      const authError = mapError(null, response, data)
      setError(authError)
      
      return { success: false, error: authError }
    } catch (err) {
      const authError = mapError(err)
      console.error('Erreur de login:', authError)
      return { success: false, error: authError }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fonction de déconnexion
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Erreur de logout:', err)
    } finally {
      setUser(null)
      // Nettoyer les cookies
      document.cookie = 'okar_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }, [])

  /**
   * Effacer l'erreur
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refreshSession,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
