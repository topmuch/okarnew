/**
 * CleanCheck - Error UI pour les pages dashboard
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
    console.error('Erreur dashboard:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oups ! Une erreur s&apos;est produite
          </h2>

          <p className="text-gray-500 mb-6">
            {error.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>

            <Button
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l&apos;accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
