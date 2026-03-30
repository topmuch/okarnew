/**
 * OKAR - QRCodeCard Component
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * Carte lot de QR Codes pour grille responsive
 * 
 * FIXES:
 * - Export PDF fonctionne
 * - Lien cliquable sur le QR code
 * - QR code agrandi
 */

'use client'

import { useState, useEffect } from 'react'
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
  QrCode,
  Package,
  Hash,
  Calendar,
  Building2,
  User,
  Download,
  MoreVertical,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Copy,
  ExternalLink,
  Loader2,
  Link,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateQRCodeDataUrl, getPublicQRUrl } from '@/lib/qrcode'
import { generateSingleQRPDF } from '@/lib/qrcode-pdf'

// Types
export interface QRCodeCardData {
  id: string
  code: string
  lotId: string
  type: 'garage' | 'particulier'
  status: 'stock' | 'active' | 'lost'
  assignedGarageId?: string
  assignedGarageName?: string
  activatedByName?: string
  activatedByEmail?: string
  activatedByPhone?: string
  vehicleId?: string
  vehiclePlateNumber?: string
  createdAt: string
  activatedAt?: string
}

interface QRCodeCardProps {
  qrCode: QRCodeCardData
  onExportPDF?: (codeId: string) => Promise<void>
  onViewVehicle?: (vehicleId: string) => void
  onViewDetails?: (qrCode: QRCodeCardData) => void
  onCopyCode?: (code: string) => void
}

// Configuration des statuts
const statusConfig = {
  stock: {
    label: 'En Stock',
    className: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20',
    borderColor: 'border-l-[#06B6D4]',
    dot: 'bg-[#06B6D4]',
    icon: Clock,
  },
  active: {
    label: 'Actif',
    className: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
    borderColor: 'border-l-[#10B981]',
    dot: 'bg-[#10B981]',
    icon: CheckCircle,
  },
  lost: {
    label: 'Perdu',
    className: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
    borderColor: 'border-l-[#EF4444]',
    dot: 'bg-[#EF4444]',
    icon: XCircle,
  },
}

