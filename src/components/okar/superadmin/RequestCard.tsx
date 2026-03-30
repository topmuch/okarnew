/**
 * OKAR - Carte de Demande d'Inscription
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * Carte avec verre dépoli et badges néon
 */

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Building2,
  Clock,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RequestData {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  createdAt: string
  garage?: {
    id: string
    businessName: string
    address: string
    city: string
    phone: string
  } | null
}

interface RequestCardProps {
  request: RequestData
  onValidate: (id: string) => Promise<void>
  onReject: (id: string, reason?: string) => Promise<void>
}

export function RequestCard({ request, onValidate, onReject }: RequestCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleValidate = async () => {
    setIsLoading(true)
    try {
      await onValidate(request.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await onReject(request.id, rejectReason || undefined)
      setShowRejectDialog(false)
      setRejectReason('')
    } finally {
      setIsLoading(false)
    }
  }

  const isGarage = request.role === 'garage_pending'
  const formattedDate = new Date(request.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'driver':
        return 'Propriétaire'
      case 'garage_pending':
        return 'Garage'
      default:
        return role
    }
  }

  return (
    <>
      <Card className={cn(
        // VERRE DÉPOLI CLAIR
        'bg-slate-800/60 backdrop-blur-md',
        'rounded-2xl overflow-hidden',
        // Bordure fine lumineuse
        'border border-white/10',
        // Ombre douce
        'shadow-lg shadow-black/20',
        // Hover effects
        'hover:border-white/20',
        'hover:bg-slate-800/70',
        'hover:shadow-xl hover:shadow-black/30',
        'transition-all duration-300'
      )}>
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent pointer-events-none" />
        
        <CardContent className="p-0 relative">
          {/* Header avec type - Gradient lumineux */}
          <div className={cn(
            'px-6 py-3',
            isGarage 
              ? 'bg-gradient-to-r from-[#8B5CF6]/25 to-[#EC4899]/15 border-b border-white/5' 
              : 'bg-gradient-to-r from-[#06B6D4]/25 to-[#3B82F6]/15 border-b border-white/5'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isGarage ? (
                  <Building2 className="h-5 w-5 text-[#A78BFA]" />
                ) : (
                  <User className="h-5 w-5 text-[#22D3EE]" />
                )}
                <span className="font-semibold text-white">
                  {isGarage ? request.garage?.businessName || 'Garage' : request.name || 'Utilisateur'}
                </span>
              </div>
              <Badge className={cn(
                'border font-medium',
                isGarage 
                  ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border-[#8B5CF6]/30 shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                  : 'bg-[#06B6D4]/20 text-[#22D3EE] border-[#06B6D4]/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              )}>
                {getRoleLabel(request.role)}
              </Badge>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-4">
            {/* Infos de contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-[#64748B]" />
                <span className="text-[#CBD5E1]">{request.email}</span>
              </div>
              
              {request.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-[#64748B]" />
                  <span className="text-[#CBD5E1]">{request.phone}</span>
                </div>
              )}

              {isGarage && request.garage && (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#CBD5E1]">
                      {request.garage.address}, {request.garage.city}
                    </span>
                  </div>
                  {request.garage.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#CBD5E1]">{request.garage.phone}</span>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-[#64748B]" />
                <span className="text-[#CBD5E1]">{formattedDate}</span>
              </div>
            </div>

            {/* Temps d'attente */}
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Clock className="h-3.5 w-3.5" />
              <span>
                En attente depuis {Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60))}h
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleValidate}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Valider
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-[#EF4444]/30 text-[#F87171] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/50 rounded-xl"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de rejet - Style glassmorphism */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-slate-800/90 backdrop-blur-xl border-white/10 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Rejeter la demande</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Êtes-vous sûr de vouloir rejeter cette demande d'inscription ?
              L'utilisateur sera supprimé définitivement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label className="text-[#94A3B8] text-sm">Motif du rejet (optionnel)</Label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Documents incomplets..."
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#EF4444]/50 focus:ring-[#EF4444]/20"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirmer le rejet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RequestCard
