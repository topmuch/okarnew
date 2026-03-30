/**
 * OKAR - Chantiers Module
 * Module de gestion des interventions
 * - Onglets En cours / Historique
 * - Liste des véhicules
 * - Détails interventions
 * - Validation
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Wrench,
  Car,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  MessageCircle,
  Calendar,
  Droplets,
  Settings,
  Shield,
  Circle,
  BatteryMedium,
  Loader2,
  Send,
  Filter,
} from 'lucide-react'
import { InterventionFormModal } from './InterventionFormModal'

interface ChantiersModuleProps {
  garageId?: string
  onOpenIntervention?: () => void
}

interface Intervention {
  id: string
  vehicle: {
    plateNumber: string
    brand: string
    model: string
    owner: string
    ownerPhone: string
  }
  type: string
  title: string
  description?: string
  mileage: number
  cost: number
  status: string
  isOwnerValidated: boolean
  createdAt: Date
  validationDate?: Date
}

const INTERVENTION_TYPES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  oil_change: { label: 'Vidange', icon: Droplets, color: 'text-blue-400' },
  maintenance: { label: 'Entretien', icon: Wrench, color: 'text-emerald-400' },
  major_repair: { label: 'Grosse méca', icon: Settings, color: 'text-orange-400' },
  accident: { label: 'Carrosserie', icon: AlertTriangle, color: 'text-rose-400' },
  inspection: { label: 'Contrôle', icon: Shield, color: 'text-violet-400' },
  tire_change: { label: 'Pneus', icon: Circle, color: 'text-purple-400' },
  battery: { label: 'Batterie', icon: BatteryMedium, color: 'text-yellow-400' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: 'text-amber-300', bg: 'bg-amber-500/20' },
  in_progress: { label: 'En cours', color: 'text-blue-300', bg: 'bg-blue-500/20' },
  validated: { label: 'Validé', color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
  rejected: { label: 'Rejeté', color: 'text-rose-300', bg: 'bg-rose-500/20' },
}

export function ChantiersModule({ garageId, onOpenIntervention }: ChantiersModuleProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'en_cours' | 'historique'>('en_cours')
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [interventionModalOpen, setInterventionModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchInterventions()
  }, [garageId, activeTab])

  const fetchInterventions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/garage/interventions?status=${activeTab}`)
      const data = await res.json()
      if (data.success) {
        setInterventions(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement interventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (interventionId: string, status: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/garage/interventions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interventionId, status })
      })
      const data = await res.json()
      if (data.success) {
        fetchInterventions()
        setDetailsOpen(false)
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleOpenIntervention = () => {
    if (onOpenIntervention) {
      onOpenIntervention()
    } else {
      setInterventionModalOpen(true)
    }
  }

  const filteredInterventions = interventions.filter(
    i => filterType === 'all' || i.type === filterType
  )

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const sendWhatsAppReminder = (phone: string, message: string) => {
    const text = encodeURIComponent(message)
    window.open(`https://wa.me/${phone.replace(/\s/g, '')}?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-okar-text-primary">Chantiers & Interventions</h2>
          <p className="text-okar-text-muted text-sm">Gérez vos interventions en cours et historique</p>
        </div>
        <Button
          onClick={handleOpenIntervention}
          className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
        >
          <Wrench className="h-4 w-4 mr-2" />
          Nouvelle Intervention
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'en_cours' | 'historique')}>
        <TabsList className="bg-okar-dark-800/50 border border-white/5">
          <TabsTrigger 
            value="en_cours"
            className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300"
          >
            <Clock className="h-4 w-4 mr-2" />
            En cours ({interventions.filter(i => ['pending', 'in_progress'].includes(i.status)).length})
          </TabsTrigger>
          <TabsTrigger 
            value="historique"
            className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Filtres */}
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-4 w-4 text-okar-text-muted" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48 bg-okar-dark-800/50 border-white/10 text-okar-text-primary">
                <SelectValue placeholder="Type d'intervention" />
              </SelectTrigger>
              <SelectContent className="bg-okar-dark-card border-white/10">
                <SelectItem value="all" className="text-okar-text-primary">Tous les types</SelectItem>
                {Object.entries(INTERVENTION_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key} className="text-okar-text-primary">
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Liste */}
          <Card className="bg-okar-dark-card border-white/10">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                </div>
              ) : filteredInterventions.length === 0 ? (
                <div className="text-center py-12 text-okar-text-muted">
                  <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune intervention {activeTab === 'en_cours' ? 'en cours' : 'dans l\'historique'}</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredInterventions.map((intervention) => {
                    const typeConfig = INTERVENTION_TYPES[intervention.type] || { label: intervention.type, icon: Wrench, color: 'text-gray-400' }
                    const statusConfig = STATUS_CONFIG[intervention.status] || { label: intervention.status, color: 'text-gray-400', bg: 'bg-gray-500/20' }
                    const Icon = typeConfig.icon

                    return (
                      <div
                        key={intervention.id}
                        className="flex items-center gap-4 p-4 hover:bg-okar-dark-800/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedIntervention(intervention)
                          setDetailsOpen(true)
                        }}
                      >
                        {/* Icône type */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bg}`}>
                          <Icon className={`h-6 w-6 ${typeConfig.color}`} />
                        </div>

                        {/* Infos véhicule */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-okar-text-primary">{intervention.vehicle.plateNumber}</span>
                            <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0 text-xs`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-okar-text-secondary">
                            {intervention.vehicle.brand} {intervention.vehicle.model} • {typeConfig.label}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-okar-text-muted">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {intervention.vehicle.owner}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(intervention.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Prix & Actions */}
                        <div className="text-right">
                          <p className="font-bold text-amber-300">{formatCurrency(intervention.cost)}</p>
                          <p className="text-xs text-okar-text-muted">{intervention.mileage.toLocaleString()} km</p>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-okar-text-muted hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIntervention(intervention)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog détails intervention */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg bg-okar-dark-card border-white/10 text-okar-text-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-pink-400" />
              Détails Intervention
            </DialogTitle>
          </DialogHeader>

          {selectedIntervention && (
            <div className="space-y-6">
              {/* Véhicule */}
              <div className="bg-okar-dark-800/30 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <Car className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-okar-text-primary">{selectedIntervention.vehicle.plateNumber}</p>
                    <p className="text-okar-text-secondary">{selectedIntervention.vehicle.brand} {selectedIntervention.vehicle.model}</p>
                    <p className="text-sm text-okar-text-muted">{selectedIntervention.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              {/* Type & Coût */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-okar-text-muted mb-1">Type</p>
                  <p className="text-okar-text-primary font-medium">{INTERVENTION_TYPES[selectedIntervention.type]?.label || selectedIntervention.type}</p>
                </div>
                <div>
                  <p className="text-xs text-okar-text-muted mb-1">Coût</p>
                  <p className="text-amber-300 font-bold">{formatCurrency(selectedIntervention.cost)}</p>
                </div>
              </div>

              {/* Description */}
              {selectedIntervention.description && (
                <div>
                  <p className="text-xs text-okar-text-muted mb-1">Description</p>
                  <p className="text-okar-text-secondary text-sm">{selectedIntervention.description}</p>
                </div>
              )}

              {/* Propriétaire */}
              <div className="flex items-center justify-between p-3 bg-okar-dark-800/30 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-okar-text-muted" />
                  <span className="text-okar-text-secondary">{selectedIntervention.vehicle.owner}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-okar-text-secondary"
                  onClick={() => sendWhatsAppReminder(
                    selectedIntervention.vehicle.ownerPhone,
                    `Bonjour, concernant votre véhicule ${selectedIntervention.vehicle.plateNumber}...`
                  )}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>

              {/* Statut */}
              <div>
                <p className="text-xs text-okar-text-muted mb-2">Statut</p>
                <Badge className={`${STATUS_CONFIG[selectedIntervention.status].bg} ${STATUS_CONFIG[selectedIntervention.status].color} border-0`}>
                  {STATUS_CONFIG[selectedIntervention.status].label}
                </Badge>
              </div>

              {/* Actions */}
              {selectedIntervention.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 text-okar-text-secondary"
                    onClick={() => handleUpdateStatus(selectedIntervention.id, 'rejected')}
                    disabled={updating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700"
                    onClick={() => handleUpdateStatus(selectedIntervention.id, 'validated')}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Valider
                  </Button>
                </div>
              )}

              {selectedIntervention.status === 'in_progress' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700"
                    onClick={() => handleUpdateStatus(selectedIntervention.id, 'validated')}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Terminer & Valider
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal nouvelle intervention */}
      <InterventionFormModal
        open={interventionModalOpen}
        onOpenChange={setInterventionModalOpen}
      />
    </div>
  )
}

export default ChantiersModule
