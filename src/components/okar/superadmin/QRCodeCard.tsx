/**
 * OKAR - QRCodeCard Component
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * Carte lot de QR Codes pour grille responsive
 * 
 * FIXES:
 * - Export PDF fonctionne
 * - Lien cliquable sur le QR code
 * - QR code AGRANDI pour meilleure visibilité
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
  Maximize2,
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

  // Générer le QR code réel - PLUS GRAND
  useEffect(() => {
    const generateQR = async () => {
      setIsGenerating(true)
      try {
        const dataUrl = await generateQRCodeDataUrl(publicUrl, {
          width: 400, // Plus grand pour meilleure qualité
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

      {/* Header: QR Code Visuel - AGRANDI */}
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col items-center gap-4">
          {/* Visuel QR RÉEL - GRAND FORMAT */}
          <div 
            className="relative w-40 h-40 rounded-xl overflow-hidden cursor-pointer border-2 border-white/10 hover:border-white/30 transition-all shadow-lg"
            onClick={handleOpenUrl}
            title="Cliquer pour voir la page publique"
          >
            {isGenerating ? (
              <div className={cn(
                'w-full h-full flex items-center justify-center',
                qrCode.type === 'garage'
                  ? 'bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10'
                  : 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/10'
              )}>
                <Loader2 className="h-12 w-12 animate-spin text-white/50" />
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                className="w-full h-full object-contain bg-white p-2"
              />
            ) : (
              <div className={cn(
                'w-full h-full flex items-center justify-center',
                qrCode.type === 'garage'
                  ? 'bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10'
                  : 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/10'
              )}>
                <QrCode className="h-16 w-16 text-white/50" />
              </div>
            )}
            
            {/* Indicateur type */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0F172A] border-2 border-white/20 flex items-center justify-center">
              {qrCode.type === 'garage' ? (
                <Building2 className="h-4 w-4 text-[#10B981]" />
              ) : (
                <User className="h-4 w-4 text-[#EC4899]" />
              )}
            </div>
          </div>

          {/* Code + Statut */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-mono font-bold text-sm">
                {qrCode.code}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 w-6 p-0 text-[#94A3B8] hover:text-white"
              >
                {copied ? (
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', status.className)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
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
        </div>
      </CardHeader>

      {/* Corps: Infos */}
      <CardContent className="p-4 space-y-3">
        {/* Lot ID */}
        <div className="flex items-center justify-center gap-2 text-[#94A3B8]">
          <Package className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-sm">Lot: <span className="text-white font-mono">{qrCode.lotId}</span></span>
        </div>

        {/* Garage assigné */}
        {qrCode.assignedGarageName && (
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
            <p className="text-xs text-[#64748B]">Garage assigné</p>
            <p className="text-sm text-white font-medium">{qrCode.assignedGarageName}</p>
          </div>
        )}

        {/* Client (si actif) */}
        {qrCode.status === 'active' && qrCode.activatedByName && (
          <div className="p-3 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20 text-center">
            <p className="text-xs text-[#64748B]">Activé par</p>
            <p className="text-sm text-white font-medium">{qrCode.activatedByName}</p>
            {qrCode.vehiclePlateNumber && (
              <p className="text-xs text-[#94A3B8] mt-1 font-mono">{qrCode.vehiclePlateNumber}</p>
            )}
          </div>
        )}

        {/* Lien public - cliquable */}
        <a 
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Ouvrir la page publique
        </a>
      </CardContent>

      {/* Pied: Actions */}
      <CardFooter className="p-4 pt-0 flex items-center justify-center gap-2">
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
      </CardFooter>
    </Card>
  )
}

export default QRCodeCard
