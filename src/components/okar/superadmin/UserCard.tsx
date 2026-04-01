/**
 * OKAR - UserCard Component
 * 
 * Design "Dark Luxe & Épuré"
 * Carte profil utilisateur pour grille responsive
 * Affiche: Avatar + Nom + Badge Rôle + Email + Véhicule + Statut + Actions
 * 
 * FIXES:
 * - Voir profil: Ouvre dialog avec détails complets
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
  Mail,
  Phone,
  Car,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  User,
  Shield,
  Wrench,
  Calendar,
  Clock,
  Loader2,
  Key,
  Trash2,
  Users,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface UserCardData {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  isApproved: boolean
  subscriptionStatus: string
  createdAt: string
  updatedAt: string
  _count?: {
    vehicles: number
    maintenanceRecords: number
  }
  garage?: {
    id: string
    businessName: string
    city: string
    isActive: boolean
  } | null
}

interface UserCardProps {
  user: UserCardData
  onViewProfile?: (userId: string) => void
  onSuspend?: (userId: string) => Promise<void>
  onReactivate?: (userId: string) => Promise<void>
  onResetPassword?: (userId: string) => Promise<void>
  onDelete?: (userId: string) => Promise<void>
}

// Configuration des rôles
const roleConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  driver: {
    label: 'Conducteur',
    className: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20',
    icon: User,
  },
  garage_certified: {
    label: 'Garage Certifié',
    className: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
    icon: Wrench,
  },
  garage_pending: {
    label: 'Garage en attente',
    className: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    icon: Wrench,
  },
  superadmin: {
    label: 'Super Admin',
    className: 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 text-[#EC4899] border border-[#8B5CF6]/30',
    icon: Shield,
  },
}

// Couleurs d'avatar basées sur le rôle
const avatarColors: Record<string, string> = {
  driver: 'from-[#06B6D4] to-[#0891B2]',
  garage_certified: 'from-[#10B981] to-[#059669]',
  garage_pending: 'from-[#F59E0B] to-[#D97706]',
  superadmin: 'from-[#8B5CF6] to-[#EC4899]',
}

export function UserCard({
  user,
  onViewProfile,
  onSuspend,
  onReactivate,
  onResetPassword,
  onDelete,
}: UserCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  const roleInfo = roleConfig[user.role] || roleConfig.driver
  const avatarGradient = avatarColors[user.role] || avatarColors.driver
  const initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase()

  const handleSuspend = async () => {
    if (!onSuspend) return
    setIsLoading(true)
    try {
      await onSuspend(user.id)
      setShowSuspendDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!onReactivate) return
    setIsLoading(true)
    try {
      await onReactivate(user.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!onResetPassword) return
    setIsLoading(true)
    try {
      await onResetPassword(user.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsLoading(true)
    try {
      await onDelete(user.id)
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(user.id)
    } else {
      setShowProfileDialog(true)
    }
  }

  return (
    <>
      <Card
        className={cn(
          'group relative overflow-hidden',
          'bg-[#1E293B] rounded-2xl border border-[#334155]',
          'shadow-lg hover:border-[#8B5CF6]',
          'hover:-translate-y-1 transition-all duration-300',
          !user.isApproved && 'border-l-4 border-l-[#F59E0B]'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />

        {/* Header: Avatar + Nom + Badge */}
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start gap-3">
            {/* Avatar avec initiales */}
            <div className={cn(
              'relative w-12 h-12 rounded-full flex items-center justify-center',
              'bg-gradient-to-br shadow-lg',
              avatarGradient
            )}>
              <span className="text-white font-bold text-sm">{initials}</span>
              {/* Indicateur de statut */}
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1E293B]',
                user.isApproved ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
              )} />
            </div>

            {/* Nom et rôle */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">
                {user.name || 'Sans nom'}
              </h3>
              <Badge className={cn('mt-1 text-xs', roleInfo.className)}>
                <roleInfo.icon className="h-3 w-3 mr-1" />
                {roleInfo.label}
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
              <DropdownMenuContent align="end" className="w-48 bg-[#1E293B] border-[#334155]">
                <DropdownMenuLabel className="text-[#94A3B8]">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#334155]" />
                
                {/* Voir Profil */}
                <DropdownMenuItem
                  onClick={handleViewProfile}
                  className="text-[#F8FAFC] hover:bg-white/5 cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir Profil
                </DropdownMenuItem>

                {/* Suspendre / Approuver */}
                {user.isApproved ? (
                  onSuspend && (
                    <DropdownMenuItem
                      onClick={() => setShowSuspendDialog(true)}
                      className="text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspendre
                    </DropdownMenuItem>
                  )
                ) : (
                  onReactivate && (
                    <DropdownMenuItem
                      onClick={handleReactivate}
                      className="text-[#10B981] hover:bg-[#10B981]/10 cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </DropdownMenuItem>
                  )
                )}

                {/* Réinitialiser MDP */}
                {onResetPassword && (
                  <DropdownMenuItem
                    onClick={handleResetPassword}
                    className="text-[#F8FAFC] hover:bg-white/5 cursor-pointer"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Réinitialiser MDP
                  </DropdownMenuItem>
                )}

                {/* Supprimer */}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator className="bg-[#334155]" />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer"
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

        {/* Corps: Email + Véhicule */}
        <CardContent className="p-4 space-y-3">
          {/* Email */}
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-sm truncate">{user.email}</span>
          </div>

          {/* Téléphone */}
          {user.phone && (
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}

          {/* Véhicule associé */}
          {user._count && user._count.vehicles > 0 && (
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Car className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-sm">{user._count.vehicles} véhicule(s)</span>
            </div>
          )}

          {/* Garage associé */}
          {user.garage && (
            <div className="mt-2 p-2 rounded-lg bg-[#0F172A]/50 border border-[#334155]/50">
              <p className="text-xs text-[#64748B]">Garage</p>
              <p className="text-sm text-[#F8FAFC] font-medium truncate">{user.garage.businessName}</p>
              <p className="text-xs text-[#94A3B8]">{user.garage.city}</p>
            </div>
          )}
        </CardContent>

        {/* Pied: Statut + Date */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-[#334155]/50 mt-2 pt-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              user.isApproved ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
            )} />
            <span className={cn(
              'text-xs font-medium',
              user.isApproved ? 'text-[#10B981]' : 'text-[#F59E0B]'
            )}>
              {user.isApproved ? 'Actif' : 'En attente'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#64748B] text-xs">
            <Calendar className="h-3 w-3" />
            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          </div>
        </CardFooter>

        {/* Action au survol */}
        {isHovered && (
          <div className="absolute bottom-16 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={handleViewProfile}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white shadow-lg"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir Profil
            </Button>
          </div>
        )}
      </Card>

      {/* Dialog Profil Détaillé */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-[#8B5CF6]" />
              Profil Utilisateur
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Détails complets du compte
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Avatar et nom */}
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                'bg-gradient-to-br shadow-lg',
                avatarGradient
              )}>
                <span className="text-white font-bold text-xl">{initials}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{user.name || 'Sans nom'}</p>
                <Badge className={cn('text-xs', roleInfo.className)}>
                  <roleInfo.icon className="h-3 w-3 mr-1" />
                  {roleInfo.label}
                </Badge>
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                <Mail className="h-4 w-4 text-[#64748B]" />
                <div>
                  <p className="text-[#64748B] text-xs">Email</p>
                  <p className="text-white text-sm">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                  <Phone className="h-4 w-4 text-[#64748B]" />
                  <div>
                    <p className="text-[#64748B] text-xs">Téléphone</p>
                    <p className="text-white text-sm">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                <Calendar className="h-4 w-4 text-[#64748B]" />
                <div>
                  <p className="text-[#64748B] text-xs">Inscription</p>
                  <p className="text-white text-sm">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {user._count && (
                <div className="flex items-center gap-3 p-3 bg-[#0F172A]/50 rounded-xl">
                  <Car className="h-4 w-4 text-[#64748B]" />
                  <div>
                    <p className="text-[#64748B] text-xs">Véhicules</p>
                    <p className="text-white text-sm">{user._count.vehicles} véhicule(s)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Statut */}
            <div className={cn(
              'flex items-center justify-center gap-2 p-3 rounded-xl',
              user.isApproved ? 'bg-[#10B981]/10' : 'bg-[#F59E0B]/10'
            )}>
              <div className={cn(
                'w-2 h-2 rounded-full',
                user.isApproved ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
              )} />
              <span className={cn(
                'font-medium',
                user.isApproved ? 'text-[#10B981]' : 'text-[#F59E0B]'
              )}>
                {user.isApproved ? 'Compte Actif' : 'En attente de validation'}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
              className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suspension */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#EF4444] flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Suspendre l'utilisateur
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Êtes-vous sûr de vouloir suspendre <span className="text-[#EC4899] font-medium">{user.name || user.email}</span> ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl">
              <p className="text-[#EF4444] text-sm">
                L'utilisateur ne pourra plus accéder à son compte jusqu'à sa réactivation.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
              className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={isLoading}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#EF4444] flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Supprimer l'utilisateur
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Êtes-vous sûr de vouloir supprimer <span className="text-[#EC4899] font-medium">{user.name || user.email}</span> ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl">
              <p className="text-[#EF4444] text-sm">
                ⚠️ Cette action est irréversible. Toutes les données de cet utilisateur seront supprimées.
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

export default UserCard