export function QRCodeCard({
  qrCode,
  onExportPDF,
  onViewVehicle,
  onViewDetails,
  onCopyCode,
}: QRCodeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const status = statusConfig[qrCode.status]
  const StatusIcon = status.icon
  const publicUrl = getPublicQRUrl(qrCode.code)

  // Générer le QR code réel
  useEffect(() => {
    const generateQR = async () => {
      setIsGenerating(true)
      try {
        const dataUrl = await generateQRCodeDataUrl(publicUrl, {
          width: 300, // Plus grand pour meilleure qualité
          margin: 2,
          darkColor: qrCode.type === 'garage' ? '#10B981' : '#8B5CF6',
        })
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error('Erreur génération QR:', error)
      } finally {
        setIsGenerating(false)
      }
    }
    generateQR()
  }, [publicUrl, qrCode.type])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Utiliser le générateur PDF
      await generateSingleQRPDF(
        qrCode.code,
        qrCode.type,
        qrCode.activatedByName,
        qrCode.vehiclePlateNumber
      )
    } catch (error) {
      console.error('Erreur export PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrCode.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (onCopyCode) onCopyCode(qrCode.code)
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenUrl = () => {
    window.open(publicUrl, '_blank')
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'bg-slate-800/60 backdrop-blur-md rounded-2xl',
        'border border-white/10',
        'shadow-lg shadow-black/20',
        'hover:border-white/20',
        'hover:bg-slate-800/70',
        'hover:-translate-y-1',
        'hover:shadow-xl hover:shadow-black/30',
        'transition-all duration-300',
        'border-l-4',
        status.borderColor
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent pointer-events-none rounded-2xl" />

      {/* Header: QR Code Visuel + Type */}
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start gap-4">
          {/* Visuel QR RÉEL - AGRANDI */}
          <div 
            className="relative w-24 h-24 rounded-xl overflow-hidden cursor-pointer"
            onClick={handleOpenUrl}
            title="Cliquer pour voir la page publique"
          >
            {isGenerating ? (
              <div className={cn(
                'w-full h-full flex items-center justify-center',
                qrCode.type === 'garage'
                  ? 'bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10 border border-[#10B981]/30'
                  : 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/10 border border-[#8B5CF6]/30'
              )}>
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                className="w-full h-full object-contain bg-white p-1"
              />
            ) : (
              <div className={cn(
                'w-full h-full flex items-center justify-center',
                qrCode.type === 'garage'
                  ? 'bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10 border border-[#10B981]/30'
                  : 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/10 border border-[#8B5CF6]/30'
              )}>
                <QrCode className="h-10 w-10 text-white/50" />
              </div>
            )}
            
            {/* Indicateur type */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center">
              {qrCode.type === 'garage' ? (
                <Building2 className="h-3 w-3 text-[#10B981]" />
              ) : (
                <User className="h-3 w-3 text-[#EC4899]" />
              )}
            </div>
          </div>

          {/* ID + Statut */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-mono font-bold text-sm truncate">
                {qrCode.code.substring(0, 12)}...
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-5 w-5 p-0 text-[#94A3B8] hover:text-white"
              >
                {copied ? (
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <Badge className={cn('mt-1 text-xs', status.className)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>

            {/* Type badge */}
            <div className="mt-2">
              <Badge className={cn(
                'text-xs',
                qrCode.type === 'garage'
                  ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                  : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20'
              )}>
                {qrCode.type === 'garage' ? 'Garage' : 'Particulier'}
              </Badge>
            </div>
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
            <DropdownMenuContent align="end" className="w-52 bg-[#1E293B] border-[#334155]">
              <DropdownMenuLabel className="text-[#94A3B8]">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#334155]" />
              
              {/* Ouvrir la page */}
              <DropdownMenuItem
                onClick={handleOpenUrl}
                className="text-white hover:bg-white/5 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir la page publique
              </DropdownMenuItem>

              {/* Copier le lien */}
              <DropdownMenuItem
                onClick={handleCopyUrl}
                className="text-white hover:bg-white/5 cursor-pointer"
              >
                <Link className="h-4 w-4 mr-2" />
                Copier le lien
              </DropdownMenuItem>

              {onViewDetails && (
                <DropdownMenuItem
                  onClick={() => onViewDetails(qrCode)}
                  className="text-white hover:bg-white/5 cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
              )}

              {/* Télécharger PDF */}
              <DropdownMenuItem
                onClick={handleExport}
                className="text-white hover:bg-white/5 cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </DropdownMenuItem>

              {qrCode.vehicleId && onViewVehicle && (
                <DropdownMenuItem
                  onClick={() => onViewVehicle(qrCode.vehicleId!)}
                  className="text-[#06B6D4] hover:bg-[#06B6D4]/10 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir véhicule
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Corps: Infos */}
      <CardContent className="p-4 space-y-3">
        {/* Lot ID */}
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <Package className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-sm">Lot: <span className="text-white font-mono">{qrCode.lotId}</span></span>
        </div>

        {/* Garage assigné */}
        {qrCode.assignedGarageName && (
          <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5">
            <p className="text-xs text-[#64748B]">Garage assigné</p>
            <p className="text-sm text-white font-medium truncate">{qrCode.assignedGarageName}</p>
          </div>
        )}

        {/* Client (si actif) */}
        {qrCode.status === 'active' && qrCode.activatedByName && (
          <div className="mt-2 p-2 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20">
            <p className="text-xs text-[#64748B]">Activé par</p>
            <p className="text-sm text-white font-medium">{qrCode.activatedByName}</p>
            {qrCode.vehiclePlateNumber && (
              <p className="text-xs text-[#94A3B8] mt-1 font-mono">{qrCode.vehiclePlateNumber}</p>
            )}
          </div>
        )}

        {/* Lien public */}
        <div className="flex items-center gap-2">
          <a 
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#64748B] hover:text-[#8B5CF6] truncate flex-1"
          >
            {publicUrl}
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            className="h-5 w-5 p-0 text-[#64748B] hover:text-white"
          >
            {copied ? (
              <CheckCircle className="h-3 w-3 text-[#10B981]" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>

      {/* Pied: Date */}
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-2 pt-3">
        <div className="flex items-center gap-1 text-[#64748B] text-xs">
          <Calendar className="h-3 w-3" />
          Créé le {new Date(qrCode.createdAt).toLocaleDateString('fr-FR')}
        </div>
        {qrCode.activatedAt && (
          <div className="flex items-center gap-1 text-[#10B981] text-xs">
            <CheckCircle className="h-3 w-3" />
            Activé
          </div>
        )}
      </CardFooter>

      {/* Action au survol */}
      {isHovered && (
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <Button
            onClick={handleOpenUrl}
            className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white shadow-lg text-sm"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm"
            size="sm"
            disabled={isExporting}
          >
            {isExporting ? (
              <Clock className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            PDF
          </Button>
        </div>
      )}
    </Card>
  )
}

export default QRCodeCard
