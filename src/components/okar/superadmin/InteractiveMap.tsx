/**
 * OKAR - InteractiveMap Component
 * 
 * Carte interactive avec Leaflet et fond CartoDB
 * Affichage des garages et véhicules avec marqueurs
 * 
 * FIXES:
 * - Les marqueurs s'affichent correctement
 * - Support pour les garages et véhicules
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MapPin,
  Car,
  Wrench,
  ExternalLink,
  Navigation,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface MapMarker {
  id: string
  type: 'garage' | 'vehicle'
  name: string
  latitude: number
  longitude: number
  details: {
    address?: string
    phone?: string
    status?: string
    healthScore?: number
    plateNumber?: string
    rating?: number
  }
}

interface InteractiveMapProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (marker: MapMarker) => void
  showFilters?: boolean
}

export function InteractiveMap({
  markers,
  center = [14.6928, -17.4467], // Dakar par défaut
  zoom = 12,
  onMarkerClick,
  showFilters = true,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [leafletLib, setLeafletLib] = useState<any>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [filter, setFilter] = useState<'all' | 'garage' | 'vehicle'>('all')
  const [isLoaded, setIsLoaded] = useState(false)
  const [markersLayer, setMarkersLayer] = useState<any>(null)

  // Filtrer les marqueurs
  const filteredMarkers = filter === 'all' 
    ? markers 
    : markers.filter(m => m.type === filter)

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || mapInstance) return

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        
        // Importer le CSS de Leaflet
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        // Créer la carte
        const map = L.map(mapRef.current!).setView(center, zoom)

        // Fond CartoDB Light
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map)

        // Créer un groupe de marqueurs
        const layerGroup = L.layerGroup().addTo(map)

        setMapInstance(map)
        setLeafletLib(L)
        setMarkersLayer(layerGroup)
        setIsLoaded(true)
      } catch (error) {
        console.error('Erreur lors du chargement de Leaflet:', error)
      }
    }

    initMap()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [])

  // Mettre à jour les marqueurs quand les données changent
  useEffect(() => {
    if (!mapInstance || !leafletLib || !markersLayer || !isLoaded) return

    // Vider les anciens marqueurs
    markersLayer.clearLayers()

    // Icône garage (bleu)
    const garageIcon = leafletLib.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          cursor: pointer;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    // Icône véhicule (orange)
    const vehicleIcon = leafletLib.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
          cursor: pointer;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-5.4a2 2 0 0 0-1.8-1.1H5.5A2 2 0 0 0 3.7 4.6L1 10l-2.5 1.1C-2.3 11.3-3 12.1-3 13v3c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    // Ajouter les marqueurs filtrés
    filteredMarkers.forEach((marker) => {
      const icon = marker.type === 'garage' ? garageIcon : vehicleIcon
      
      const leafletMarker = leafletLib.marker([marker.latitude, marker.longitude], { icon })
        .addTo(markersLayer)

      // Popup
      leafletMarker.bindPopup(`
        <div style="min-width: 150px; color: #1F2937;">
          <strong style="font-size: 14px;">${marker.name}</strong>
          ${marker.details.address ? `<br/><span style="font-size: 12px; color: #6B7280;">${marker.details.address}</span>` : ''}
          ${marker.type === 'garage' && marker.details.rating ? `<br/><span style="color: #F59E0B;">★ ${marker.details.rating}/5</span>` : ''}
          ${marker.type === 'vehicle' && marker.details.healthScore ? `<br/><span style="color: ${marker.details.healthScore >= 70 ? '#10B981' : '#F59E0B'};">Score: ${marker.details.healthScore}%</span>` : ''}
        </div>
      `)

      // Click handler
      leafletMarker.on('click', () => {
        setSelectedMarker(marker)
        if (onMarkerClick) onMarkerClick(marker)
      })
    })

    // Ajuster la vue si plusieurs marqueurs
    if (filteredMarkers.length > 0) {
      const bounds = leafletLib.latLngBounds(filteredMarkers.map(m => [m.latitude, m.longitude]))
      mapInstance.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [mapInstance, leafletLib, markersLayer, isLoaded, filteredMarkers])

  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border-white/10 overflow-hidden rounded-2xl shadow-xl">
      <CardHeader className="pb-2 bg-slate-900/50 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-400" />
            Carte Interactive
          </CardTitle>
          {showFilters && (
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-[#8B5CF6] text-white' : 'border-white/10 text-[#94A3B8] hover:text-white'}
              >
                Tous
              </Button>
              <Button
                variant={filter === 'garage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('garage')}
                className={filter === 'garage' ? 'bg-blue-600 text-white' : 'border-white/10 text-[#94A3B8] hover:text-white'}
              >
                <Wrench className="h-3 w-3 mr-1" />
                Garages
              </Button>
              <Button
                variant={filter === 'vehicle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('vehicle')}
                className={filter === 'vehicle' ? 'bg-orange-500 text-white' : 'border-white/10 text-[#94A3B8] hover:text-white'}
              >
                <Car className="h-3 w-3 mr-1" />
                Véhicules
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="w-full h-[500px] bg-slate-700"
        />
        
        {/* Légende */}
        <div className="p-4 bg-slate-900/50 border-t border-white/5 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            <span className="text-[#94A3B8] text-sm">Garages ({markers.filter(m => m.type === 'garage').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
            <span className="text-[#94A3B8] text-sm">Véhicules ({markers.filter(m => m.type === 'vehicle').length})</span>
          </div>
        </div>
      </CardContent>

      {/* Dialog détails marqueur */}
      <Dialog open={!!selectedMarker} onOpenChange={() => setSelectedMarker(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedMarker?.type === 'garage' ? (
                <Wrench className="h-5 w-5 text-blue-400" />
              ) : (
                <Car className="h-5 w-5 text-orange-400" />
              )}
              {selectedMarker?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedMarker && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedMarker.type === 'garage' ? (
                  <>
                    <div>
                      <p className="text-slate-400 text-sm">Adresse</p>
                      <p className="text-white">{selectedMarker.details.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Téléphone</p>
                      <p className="text-white">{selectedMarker.details.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Note</p>
                      <p className="text-white">{selectedMarker.details.rating || 'N/A'} / 5</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Statut</p>
                      <Badge className={selectedMarker.details.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {selectedMarker.details.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-slate-400 text-sm">Plaque</p>
                      <p className="text-white font-mono">{selectedMarker.details.plateNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Score Santé</p>
                      <Badge className={selectedMarker.details.healthScore! >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}>
                        {selectedMarker.details.healthScore}%
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    window.open(`https://www.google.com/maps?q=${selectedMarker.latitude},${selectedMarker.longitude}`, '_blank')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir sur Google Maps
                </Button>
                {selectedMarker.type === 'garage' && selectedMarker.details.phone && (
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default InteractiveMap
