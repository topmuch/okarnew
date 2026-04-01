/**
 * OKAR - Install Prompt Component
 * 
 * Bannière d'invitation à installer l'application PWA
 * Design: Mobile First, non-intrusif, avec animation
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Share, Plus, Smartphone, ChevronRight, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServiceWorker } from '@/hooks/use-service-worker'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface InstallPromptProps {
  className?: string
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  
  // Service Worker hook
  const { isUpdateAvailable } = useServiceWorker()

  useEffect(() => {
    // Vérifier si déjà installé (standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    requestAnimationFrame(() => setIsStandalone(standalone))

    // Vérifier si déjà rejeté
    const dismissedBefore = localStorage.getItem('pwa-install-dismissed')
    if (dismissedBefore) {
      const dismissedDate = new Date(dismissedBefore)
      const now = new Date()
      const daysSinceDismissed = Math.floor((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceDismissed < 7) {
        requestAnimationFrame(() => setDismissed(true))
      }
    }

    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    requestAnimationFrame(() => setIsIOS(isIOSDevice))

    // Écouter l'événement beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Afficher après un délai pour ne pas être intrusif
      setTimeout(() => {
        if (!standalone && !dismissed) {
          setShowPrompt(true)
        }
      }, 5000) // 5 secondes
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Pour iOS, afficher la bannière après un délai si pas en standalone
    if (isIOSDevice && !standalone && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [dismissed])

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error)
    }
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }, [])
  
  // Mettre à jour l'application
  const handleUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    }
    window.location.reload()
  }, [])

  // Ne pas afficher si déjà installé ou déjà rejeté
  if (isStandalone || dismissed || !showPrompt) {
    // Mais afficher la bannière de mise à jour si disponible
    if (isUpdateAvailable) {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-emerald-900 via-emerald-900/98 to-emerald-900/95 backdrop-blur-lg border-t border-emerald-500/20">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">Mise à jour disponible</p>
                <p className="text-xs text-emerald-300/80">Une nouvelle version est prête</p>
              </div>
            </div>
            <Button
              onClick={handleUpdate}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Mettre à jour
            </Button>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <>
      {/* Bannière fixe en bas sur mobile */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-900 via-slate-900/98 to-slate-900/95 backdrop-blur-lg border-t border-white/10 transform transition-all duration-500',
          showPrompt ? 'translate-y-0' : 'translate-y-full',
          'md:hidden', // Mobile only
          className
        )}
      >
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-[#ff6201] to-[#ff8533] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#ff6201]/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white text-sm">
                Installez OKAR
              </h3>
              <button
                onClick={handleDismiss}
                className="text-[#64748B] hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#94A3B8] mb-3">
              {isIOS 
                ? 'Accédez rapidement à votre passeport automobile depuis votre écran d\'accueil.'
                : 'Installez l\'application pour un accès rapide et des notifications.'}
            </p>

            {/* Install Button */}
            {isIOS ? (
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span>Touchez</span>
                <Share className="w-4 h-4 text-[#ff6201]" />
                <span>puis</span>
                <span className="flex items-center gap-1 text-white font-medium">
                  <Plus className="w-4 h-4" />
                  Sur l'écran d'accueil
                </span>
              </div>
            ) : (
              <Button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-[#ff6201] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6201] text-white text-sm py-2 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Installer l'application
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour desktop */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
          'hidden md:flex', // Desktop only
          showPrompt ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          className
        )}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        />
        
        {/* Modal */}
        <div className="relative bg-slate-900 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6 transform transition-transform duration-300">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-[#64748B] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            {/* Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#ff6201] to-[#ff8533] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#ff6201]/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="currentColor"/>
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Installez OKAR
            </h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Accédez à votre passeport automobile en un clic, même hors ligne.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-[#ff6201]/20 rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-[#ff8533]" />
                </div>
                <span className="text-[#94A3B8]">Accès rapide depuis votre bureau</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-[#ff6201]/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-[#ff8533]" />
                </div>
                <span className="text-[#94A3B8]">Fonctionne hors ligne</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-[#ff6201]/20 rounded-lg flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-[#ff8533]" />
                </div>
                <span className="text-[#94A3B8]">Notifications en temps réel</span>
              </div>
            </div>

            {/* Install Button */}
            <Button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-[#ff6201] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6201] text-white py-3 rounded-xl font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Installer maintenant
            </Button>

            <button
              onClick={handleDismiss}
              className="mt-3 text-xs text-[#64748B] hover:text-white transition-colors"
            >
              Pas maintenant
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default InstallPrompt
