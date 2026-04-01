/**
 * OKAR - Maintenance Timeline Component
 * Timeline chronologique unifiée des interventions
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Droplets, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar, 
  MapPin, 
  ChevronDown,
  ChevronUp,
  Wrench,
  Battery,
  CircleDot,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Intervention {
  id: string
  type: string
  title: string
  description?: string | null
  mileage: number
  cost?: number | null
  status: string
  isOwnerValidated: boolean
  createdAt: Date | string
  garage: {
    businessName: string
    address: string
    city: string
    rating?: number
  }
  oilType?: string | null
  oilQuantity?: string | null
  parts: Array<{ name: string; brand?: string; price?: number }>
  photos: string[]
  invoiceUrl?: string | null
}

interface MaintenanceTimelineProps {
  interventions: Intervention[]
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; colors: string; bgColors: string }> = {
  oil_change: { 
    label: 'Vidange', 
    icon: Droplets, 
    colors: 'from-green-500 to-emerald-500',
    bgColors: 'from-green-50 to-emerald-50 border-green-200'
  },
  major_repair: { 
    label: 'Réparation', 
    icon: Settings, 
    colors: 'from-orange-500 to-amber-500',
    bgColors: 'from-orange-50 to-amber-50 border-orange-200'
  },
  accident: { 
    label: 'Accident', 
    icon: AlertTriangle, 
    colors: 'from-red-500 to-rose-500',
    bgColors: 'from-red-50 to-rose-50 border-red-200'
  },
  tire_change: { 
    label: 'Pneus', 
    icon: CircleDot, 
    colors: 'from-purple-500 to-violet-500',
    bgColors: 'from-purple-50 to-violet-50 border-purple-200'
  },
  battery: { 
    label: 'Batterie', 
    icon: Battery, 
    colors: 'from-yellow-500 to-amber-500',
    bgColors: 'from-yellow-50 to-amber-50 border-yellow-200'
  },
  inspection: { 
    label: 'Contrôle', 
    icon: CheckCircle, 
    colors: 'from-blue-500 to-indigo-500',
    bgColors: 'from-blue-50 to-indigo-50 border-blue-200'
  },
  default: { 
    label: 'Intervention', 
    icon: Wrench, 
    colors: 'from-gray-500 to-gray-600',
    bgColors: 'from-gray-50 to-gray-100 border-gray-200'
  }
}

export function MaintenanceTimeline({ interventions }: MaintenanceTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  if (interventions.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune intervention</h3>
          <p className="text-gray-500">
            L'historique des interventions apparaîtra ici après la première visite au garage.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-500" />
          Carnet d'Entretien
        </CardTitle>
        <CardDescription>
          Historique complet et chronologique de votre véhicule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Ligne verticale de la timeline */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 via-pink-300 to-blue-300" />

          <div className="space-y-4">
            {interventions.map((intervention, index) => {
              const config = typeConfig[intervention.type] || typeConfig.default
              const Icon = config.icon
              const isExpanded = expandedId === intervention.id
              const isLast = index === interventions.length - 1

              return (
                <div key={intervention.id} className={`relative pl-12 ${isLast ? '' : 'pb-4'}`}>
                  {/* Point sur la timeline */}
                  <div className={`absolute left-0 w-10 h-10 rounded-xl bg-gradient-to-br ${config.colors} flex items-center justify-center shadow-lg z-10`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  {/* Carte d'intervention */}
                  <div className={`bg-gradient-to-br ${config.bgColors} border rounded-2xl overflow-hidden transition-all duration-300`}>
                    {/* En-tête */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpand(intervention.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs border-current">
                              {config.label}
                            </Badge>
                            {intervention.isOwnerValidated ? (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validé
                              </Badge>
                            ) : intervention.status === 'pending' ? (
                              <Badge className="bg-orange-500 text-white text-xs">
                                En attente
                              </Badge>
                            ) : null}
                          </div>
                          <h4 className="font-semibold text-gray-900">{intervention.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(intervention.createdAt), 'd MMM yyyy', { locale: fr })}
                            </span>
                            <span>{intervention.mileage.toLocaleString()} km</span>
                            {intervention.cost && (
                              <span className="font-medium text-gray-900">
                                {intervention.cost.toLocaleString()} FCFA
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Détails expandables */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-200/50">
                        {/* Garage */}
                        <div className="mt-4 flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">{intervention.garage.businessName}</p>
                            <p className="text-sm text-gray-500">
                              {intervention.garage.address}, {intervention.garage.city}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        {intervention.description && (
                          <p className="mt-3 text-sm text-gray-600">
                            {intervention.description}
                          </p>
                        )}

                        {/* Détails huile (pour vidange) */}
                        {intervention.type === 'oil_change' && intervention.oilType && (
                          <div className="mt-3 p-3 bg-white/50 rounded-xl">
                            <p className="text-sm font-medium text-gray-700">Huile utilisée:</p>
                            <p className="text-sm text-gray-600">
                              {intervention.oilType} {intervention.oilQuantity ? `(${intervention.oilQuantity}L)` : ''}
                            </p>
                          </div>
                        )}

                        {/* Pièces changées */}
                        {intervention.parts && intervention.parts.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Pièces changées:</p>
                            <div className="flex flex-wrap gap-2">
                              {intervention.parts.map((part, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-white/80">
                                  {part.name} {part.brand && `(${part.brand})`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Facture */}
                        {intervention.invoiceUrl && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm" className="gap-2">
                              <FileText className="h-4 w-4" />
                              Voir la facture
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
