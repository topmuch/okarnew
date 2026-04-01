/**
 * OKAR - VehicleCard Component
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * Carte fiche véhicule avec verre dépoli clair et badges néon
 * Fond: bg-slate-800/60 avec backdrop-blur-md
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
  Car,
  User,
  Calendar,
  Gauge,
  QrCode,
  MoreVertical,
  Eye,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface VehicleCardData {
  id: string
  plateNumber: string
  brand: string
  model: string
  year: number | null
  owner: string
  ownerEmail?: string
  ownerPhone?: string
  healthScore: number
  mileage: number
  qrCode: string
  qrType?: 'garage' | 'particulier'
  createdAt: string
  ctStatus?: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
  ctExpiryDate?: string
}

interface VehicleCardProps {
  vehicle: VehicleCardData
  onViewHistory?: (vehicleId: string) => void
  onViewAudit?: (vehicleId: string) => void
  onViewOwner?: (ownerId: string) => void
}

// Configuration du statut CT avec effet NÉON
const ctStatusConfig = {
  valid: {
    label: 'CT Valide',
    className: 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30',
    glowStyle: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    icon: CheckCircle,
    dot: 'bg-[#10B981]',
  },
  expiring_soon: {
    label: 'CT Expire bientôt',
    className: 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30',
    glowStyle: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    icon: Clock,
    dot: 'bg-[#F59E0B]',
  },
  expired: {
    label: 'CT Expiré',
    className: 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30',
    glowStyle: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    icon: AlertTriangle,
    dot: 'bg-[#EF4444]',
  },
  unknown: {
    label: 'CT Inconnu',
    className: 'bg-[#64748B]/15 text-[#94A3B8] border border-[#64748B]/30',
    glowStyle: 'shadow-[0_0_8px_rgba(100,116,139,0.3)]',
    icon: Shield,
    dot: 'bg-[#64748B]',
  },
}

// Couleur du score santé avec effet lumineux
const getHealthColor = (score: number) => {
  if (score >= 70) return 'text-[#34D399]'
  if (score >= 40) return 'text-[#FBBF24]'
  return 'text-[#F87171]'
}

const getHealthGradient = (score: number) => {
  if (score >= 70) return 'from-[#10B981] to-[#059669]'
  if (score >= 40) return 'from-[#F59E0B] to-[#D97706]'
  return 'from-[#EF4444] to-[#DC2626]'
}

const getHealthGlow = (score: number) => {
  if (score >= 70) return 'shadow-[0_0_20px_rgba(16,185,129,0.4)]'
  if (score >= 40) return 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'
  return 'shadow-[0_0_20px_rgba(239,68,68,0.4)]'
}

export function VehicleCard({
  vehicle,
  onViewHistory,
  onViewAudit,
  onViewOwner,
}: VehicleCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const ctStatus = ctStatusConfig[vehicle.ctStatus || 'unknown']
  const CtIcon = ctStatus.icon

  // Calculer la couleur de bordure basée sur le statut CT
  const getBorderColor = () => {
    switch (vehicle.ctStatus) {
      case 'valid': return 'border-l-[#10B981]'
      case 'expiring_soon': return 'border-l-[#F59E0B]'
      case 'expired': return 'border-l-[#EF4444]'
      default: return 'border-l-[#64748B]'
    }
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        // VERRE DÉPOLI CLAIR - bg-slate-800/60 avec backdrop-blur-md
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
        getBorderColor()
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner Glow - lueur intérieure haute */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent pointer-events-none rounded-2xl" />
      
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Header: Icône véhicule + Immatriculation */}
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start gap-3">
          {/* Icône véhicule stylisée avec GLOW */}
          <div className={cn(
            'relative w-12 h-12 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br',
            getHealthGradient(vehicle.healthScore),
            getHealthGlow(vehicle.healthScore),
            'transition-all duration-300',
            isHovered && 'scale-105'
          )}>
            <Car className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            
            {/* Indicateur score */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center">
              <span className={cn('text-[10px] font-bold', getHealthColor(vehicle.healthScore))}>
                {vehicle.healthScore}
              </span>
            </div>
          </div>

          {/* Plaque + Modèle - TEXTES BLANCS */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-mono font-bold text-lg tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              {vehicle.plateNumber}
            </h3>
            <p className="text-[#CBD5E1] text-sm truncate">
              {vehicle.brand} {vehicle.model}
              {vehicle.year && ` (${vehicle.year})`}
            </p>
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
              
              {onViewHistory && (
                <DropdownMenuItem
                  onClick={() => onViewHistory(vehicle.id)}
                  className="text-white hover:bg-white/5 cursor-pointer focus:bg-white/5"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Historique complet
                </DropdownMenuItem>
              )}
              
              {onViewAudit && (
                <DropdownMenuItem
                  onClick={() => onViewAudit(vehicle.id)}
                  className="text-white hover:bg-white/5 cursor-pointer focus:bg-white/5"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Audit complet
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Corps: Infos */}
      <CardContent className="p-4 space-y-3">
        {/* Propriétaire - TEXTE BLANC */}
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-[#EC4899]" />
          <span className="text-white text-sm font-medium truncate">{vehicle.owner}</span>
        </div>

        {/* Contact - GRIS CLAIR */}
        {(vehicle.ownerEmail || vehicle.ownerPhone) && (
          <div className="flex items-center gap-4 text-[#94A3B8] text-xs">
            {vehicle.ownerEmail && (
              <span className="truncate max-w-32">{vehicle.ownerEmail}</span>
            )}
            {vehicle.ownerPhone && (
              <span>{vehicle.ownerPhone}</span>
            )}
          </div>
        )}

        {/* Stats avec verre dépoli */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* Kilométrage */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-[#06B6D4]" />
              <span className="text-xs text-[#94A3B8]">KM</span>
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {vehicle.mileage.toLocaleString('fr-FR')}
            </p>
          </div>

          {/* QR Type */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5 text-[#A78BFA]" />
              <span className="text-xs text-[#94A3B8]">Type</span>
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {vehicle.qrType === 'garage' ? 'Garage' : 'Particulier'}
            </p>
          </div>
        </div>

        {/* Statut CT avec effet NÉON */}
        <div className="flex items-center justify-between pt-2">
          <Badge className={cn(
            'text-xs font-medium',
            ctStatus.className,
            ctStatus.glowStyle
          )}>
            <CtIcon className="h-3 w-3 mr-1" />
            {ctStatus.label}
          </Badge>
          {vehicle.ctExpiryDate && (
            <span className="text-xs text-[#94A3B8]">
              Exp: {new Date(vehicle.ctExpiryDate).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </CardContent>

      {/* Pied: Date + Actions rapides */}
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-2 pt-3">
        <div className="flex items-center gap-1 text-[#64748B] text-xs">
          <Calendar className="h-3 w-3" />
          Ajouté le {new Date(vehicle.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </CardFooter>

      {/* Action au survol */}
      {isHovered && onViewHistory && (
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={() => onViewHistory(vehicle.id)}
            className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir Historique Complet
          </Button>
        </div>
      )}
    </Card>
  )
}

export default VehicleCard
