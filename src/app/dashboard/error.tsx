/**
 * OKAR - Error UI pour les pages dashboard
 */

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur pour monitoring
    console.error('Erreur dashboard:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[#1E293B]/80 backdrop-blur-md border-white/5 rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Oups! Une erreur s'est produite
          </h2>
          
          <p className="text-gray-400 mb-6">
            {error.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
