/**
 * OKAR - GarageCard Component
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * Carte partenaire garage avec verre dépoli et badges néon
 * 
 * FIXES:
 * - Voir détail: Ouvre dialog avec détails complets
 * - Supprimer: Bouton de suppression avec confirmation
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Car,
  Star,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  ExternalLink,
  Clock,
  Loader2,
  Calendar,
  TrendingUp,
  Trash2,
  Users,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface GarageCardData {
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

interface GarageCardProps {
  garage: GarageCardData
  onValidate?: (garageId: string) => Promise<void>
  onReject?: (garageId: string, reason: string) => Promise<void>
  onSuspend?: (garageId: string) => Promise<void>
  onReactivate?: (garageId: string) => Promise<void>
  onViewDetails?: (garageId: string) => void
  onViewDashboard?: (garageId: string) => void
  onDelete?: (garageId: string) => Promise<void>
}

// Configuration des statuts avec effet NÉON
const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30',
    glowStyle: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    borderColor: 'border-l-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
  approved: {
    label: 'Validé',
    className: 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30',
    glowStyle: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    borderColor: 'border-l-[#10B981]',
    dot: 'bg-[#10B981]',
  },
  suspended: {
    label: 'Suspendu',
    className: 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30',
    glowStyle: 'shadow-[0_0_12px_rgba(239,68,68,0.35)]',
    borderColor: 'border-l-[#EF4444]',
    dot: 'bg-[#EF4444]',
  },
  rejected: {
    label: 'Rejeté',
    className: 'bg-[#64748B]/15 text-[#94A3B8] border border-[#64748B]/30',
    glowStyle: 'shadow-[0_0_8px_rgba(100,116,139,0.25)]',
    borderColor: 'border-l-[#64748B]',
    dot: 'bg-[#64748B]',
  },
}

export function GarageCard({
  garage,
  onValidate,
  onReject,
  onSuspend,
  onReactivate,
  onViewDetails,
  onViewDashboard,
  onDelete,
}: GarageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const status = statusConfig[garage.status]
  const initials = garage.businessName.substring(0, 2).toUpperCase()

  const handleValidate = async () => {
    if (!onValidate) return
    setIsLoading(true)
    try {
      await onValidate(garage.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsLoading(true)
    try {
      await onReject(garage.id, rejectReason)
      setShowRejectDialog(false)
      setRejectReason('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!onSuspend) return
    setIsLoading(true)
    try {
      await onSuspend(garage.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!onReactivate) return
    setIsLoading(true)
    try {
      await onReactivate(garage.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsLoading(true)
    try {
      await onDelete(garage.id)
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(garage.id)
    } else {
      setShowDetailsDialog(true)
    }
  }

  return (
    <>
      <Card
        className={cn(
          'group relative overflow-hidden',
          // VERRE DÉPOLI CLAIR
          'bg-slate-800/60 backdrop-blur-md',
          'rounded-2xl',
          // Bordure fine lumineuse
          'border border-white/10',
          // Ombre douce
          'shadow-lg shadow-black/20',
          // Hover effects
          'hover:border-white/20',
          'hover:bg-slate-800/70',
          'hover:-translate-y-1',
          'hover:shadow-xl hover:shadow-black/30',
          'transition-all duration-300',
          // Bordure gauche colorée
          'border-l-4',
          status.borderColor
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent pointer-events-none rounded-2xl" />
        
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

        {/* Header: Logo + Nom + Badge */}
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start gap-3">
            {/* Logo garage avec effet lumineux */}
            <div className={cn(
              'relative w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-[#8B5CF6]/30 to-[#EC4899]/20',
              'border border-white/10',
              'shadow-[0_0_20px_rgba(139,92,246,0.25)]'
            )}>
              <Building2 className="h-6 w-6 text-[#EC4899]" />
            </div>

            {/* Nom et statut - TEXTES BLANCS */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">
                {garage.businessName}
              </h3>
              <Badge className={cn(
                'mt-1 text-xs font-medium',
                status.className,
                status.glowStyle
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)} />
                {status.label}
              </Badge>
            </div>

            {/* Menu actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0 rounded-lg',
                    'text-[#94A3B8] hover:text-white hover:bg-white/10'
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-800/90 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="text-[#94A3B8]">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                {/* Voir détails */}
                <DropdownMenuItem
                  onClick={handleViewDetails}
                  className="text-white hover:bg-white/5 cursor-pointer focus:bg-white/5"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                
                {onViewDashboard && garage.status === 'approved' && (
                  <DropdownMenuItem
                    onClick={() => onViewDashboard(garage.id)}
                    className="text-white hover:bg-white/5 cursor-pointer focus:bg-white/5"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir Dashboard
                  </DropdownMenuItem>
                )}

                {garage.status === 'pending' && (
                  <>
                    {onValidate && (
                      <DropdownMenuItem
                        onClick={handleValidate}
                        className="text-[#34D399] hover:bg-[#10B981]/10 cursor-pointer focus:bg-[#10B981]/10"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider
                      </DropdownMenuItem>
                    )}
                    {onReject && (
                      <DropdownMenuItem
                        onClick={() => setShowRejectDialog(true)}
                        className="text-[#F87171] hover:bg-[#EF4444]/10 cursor-pointer focus:bg-[#EF4444]/10"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {garage.status === 'approved' && onSuspend && (
                  <DropdownMenuItem
                    onClick={handleSuspend}
                    className="text-[#FBBF24] hover:bg-[#F59E0B]/10 cursor-pointer focus:bg-[#F59E0B]/10"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspendre
                  </DropdownMenuItem>
                )}

                {garage.status === 'suspended' && onReactivate && (
                  <DropdownMenuItem
                    onClick={handleReactivate}
                    className="text-[#34D399] hover:bg-[#10B981]/10 cursor-pointer focus:bg-[#10B981]/10"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Réactiver
                  </DropdownMenuItem>
                )}

                {/* Supprimer */}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer focus:bg-[#EF4444]/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Corps: Infos */}
        <CardContent className="p-4 space-y-3">
          {/* Propriétaire - BLANC */}
          <div className="text-sm">
            <span className="text-[#94A3B8]">Propriétaire: </span>
            <span className="text-white">{garage.ownerName}</span>
          </div>

          {/* Ville */}
          <div className="flex items-center gap-2 text-[#CBD5E1]">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#EC4899]" />
            <span className="text-sm">{garage.city}</span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#94A3B8]">
              <Phone className="h-3 w-3" />
              <span className="text-xs">{garage.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#94A3B8]">
              <Mail className="h-3 w-3" />
              <span className="text-xs truncate max-w-32">{garage.email}</span>
            </div>
          </div>

          {/* Stats avec verre dépoli */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-[#06B6D4]" />
                <span className="text-xs text-[#94A3B8]">Véhicules</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {garage.totalClients || 0}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span className="text-xs text-[#94A3B8]">Note</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {garage.rating ? garage.rating.toFixed(1) : '-'}
              </p>
            </div>
          </div>

          {/* Documents avec indicateur */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              {garage.documentsComplete ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-[#34D399]" />
                  <span className="text-xs text-[#34D399] font-medium">Documents complets</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span className="text-xs text-[#FBBF24] font-medium">Documents incomplets</span>
                </>
              )}
            </div>
          </div>
        </CardContent>

        {/* Pied: Date */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-2 pt-3">
          <div className="flex items-center gap-1 text-[#64748B] text-xs">
            <Calendar className="h-3 w-3" />
            {new Date(garage.submittedAt).toLocaleDateString('fr-FR')}
          </div>
        </CardFooter>

        {/* Actions rapides au survol */}
        {isHovered && garage.status === 'pending' && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onValidate && (
              <Button
                onClick={handleValidate}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Valider
              </Button>
            )}
            {onReject && (
              <Button
                onClick={() => setShowRejectDialog(true)}
                variant="outline"
                className="flex-1 border-[#EF4444]/30 text-[#F87171] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/50"
                size="sm"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Dialog Détails */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#8B5CF6]" />
              Détails du Garage
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Informations complètes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Nom et statut */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#EC4899]/20 flex items-center justify-center border border-white/10">
                <Building2 className="h-8 w-8 text-[#EC4899]" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{garage.businessName}</p>
                <Badge className={cn('text-xs', status.className)}>
                  {status.label}
                </Badge>
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                <Users className="h-4 w-4 text-[#64748B]" />
                <div>
                  <p className="text-[#64748B] text-xs">Propriétaire</p>
                  <p className="text-white text-sm">{garage.ownerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                <MapPin className="h-4 w-4 text-[#64748B]" />
                <div>
                  <p className="text-[#64748B] text-xs">Adresse</p>
                  <p className="text-white text-sm">{garage.address}, {garage.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                <Mail className="h-4 w-4 text-[#64748B]" />
                <div>
                  <p className="text-[#64748B] text-xs">Email</p>
                  <p className="text-white text-sm">{garage.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                <Phone className="h-4 w-4 text-[#64748B]" />
                <div>
                  <p className="text-[#64748B] text-xs">Téléphone</p>
                  <p className="text-white text-sm">{garage.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0F172A]/50 rounded-xl">
                  <div className="flex items-center gap-2 text-[#64748B] text-xs">
                    <Car className="h-3.5 w-3.5" />
                    Véhicules
                  </div>
                  <p className="text-white font-bold text-xl mt-1">{garage.totalClients || 0}</p>
                </div>
                <div className="p-3 bg-[#0F172A]/50 rounded-xl">
                  <div className="flex items-center gap-2 text-[#64748B] text-xs">
                    <Star className="h-3.5 w-3.5" />
                    Note
                  </div>
                  <p className="text-white font-bold text-xl mt-1">{garage.rating?.toFixed(1) || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet - Style glassmorphism */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-[#1E293B]/90 backdrop-blur-xl border-white/10 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#F87171] flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Rejeter le garage
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Veuillez indiquer la raison du rejet pour <span className="text-[#EC4899] font-medium">{garage.businessName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-[#64748B] resize-none focus:border-[#EF4444]/50 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 transition-all"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || isLoading}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              {isLoading ? (
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#EF4444] flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Supprimer le garage
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Êtes-vous sûr de vouloir supprimer <span className="text-[#EC4899] font-medium">{garage.businessName}</span> ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl">
              <p className="text-[#EF4444] text-sm">
                ⚠️ Cette action est irréversible. Toutes les données de ce garage seront supprimées.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GarageCard
