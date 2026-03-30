/**
 * OKAR - Due Dates Card Component
 * Affiche les échéances importantes avec compte à rebours
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Droplets, Calendar, Clock } from 'lucide-react'

interface DueDatesCardProps {
  insurance: {
    expiryDate: Date | string | null
    daysRemaining: number | null
    status: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
  }
  technicalControl: {
    date: Date | string | null
    daysRemaining: number | null
    status: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
  }
  oilChange: {
    nextDate: Date | string | null
    nextMileage: number | null
    daysRemaining: number | null
    status: 'ok' | 'due_soon' | 'overdue' | 'unknown'
  }
}

export function DueDatesCard({ insurance, technicalControl, oilChange }: DueDatesCardProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Non définie'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
      case 'overdue':
        return 'from-red-50 to-rose-50 border-red-200'
      case 'expiring_soon':
      case 'due_soon':
        return 'from-orange-50 to-amber-50 border-orange-200'
      default:
        return 'from-green-50 to-emerald-50 border-green-200'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'expired':
      case 'overdue':
        return 'text-red-600'
      case 'expiring_soon':
      case 'due_soon':
        return 'text-orange-600'
      default:
        return 'text-green-600'
    }
  }

  const getDaysLabel = (days: number | null) => {
    if (days === null) return 'Date non définie'
    if (days < 0) return `Expiré depuis ${Math.abs(days)} jours`
    if (days === 0) return 'Expire aujourd\'hui!'
    if (days === 1) return 'Expire demain'
    return `Dans ${days} jours`
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-500" />
          Échéances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Assurance */}
          <div className={`p-4 rounded-2xl border bg-gradient-to-br ${getStatusColor(insurance.status)}`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`h-5 w-5 ${getStatusTextColor(insurance.status)}`} />
              <span className={`font-medium ${getStatusTextColor(insurance.status)}`}>
                Assurance
              </span>
            </div>
            <p className="text-gray-600 text-sm">Expire le</p>
            <p className="text-gray-800 font-semibold">{formatDate(insurance.expiryDate)}</p>
            {insurance.daysRemaining !== null && (
              <div className="flex items-center gap-1 mt-2">
                <Clock className={`h-3.5 w-3.5 ${getStatusTextColor(insurance.status)}`} />
                <span className={`text-sm font-medium ${getStatusTextColor(insurance.status)}`}>
                  {getDaysLabel(insurance.daysRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Contrôle Technique */}
          <div className={`p-4 rounded-2xl border bg-gradient-to-br ${getStatusColor(technicalControl.status)}`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`h-5 w-5 ${getStatusTextColor(technicalControl.status)}`} />
              <span className={`font-medium ${getStatusTextColor(technicalControl.status)}`}>
                Contrôle Technique
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {technicalControl.status === 'expired' ? 'Expiré le' : 'Valide jusqu\'au'}
            </p>
            <p className="text-gray-800 font-semibold">{formatDate(technicalControl.date)}</p>
            {technicalControl.daysRemaining !== null && (
              <div className="flex items-center gap-1 mt-2">
                <Clock className={`h-3.5 w-3.5 ${getStatusTextColor(technicalControl.status)}`} />
                <span className={`text-sm font-medium ${getStatusTextColor(technicalControl.status)}`}>
                  {getDaysLabel(technicalControl.daysRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Prochaine Vidange */}
          <div className={`p-4 rounded-2xl border bg-gradient-to-br ${getStatusColor(oilChange.status)}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className={`h-5 w-5 ${getStatusTextColor(oilChange.status)}`} />
              <span className={`font-medium ${getStatusTextColor(oilChange.status)}`}>
                Prochaine Vidange
              </span>
            </div>
            <p className="text-gray-600 text-sm">Prévue le</p>
            <p className="text-gray-800 font-semibold">{formatDate(oilChange.nextDate)}</p>
            {oilChange.nextMileage && (
              <p className="text-gray-500 text-sm mt-1">
                À {oilChange.nextMileage.toLocaleString()} km
              </p>
            )}
            {oilChange.daysRemaining !== null && (
              <div className="flex items-center gap-1 mt-2">
                <Clock className={`h-3.5 w-3.5 ${getStatusTextColor(oilChange.status)}`} />
                <span className={`text-sm font-medium ${getStatusTextColor(oilChange.status)}`}>
                  {getDaysLabel(oilChange.daysRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
