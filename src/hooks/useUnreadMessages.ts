/**
 * OKAR - useUnreadMessages Hook
 * 
 * Hook pour le polling des messages non lus
 * - Rafraîchissement automatique toutes les 30 secondes
 * - Badge compteur sur l'icône Messages
 * - Toast notification pour nouveaux messages
 * - Son discret optionnel
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface UnreadMessage {
  id: string
  from: string
  subject: string
  preview: string
  timestamp: Date
  type: 'support' | 'inquiry' | 'complaint'
}

export interface UnreadMessagesState {
  count: number
  messages: UnreadMessage[]
  lastChecked: Date | null
  isLoading: boolean
  error: string | null
}

interface UseUnreadMessagesOptions {
  /** Intervalle de polling en millisecondes (défaut: 30000 = 30 secondes) */
  pollingInterval?: number
  /** Activer le son de notification */
  enableSound?: boolean
  /** Activer les notifications toast */
  enableToast?: boolean
  /** URL de l'API pour récupérer les messages */
  apiEndpoint?: string
}

interface UseUnreadMessagesReturn extends UnreadMessagesState {
  /** Rafraîchir manuellement les messages */
  refresh: () => Promise<void>
  /** Marquer un message comme lu */
  markAsRead: (messageId: string) => Promise<void>
  /** Marquer tous les messages comme lus */
  markAllAsRead: () => Promise<void>
  /** Réinitialiser le compteur */
  reset: () => void
}

// Son de notification (data URI pour éviter les fichiers externes)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVo2ZnOTk4ttb2hslZePjHyBcmh0oY1xX2Rwd4aHhYBnYF9YVFJOTUtHREA7NzQyLCsdHhsYFg8NCgkGBCQeIysvOD9CTVFWW2RpbXZ/g4mKi42KiIJ7dW1oYV5bVVFNSUA5ODUzMDEyMzU2ODo8PT5BQ0VGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj4CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl') 

export function useUnreadMessages(options: UseUnreadMessagesOptions = {}): UseUnreadMessagesReturn {
  const {
    pollingInterval = 30000,
    enableSound = true,
    enableToast = true,
    apiEndpoint = '/api/superadmin/messages/unread'
  } = options

  const { toast } = useToast()
  const [state, setState] = useState<UnreadMessagesState>({
    count: 0,
    messages: [],
    lastChecked: null,
    isLoading: false,
    error: null
  })
  
  const previousCountRef = useRef<number>(0)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Fonction pour jouer un son
  const playNotificationSound = useCallback(() => {
    if (!enableSound) return
    
    try {
      const audio = new Audio(NOTIFICATION_SOUND)
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignorer les erreurs de lecture audio
      })
    } catch {
      // Ignorer les erreurs
    }
  }, [enableSound])

  // Fonction pour afficher un toast
  const showToast = useCallback((message: UnreadMessage) => {
    if (!enableToast) return
    
    toast({
      title: `📩 Nouveau message de ${message.from}`,
      description: message.preview,
      duration: 5000,
    })
  }, [enableToast, toast])

  // Fonction pour récupérer les messages
  const fetchUnreadMessages = useCallback(async () => {
    if (!isMountedRef.current) return
    
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages')
      }
      
      const data = await response.json()
      
      if (!isMountedRef.current) return
      
      const newMessages = data.messages || []
      const newCount = data.count || newMessages.length
      
      // Détecter les nouveaux messages
      if (newCount > previousCountRef.current && previousCountRef.current > 0) {
        // Trouver les nouveaux messages
        const previousIds = state.messages.map(m => m.id)
        const freshMessages = newMessages.filter((m: UnreadMessage) => !previousIds.includes(m.id))
        
        // Jouer le son et afficher les toasts pour chaque nouveau message
        if (freshMessages.length > 0) {
          playNotificationSound()
          freshMessages.forEach((msg: UnreadMessage) => showToast(msg))
        }
      }
      
      previousCountRef.current = newCount
      
      setState({
        count: newCount,
        messages: newMessages,
        lastChecked: new Date(),
        isLoading: false,
        error: null
      })
    } catch (error) {
      if (!isMountedRef.current) return
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }, [apiEndpoint, playNotificationSound, showToast, state.messages])

  // Fonction pour rafraîchir manuellement
  const refresh = useCallback(async () => {
    await fetchUnreadMessages()
  }, [fetchUnreadMessages])

  // Fonction pour marquer un message comme lu
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/superadmin/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (response.ok) {
        setState(prev => ({
          ...prev,
          count: Math.max(0, prev.count - 1),
          messages: prev.messages.filter(m => m.id !== messageId)
        }))
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }, [])

  // Fonction pour marquer tous les messages comme lus
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/superadmin/messages/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (response.ok) {
        setState(prev => ({
          ...prev,
          count: 0,
          messages: []
        }))
        previousCountRef.current = 0
      }
    } catch (error) {
      console.error('Erreur lors du marquage de tous les messages:', error)
    }
  }, [])

  // Fonction pour réinitialiser
  const reset = useCallback(() => {
    setState({
      count: 0,
      messages: [],
      lastChecked: null,
      isLoading: false,
      error: null
    })
    previousCountRef.current = 0
  }, [])

  // Effet pour le polling
  useEffect(() => {
    isMountedRef.current = true
    
    // Premier fetch immédiat
    fetchUnreadMessages()
    
    // Configurer le polling
    pollingRef.current = setInterval(fetchUnreadMessages, pollingInterval)
    
    // Cleanup
    return () => {
      isMountedRef.current = false
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [fetchUnreadMessages, pollingInterval])

  // Écouter les événements de visibilité pour rafraîchir quand l'utilisateur revient
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        fetchUnreadMessages()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUnreadMessages])

  return {
    ...state,
    refresh,
    markAsRead,
    markAllAsRead,
    reset,
  }
}

export default useUnreadMessages
