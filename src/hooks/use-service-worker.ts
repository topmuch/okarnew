/**
 * OKAR - Service Worker Registration Hook
 * 
 * Enregistre le Service Worker pour la PWA
 */

'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerRegistrationResult {
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  error: Error | null
}

export function useServiceWorker(): ServiceWorkerRegistrationResult {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Vérifier si les Service Workers sont supportés
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW] Service Workers non supportés')
      return
    }

    const registerServiceWorker = async () => {
      try {
        console.log('[SW] Enregistrement du Service Worker...')
        
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        
        setRegistration(reg)
        setIsRegistered(true)
        console.log('[SW] Service Worker enregistré:', reg.scope)
        
        // Vérifier les mises à jour
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true)
              console.log('[SW] Mise à jour disponible')
            }
          })
        })
        
        // Vérifier les mises à jour périodiquement
        setInterval(() => {
          reg.update()
        }, 60 * 60 * 1000) // Toutes les heures
        
      } catch (err) {
        console.error('[SW] Erreur d\'enregistrement:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }
    
    // Enregistrer après le chargement
    if (document.readyState === 'complete') {
      registerServiceWorker()
    } else {
      window.addEventListener('load', registerServiceWorker)
    }
    
    return () => {
      window.removeEventListener('load', registerServiceWorker)
    }
  }, [])
  
  return { isRegistered, isUpdateAvailable, registration, error }
}

export default useServiceWorker
