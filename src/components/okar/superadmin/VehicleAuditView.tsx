/**
 * OKAR - VehicleAuditView Component
 * 
 * Vue détaillée d'un véhicule pour l'audit admin
 * Affiche l'historique complet même si on n'est pas le propriétaire
 * 
 * FIXES:
 * - Affiche correctement l'historique et l'audit
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  FileText,
  ExternalLink,
  QrCode,
  Shield,
  TrendingUp,
  Wrench,
  Oil,
  Flame,
  Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface VehicleAuditData {
  id: string
  plateNumber: string
  brand: string
  model: string
  year: number
  color: string
  vin?: string
  mileage: number
  healthScore: number
  qrCode: string
  owner: {
    id: string
    name: string
    email: string
    phone: string
    registeredAt: string
  }
  garage?: {
    id: string
    name: string
    city: string
  }
  technicalControl: {
    lastDate: string
    nextDate: string
    status: 'valid' | 'expiring' | 'expired'
  }
  insurance: {
    company: string
    expiryDate: string
    status: 'valid' | 'expiring' | 'expired'
  }
  history: Array<{
    id: string
    type: 'oil_change' | 'major_repair' | 'accident' | 'inspection'
    title: string
    description?: string
    date: string
    mileage: number
    cost: number
    garage: string
    validated: boolean
    parts?: string[]
    oilType?: string
    photos?: string[]
  }>
  transferHistory: Array<{
    from: string
    to: string
    date: string
  }>
}

interface VehicleAuditViewProps {
  vehicle: VehicleAuditData | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const typeConfig = {
  oil_change: { label: 'Vidange', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  major_repair: { label: 'Réparation', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  accident: { label: 'Accident', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  inspection: { label: 'Contrôle', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
}

export function VehicleAuditView({ vehicle, open, onOpenChange }: VehicleAuditViewProps) {
  const [selectedIntervention, setSelectedIntervention] = useState<VehicleAuditData['history'][0] | null>(null)

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800/95 backdrop-blur-xl border-slate-700 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-xl">
            <Car className="h-5 w-5 text-blue-400" />
            Audit Véhicule - <span className="font-mono">{vehicle.plateNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations générales */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Informations Véhicule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Car className="h-4 w-4" />
                    <span>Véhicule</span>
                  </div>
                  <span className="text-white font-medium">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="h-4 w-4">🎨</span>
                    <span>Couleur</span>
                  </div>
                  <span className="text-white">{vehicle.color}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Kilométrage</span>
                  </div>
                  <span className="text-white">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <QrCode className="h-4 w-4" />
                    <span>QR Code</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{vehicle.qrCode}</Badge>
                </div>
                {vehicle.vin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileText className="h-4 w-4" />
                      <span>VIN</span>
                    </div>
                    <span className="text-white font-mono text-sm">{vehicle.vin}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Score de Santé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${
                    vehicle.healthScore >= 70 ? 'text-green-400' :
                    vehicle.healthScore >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {vehicle.healthScore}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">/ 100</p>
                </div>
                <Progress 
                  value={vehicle.healthScore}
                  className={`h-3 ${
                    vehicle.healthScore >= 70 ? '[&>div]:bg-green-500' :
                    vehicle.healthScore >= 40 ? '[&>div]:bg-orange-500' : '[&>div]:bg-red-500'
                  }`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs">CT</p>
                    <Badge className={
                      vehicle.technicalControl.status === 'valid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      vehicle.technicalControl.status === 'expiring' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }>
                      <Shield className="h-3 w-3 mr-1" />
                      {vehicle.technicalControl.status === 'valid' ? 'Valide' :
                       vehicle.technicalControl.status === 'expiring' ? 'Expire bientôt' : 'Expiré'}
                    </Badge>
                  </div>
                  <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400 text-xs">Assurance</p>
                    <Badge className={
                      vehicle.insurance.status === 'valid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      vehicle.insurance.status === 'expiring' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }>
                      <Shield className="h-3 w-3 mr-1" />
                      {vehicle.insurance.status === 'valid' ? 'Valide' :
                       vehicle.insurance.status === 'expiring' ? 'Expire bientôt' : 'Expirée'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Propriétaire */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                Propriétaire Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-white font-medium">{vehicle.owner.name}</p>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Mail className="h-3 w-3" />
                    {vehicle.owner.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Phone className="h-3 w-3" />
                    {vehicle.owner.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="h-3 w-3" />
                    Inscrit le {new Date(vehicle.owner.registeredAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                {vehicle.garage && (
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Garage associé</p>
                    <p className="text-white">{vehicle.garage.name}</p>
                    <p className="text-slate-500 text-sm">{vehicle.garage.city}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historique des interventions */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                Historique des Interventions ({vehicle.history.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.history.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
                  
                  <div className="space-y-4">
                    {vehicle.history.map((item, index) => {
                      const config = typeConfig[item.type]
                      const Icon = config.icon
                      
                      return (
                        <div 
                          key={item.id}
                          className="relative pl-10 cursor-pointer hover:bg-slate-800/50 rounded-lg p-3 -ml-3 transition-colors"
                          onClick={() => setSelectedIntervention(item)}
                        >
                          {/* Dot */}
                          <div className={`absolute left-2 top-4 w-5 h-5 rounded-full ${config.bg} border-2 border-current flex items-center justify-center`}>
                            <Icon className={`h-2.5 w-2.5 ${config.color}`} />
                          </div>
                          
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${config.bg} ${config.color} border-0`}>
                                  {config.label}
                                </Badge>
                                {item.validated && (
                                  <CheckCircle className="h-3 w-3 text-green-400" />
                                )}
                              </div>
                              <p className="text-white font-medium mt-1">{item.title}</p>
                              {item.description && (
                                <p className="text-slate-400 text-sm">{item.description}</p>
                              )}
                              <p className="text-slate-500 text-xs mt-1">{item.garage}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">{item.cost.toLocaleString()} FCFA</p>
                              <p className="text-slate-500 text-sm">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                              <p className="text-slate-600 text-xs">{item.mileage.toLocaleString()} km</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune intervention enregistrée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des transferts */}
          {vehicle.transferHistory.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Historique des Transferts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vehicle.transferHistory.map((transfer, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">{transfer.from}</span>
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                      <span className="text-white">{transfer.to}</span>
                      <span className="text-slate-500 text-sm ml-auto">
                        {new Date(transfer.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleAuditView
