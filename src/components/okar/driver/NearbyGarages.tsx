/**
 * OKAR - Nearby Garages Component
 * Liste des garages OKAR certifiés à proximité
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Star, ExternalLink, Navigation, Award } from 'lucide-react'

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

interface NearbyGaragesProps {
  garages: NearbyGarage[]
}

export function NearbyGarages({ garages }: NearbyGaragesProps) {
  if (garages.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-orange-500" />
        Garages OKAR à proximité
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {garages.map((garage, index) => (
          <Card 
            key={garage.id} 
            className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`h-1 ${
              index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              index === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
              'bg-gradient-to-r from-orange-500 to-pink-500'
            }`} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {garage.name}
                    {garage.isTopRated && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                  </h4>
                  <p className="text-gray-500 text-sm">{garage.address}, {garage.city}</p>
                </div>
                {garage.distance !== null && (
                  <Badge className={`${
                    garage.distance < 1 ? 'bg-green-100 text-green-700' :
                    garage.distance < 3 ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  } border-0 flex-shrink-0`}>
                    {garage.distance < 1 
                      ? `${Math.round(garage.distance * 1000)} m` 
                      : `${garage.distance} km`}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-600 text-sm font-medium">{garage.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {garage.callUrl && (
                  <Button 
                    asChild
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-md"
                  >
                    <a href={garage.callUrl}>
                      <Phone className="h-4 w-4 mr-1" />
                      Appeler
                    </a>
                  </Button>
                )}
                {garage.googleMapsUrl && (
                  <Button 
                    variant="outline"
                    asChild
                    className="flex-1 rounded-xl"
                  >
                    <a href={garage.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-4 w-4 mr-1" />
                      Itinéraire
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
