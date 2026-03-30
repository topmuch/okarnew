/**
 * OKAR - TimelineEntry Component
 * 
 * Composant de timeline pour le carnet d'entretien
 * Rendu conditionnel selon le type d'intervention:
 * - oil_change: Vert (Vidange)
 * - major_repair: Orange (Grosse Méca)
 * - accident: Rouge (Accident)
 * - ct_check: Bleu (Contrôle Technique)
 * - tire_change: Violet (Pneus)
 * - battery: Jaune (Batterie)
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Droplets,
  Settings,
  AlertTriangle,
  Shield,
  CircleDot,
  Battery,
  Wrench,
  CheckCircle,
  FileText,
  Camera,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'

// Types
type InterventionType = 'oil_change' | 'major_repair' | 'accident' | 'ct_check' | 'tire_change' | 'battery' | 'other'

interface TimelineEntryProps {
  id: string
  type: InterventionType
  title: string
  description?: string
  date: string
  mileage: number
  garage: {
    name: string
    address?: string
    phone?: string
  }
  cost?: number
  validated: boolean
  photos?: string[]
  parts?: Array<{
    name: string
    brand?: string
    price?: number
  }>
  oil?: {
    brand: string
    viscosity: string
    quantity: number
  }
  invoiceUrl?: string
  isLast?: boolean
}

// Configuration des types d'intervention
const interventionConfig: Record<InterventionType, {
  icon: React.ElementType
  label: string
  bgGradient: string
  iconBg: string
  borderColor: string
  dotColor: string
}> = {
  oil_change: {
    icon: Droplets,
    label: 'Vidange',
    bgGradient: 'from-green-50 to-emerald-50',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500 border-green-200',
  },
  major_repair: {
    icon: Settings,
    label: 'Réparation',
    bgGradient: 'from-orange-50 to-amber-50',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500 border-orange-200',
  },
  accident: {
    icon: AlertTriangle,
    label: 'Accident',
    bgGradient: 'from-red-50 to-rose-50',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-500',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500 border-red-200',
  },
  ct_check: {
    icon: Shield,
    label: 'Contrôle Technique',
    bgGradient: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500 border-blue-200',
  },
  tire_change: {
    icon: CircleDot,
    label: 'Pneus',
    bgGradient: 'from-purple-50 to-violet-50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-500 border-purple-200',
  },
  battery: {
    icon: Battery,
    label: 'Batterie',
    bgGradient: 'from-yellow-50 to-amber-50',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-500 border-yellow-200',
  },
  other: {
    icon: Wrench,
    label: 'Autre',
    bgGradient: 'from-gray-50 to-slate-50',
    iconBg: 'bg-gradient-to-br from-gray-500 to-slate-500',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-500 border-gray-200',
  },
}

export function TimelineEntry({
  id,
  type,
  title,
  description,
  date,
  mileage,
  garage,
  cost,
  validated,
  photos = [],
  parts = [],
  oil,
  invoiceUrl,
  isLast = false,
}: TimelineEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = interventionConfig[type] || interventionConfig.other
  const Icon = config.icon

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200" />
      )}
      
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${config.dotColor} z-10 shadow-sm`} />

      {/* Card */}
      <Card className={`border-0 shadow-lg bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} rounded-2xl overflow-hidden ml-2`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <Badge className={`${config.iconBg} text-white border-0 mb-1`}>
                  {config.label}
                </Badge>
                <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm font-medium">{date}</p>
              <p className="text-gray-500 text-sm">{mileage.toLocaleString()} km</p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-gray-600 mb-3">{description}</p>
          )}

          {/* Garage info */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Wrench className="h-4 w-4" />
            <span>{garage.name}</span>
            {garage.address && <span className="text-gray-400">• {garage.address}</span>}
          </div>

          {/* Oil details (for oil changes) */}
          {type === 'oil_change' && oil && (
            <div className="bg-white/60 rounded-xl p-3 mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Huile utilisée</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-green-300 text-green-700">
                  {oil.brand}
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  {oil.viscosity}
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  {oil.quantity}L
                </Badge>
              </div>
            </div>
          )}

          {/* Expandable details */}
          {(parts.length > 0 || photos.length > 0) && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span>Voir les détails</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {isExpanded && (
                <div className="mt-3 space-y-3 animate-slide-down">
                  {/* Parts list */}
                  {parts.length > 0 && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pièces changées</p>
                      <ul className="space-y-1">
                        {parts.map((part, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {part.name}
                              {part.brand && <span className="text-gray-400 ml-1">({part.brand})</span>}
                            </span>
                            {part.price && (
                              <span className="text-gray-900 font-medium">
                                {part.price.toLocaleString()} FCFA
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Photos */}
                  {photos.length > 0 && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Photos
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-lg bg-gray-200 bg-cover bg-center"
                            style={{ backgroundImage: `url(${photo})` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50">
            <div className="flex items-center gap-2">
              {validated ? (
                <Badge className="bg-green-500 text-white border-0 shadow-lg shadow-green-500/25">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Validé par le propriétaire
                </Badge>
              ) : (
                <Badge variant="outline" className="border-orange-300 text-orange-600">
                  En attente de validation
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {cost && (
                <span className="font-bold text-gray-900 text-lg">
                  {cost.toLocaleString()} FCFA
                </span>
              )}
              {invoiceUrl && (
                <Button variant="ghost" size="sm" className="rounded-lg">
                  <FileText className="h-4 w-4 mr-1" />
                  Facture
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Export des types
export type { InterventionType, TimelineEntryProps }
