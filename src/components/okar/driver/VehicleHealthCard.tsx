/**
 * OKAR - Vehicle Health Card Component
 * Carte de santé du véhicule avec indicateur feu tricolore
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { HealthIndicator } from './HealthIndicator'

interface VehicleHealthCardProps {
  vehicle: {
    plateNumber: string
    brand: string
    model: string
    year?: number | null
    color?: string | null
    mileage: number
    healthScore: number
  }
  healthStatus: 'good' | 'warning' | 'critical'
  alerts: Array<{
    id: string
    type: string
    message: string
    severity: string
  }>
}

export function VehicleHealthCard({ vehicle, healthStatus, alerts }: VehicleHealthCardProps) {
  const statusColors = {
    good: 'from-green-500 to-emerald-500',
    warning: 'from-orange-500 to-amber-500',
    critical: 'from-red-500 to-rose-500'
  }

  const statusLabels = {
    good: { text: 'Bon état', icon: CheckCircle, color: 'text-green-600' },
    warning: { text: 'À surveiller', icon: AlertTriangle, color: 'text-orange-600' },
    critical: { text: 'Critique', icon: XCircle, color: 'text-red-600' }
  }

  const StatusIcon = statusLabels[healthStatus].icon

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
      {/* Barre de statut colorée */}
      <div className={`h-2 bg-gradient-to-r ${statusColors[healthStatus]}`} />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Infos véhicule */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
              <Car className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-mono">
                {vehicle.plateNumber}
              </h2>
              <p className="text-gray-600">
                {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
              </p>
              <p className="text-gray-500 text-sm">
                {vehicle.color || 'Couleur non spécifiée'} • {vehicle.mileage.toLocaleString()} km
              </p>
            </div>
          </div>

          {/* Feu Tricolore */}
          <HealthIndicator status={healthStatus} />
        </div>

        {/* Score de santé */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 font-medium">Score de Santé OKAR</span>
            <span className={`text-2xl font-bold ${statusLabels[healthStatus].color}`}>
              {vehicle.healthScore}/100
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${statusColors[healthStatus]}`}
              style={{ width: `${vehicle.healthScore}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <StatusIcon className={`h-4 w-4 ${statusLabels[healthStatus].color}`} />
            <span className={`text-sm font-medium ${statusLabels[healthStatus].color}`}>
              {statusLabels[healthStatus].text}
            </span>
          </div>
        </div>

        {/* Alertes actives */}
        {alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  alert.severity === 'critical' 
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200' 
                    : alert.severity === 'warning'
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'text-red-500' : 
                  alert.severity === 'warning' ? 'text-orange-500' : 'text-blue-500'
                }`} />
                <p className={`text-sm ${
                  alert.severity === 'critical' ? 'text-red-700' : 
                  alert.severity === 'warning' ? 'text-orange-700' : 'text-blue-700'
                }`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
