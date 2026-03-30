/**
 * OKAR - Emergency Button Component
 * Bouton d'urgence avec géolocalisation
 */

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, MapPin, Loader2, Navigation } from 'lucide-react'

interface NearbyGarage {
  id: string
  name: string
  address: string
  city: string
  phone: string
  rating: number
  distance: number | null
  callUrl: string | null
  googleMapsUrl: string | null
  isTopRated: boolean
}

interface EmergencyButtonProps {
  onFindGarages: (lat: number, lng: number) => Promise<NearbyGarage[]>
  onGaragesFound: (garages: NearbyGarage[]) => void
}

export function EmergencyButton({ onFindGarages, onGaragesFound }: EmergencyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmergency = async () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const garages = await onFindGarages(latitude, longitude)
          onGaragesFound(garages)
        } catch {
          setError('Erreur lors de la recherche des garages')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error('Erreur géolocalisation:', err)
        setError('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <Card className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6 text-white text-center">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          {loading ? (
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          ) : (
            <Zap className="h-10 w-10 text-white" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">Mode Urgence</h2>
        <p className="opacity-90 mb-6">
          Vous êtes en panne? Trouvez les garages OKAR les plus proches et contactez-les instantanément.
        </p>

        {error && (
          <p className="text-white/80 text-sm mb-4 bg-white/10 rounded-xl p-3">
            {error}
          </p>
        )}

        <Button 
          size="lg" 
          onClick={handleEmergency}
          disabled={loading}
          className="bg-white text-red-600 hover:bg-gray-100 rounded-xl px-8 h-14 shadow-xl text-lg font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Localisation en cours...
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5 mr-2" />
              Trouver un garage proche
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
