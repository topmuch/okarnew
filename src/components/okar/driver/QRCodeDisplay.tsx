/**
 * OKAR - QR Code Display Component
 * Affichage du QR Code du véhicule avec génération réelle
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Share2, Download, Car, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  qrCode: string | null
  vehicle: {
    plateNumber: string
    brand: string
    model: string
    year?: number | null
    healthScore: number
  }
}

export function QRCodeDisplay({ qrCode, vehicle }: QRCodeDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Générer l'URL publique du QR code
  const publicUrl = qrCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://shopqr.pro'}/q/${qrCode}`
    : null

  // Générer le QR code quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen && publicUrl && !qrDataUrl) {
      generateQRCode()
    }
  }, [isOpen, publicUrl, qrDataUrl])

  const generateQRCode = async () => {
    if (!publicUrl) return
    setIsGenerating(true)
    try {
      // Générer en haute qualité pour l'affichage
      const dataUrl = await QRCode.toDataURL(publicUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0F172A', // Couleur OKAR dark
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Erreur génération QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && publicUrl) {
      try {
        await navigator.share({
          title: `OKAR - ${vehicle.plateNumber}`,
          text: `Consultez le passeport numérique de ${vehicle.brand} ${vehicle.model}`,
          url: publicUrl
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `OKAR-${vehicle.plateNumber}.png`
    link.click()
  }

  if (!qrCode) {
    return (
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
        <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">QR Code non disponible</p>
      </div>
    )
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
        onClick={() => setIsOpen(true)}
      >
        <QrCode className="h-4 w-4 mr-2" />
        Mon QR Code
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <QrCode className="h-5 w-5 text-orange-500" />
              Mon Passeport Numérique
            </DialogTitle>
            <DialogDescription>
              Présentez ce QR Code aux garages OKAR pour vos interventions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* QR Code */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col items-center">
              {isGenerating ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code OKAR" 
                  className="w-48 h-48"
                />
              ) : null}
              <p className="mt-4 text-xs text-gray-400 font-mono">{qrCode}</p>
              <p className="mt-2 text-xs text-blue-500 underline cursor-pointer" onClick={() => publicUrl && window.open(publicUrl, '_blank')}>
                {publicUrl}
              </p>
            </div>

            {/* Infos véhicule */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center">
                <Car className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 font-mono">{vehicle.plateNumber}</p>
                <p className="text-gray-500 text-sm">{vehicle.brand} {vehicle.model}</p>
              </div>
              <Badge className={`${
                vehicle.healthScore >= 70 ? 'bg-green-100 text-green-700' :
                vehicle.healthScore >= 40 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                Score: {vehicle.healthScore}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl"
                onClick={handleDownload}
                disabled={!qrDataUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canvas caché pour la génération */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  )
}

export default QRCodeDisplay
