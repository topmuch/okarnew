/**
 * OKAR - GarageValidationTable Component
 * 
 * Design "Dark Luxury" avec effets glassmorphism
 * Tableau de gestion des garages avec validation, rejet et suspension
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  MapPin,
  FileText,
  Ban,
  Clock,
  Loader2,
  ExternalLink,
  Building2,
  Trash2,
} from 'lucide-react'

// Types
export interface Garage {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  city: string
  address: string
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  documentsComplete: boolean
  submittedAt: string
  rating?: number
  totalClients?: number
  totalRevenue?: number
  latitude?: number
  longitude?: number
}

interface GarageValidationTableProps {
  garages: Garage[]
  onValidate: (garageId: string) => Promise<void>
  onReject: (garageId: string, reason: string) => Promise<void>
  onSuspend: (garageId: string) => Promise<void>
  onReactivate: (garageId: string) => Promise<void>
  onViewDetails: (garageId: string) => void
  onDelete?: (garageId: string) => Promise<void>
  isLoading?: boolean
  filter?: 'all' | 'pending' | 'approved' | 'suspended'
}

const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approuvé',
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  suspended: {
    label: 'Suspendu',
    className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-500',
  },
  rejected: {
    label: 'Rejeté',
    className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    dot: 'bg-slate-500',
  },
}

export function GarageValidationTable({
  garages,
  onValidate,
  onReject,
  onSuspend,
  onReactivate,
  onViewDetails,
  onDelete,
  isLoading = false,
  filter = 'all',
}: GarageValidationTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [garageToDelete, setGarageToDelete] = useState<Garage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtrer les garages
  const filteredGarages = filter === 'all' 
    ? garages 
    : garages.filter(g => g.status === filter)

  const handleAction = async (action: () => Promise<void>, garageId: string) => {
    setActionLoading(garageId)
    try {
      await action()
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedGarage) return
    await handleAction(
      () => onReject(selectedGarage.id, rejectReason),
      selectedGarage.id
    )
    setRejectDialogOpen(false)
    setSelectedGarage(null)
    setRejectReason('')
  }

  const handleDeleteConfirm = async () => {
    if (!garageToDelete || !onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(garageToDelete.id)
      setDeleteDialogOpen(false)
      setGarageToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent bg-okar-dark-800/50">
              <TableHead className="text-okar-text-muted font-medium">Garage</TableHead>
              <TableHead className="text-okar-text-muted font-medium">Propriétaire</TableHead>
              <TableHead className="text-okar-text-muted font-medium">Ville</TableHead>
              <TableHead className="text-okar-text-muted font-medium">Documents</TableHead>
              <TableHead className="text-okar-text-muted font-medium">Statut</TableHead>
              <TableHead className="text-okar-text-muted font-medium">Date</TableHead>
              <TableHead className="text-okar-text-muted font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGarages.length === 0 ? (
              <TableRow className="border-b border-white/5">
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-okar-text-muted" />
                    </div>
                    <p className="text-okar-text-muted">Aucun garage trouvé</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredGarages.map((garage) => (
                <TableRow 
                  key={garage.id} 
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Garage Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-okar-pink-500/20 to-okar-pink-600/10 flex items-center justify-center border border-okar-pink-500/20">
                        <Building2 className="h-5 w-5 text-okar-pink-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-okar-text-primary">{garage.businessName}</p>
                        <div className="flex items-center gap-1.5 text-okar-text-muted text-xs mt-0.5">
                          <Phone className="h-3 w-3" />
                          {garage.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <div>
                      <p className="text-okar-text-secondary font-medium">{garage.ownerName}</p>
                      <p className="text-okar-text-muted text-xs">{garage.email}</p>
                    </div>
                  </TableCell>

                  {/* City */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-okar-text-secondary">
                      <MapPin className="h-3.5 w-3.5 text-okar-pink-400" />
                      {garage.city}
                    </div>
                  </TableCell>

                  {/* Documents */}
                  <TableCell>
                    {garage.documentsComplete ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-medium">
                        <CheckCircle className="h-3 w-3 mr-1.5" />
                        Complets
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 font-medium">
                        <Clock className="h-3 w-3 mr-1.5" />
                        Incomplets
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig[garage.status].dot} shadow-sm`} />
                      <Badge className={statusConfig[garage.status].className}>
                        {statusConfig[garage.status].label}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-okar-text-muted text-sm font-medium">
                    {new Date(garage.submittedAt).toLocaleDateString('fr-FR')}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Bouton Voir détails */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(garage.id)}
                        className="text-okar-text-muted hover:text-white hover:bg-white/5 rounded-lg"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {garage.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-600/20"
                            disabled={actionLoading === garage.id}
                            onClick={() => handleAction(() => onValidate(garage.id), garage.id)}
                            title="Valider"
                          >
                            {actionLoading === garage.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 rounded-lg"
                            disabled={actionLoading === garage.id}
                            onClick={() => {
                              setSelectedGarage(garage)
                              setRejectDialogOpen(true)
                            }}
                            title="Rejeter"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {garage.status === 'approved' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-lg"
                            disabled={actionLoading === garage.id}
                            onClick={() => handleAction(() => onSuspend(garage.id), garage.id)}
                            title="Désactiver"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-xs text-emerald-400 font-medium">Actif</span>
                            <Switch
                              checked={true}
                              onCheckedChange={() => handleAction(() => onSuspend(garage.id), garage.id)}
                              disabled={actionLoading === garage.id}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                        </>
                      )}

                      {garage.status === 'suspended' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-lg"
                            disabled={actionLoading === garage.id}
                            onClick={() => handleAction(() => onReactivate(garage.id), garage.id)}
                            title="Réactiver"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <span className="text-xs text-rose-400 font-medium">Suspendu</span>
                            <Switch
                              checked={false}
                              onCheckedChange={() => handleAction(() => onReactivate(garage.id), garage.id)}
                              disabled={actionLoading === garage.id}
                            />
                          </div>
                        </>
                      )}

                      {/* Bouton Supprimer */}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setGarageToDelete(garage)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-okar-text-muted hover:text-white hover:bg-white/5 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg">
                          <DropdownMenuLabel className="text-okar-text-primary font-semibold">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            onClick={() => onViewDetails(garage.id)}
                            className="text-okar-text-secondary hover:text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-3" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-okar-text-secondary hover:text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                            <Mail className="h-4 w-4 mr-3" />
                            Envoyer email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-okar-text-secondary hover:text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                            <FileText className="h-4 w-4 mr-3" />
                            Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-okar-text-secondary hover:text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-3" />
                            Voir sur la carte
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de rejet */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg text-okar-text-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-okar-text-primary text-lg font-semibold">Rejeter la demande</DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Veuillez indiquer la raison du rejet pour <span className="text-okar-pink-400 font-medium">{selectedGarage?.businessName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full h-32 bg-okar-dark-800/50 border border-white/10 rounded-xl p-4 text-okar-text-primary placeholder:text-okar-text-muted resize-none focus:border-okar-pink-500/50 focus:outline-none focus:ring-2 focus:ring-okar-pink-500/20 transition-all"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
              className="border-white/10 text-okar-text-secondary hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || actionLoading !== null}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg text-okar-text-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-400 text-lg font-semibold flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Supprimer le garage
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Êtes-vous sûr de vouloir supprimer <span className="text-okar-pink-400 font-medium">{garageToDelete?.businessName}</span> ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-rose-400 text-sm">
                ⚠️ Cette action est irréversible. Toutes les données associées à ce garage seront supprimées.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/10 text-okar-text-secondary hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GarageValidationTable
