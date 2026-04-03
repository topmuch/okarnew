/**
 * CleanCheck - AuthProvider
 *
 * Gère l'état d'authentification pour les 3 rôles :
 * - manager : Dashboard complet, création interventions, gestion agents/clients
 * - agent : Scan QR, checklists, interventions assignées
 * - client : Rapport, notation (accès public sans compte)
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Types
export type UserRole = 'manager' | 'agent'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  role: UserRole
  companyId?: string | null
  avatarUrl?: string | null
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/cleancheck/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setUser(data.data)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/cleancheck/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.data.user)
        return { success: true, user: data.data.user }
      }

      return { success: false, error: data.error || 'Identifiants incorrects' }
    } catch {
      return { success: false, error: 'Erreur de connexion au serveur' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/cleancheck/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Silent fail
    } finally {
      setUser(null)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
