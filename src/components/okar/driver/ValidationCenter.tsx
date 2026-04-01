/**
 * OKAR - Validation Center Component
 * Centre de validation des interventions en attente
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle, 
  XCircle, 
  Wrench, 
  Calendar, 
  MapPin,
  Loader2,
  Sparkles
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
  createdAt: Date | string
  garage: {
    id: string
    businessName: string
    address: string
    city: string
  }
}

interface ValidationCenterProps {
  pendingInterventions: Intervention[]
  onValidate: (id: string, approve: boolean, notes?: string) => Promise<void>
}

export function ValidationCenter({ pendingInterventions, onValidate }: ValidationCenterProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({})

  const handleValidate = async (id: string, approve: boolean) => {
    setProcessingId(id)
    try {
      await onValidate(id, approve, approve ? undefined : rejectionNotes[id])
      if (!approve) {
        setRejectionNotes(prev => {
          const updated = { ...prev }
          delete updated[id]
          return updated
        })
      }
    } finally {
      setProcessingId(null)
      setRejectingId(null)
    }
  }

  const typeLabels: Record<string, string> = {
    oil_change: 'Vidange',
    major_repair: 'Réparation',
    accident: 'Accident',
    tire_change: 'Pneus',
    battery: 'Batterie',
    inspection: 'Contrôle'
  }

  if (pendingInterventions.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardContent className="py-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Tout est à jour!</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Aucune intervention en attente de validation. Votre carnet est parfaitement à jour.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header avec badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          Centre de Validation
        </h2>
        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          {pendingInterventions.length} en attente
        </Badge>
      </div>

      {/* Liste des interventions */}
      {pendingInterventions.map((intervention) => (
        <Card key={intervention.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-pink-500" />
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Icône */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>

              {/* Contenu */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {typeLabels[intervention.type] || intervention.type}
                    </Badge>
                    <h3 className="font-bold text-gray-900 text-lg">{intervention.garage.businessName}</h3>
                    <p className="text-gray-600 font-medium">{intervention.title}</p>
                    {intervention.description && (
                      <p className="text-gray-500 text-sm mt-1">{intervention.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(intervention.createdAt), 'd MMM yyyy', { locale: fr })}
                      </span>
                      <span>{intervention.mileage.toLocaleString()} km</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {intervention.garage.city}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                    {intervention.cost ? `${intervention.cost.toLocaleString()} FCFA` : 'Montant non spécifié'}
                  </span>
                </div>

                {/* Zone de rejet */}
                {rejectingId === intervention.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm font-medium text-red-700 mb-2">
                      Raison du rejet (optionnel):
                    </p>
                    <Textarea
                      placeholder="Expliquez pourquoi vous rejetez cette intervention..."
                      value={rejectionNotes[intervention.id] || ''}
                      onChange={(e) => setRejectionNotes(prev => ({
                        ...prev,
                        [intervention.id]: e.target.value
                      }))}
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                <Separator className="my-4" />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleValidate(intervention.id, true)}
                    disabled={processingId === intervention.id}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl h-12 text-lg shadow-lg shadow-green-500/25"
                  >
                    {processingId === intervention.id ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    )}
                    Valider
                  </Button>
                  {rejectingId === intervention.id ? (
                    <div className="flex gap-2 flex-1">
                      <Button 
                        variant="outline"
                        onClick={() => setRejectingId(null)}
                        className="flex-1 rounded-xl h-12"
                      >
                        Annuler
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleValidate(intervention.id, false)}
                        disabled={processingId === intervention.id}
                        className="flex-1 rounded-xl h-12"
                      >
                        {processingId === intervention.id ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-5 w-5 mr-2" />
                        )}
                        Confirmer le rejet
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="destructive" 
                      className="flex-1 rounded-xl h-12"
                      onClick={() => setRejectingId(intervention.id)}
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Rejeter
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
