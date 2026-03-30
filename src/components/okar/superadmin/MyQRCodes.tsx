/**
 * OKAR - MyQRCodes Component
 * 
 * Design "Dark Luxury" avec effets glassmorphism
 * Affichage des QR codes générés avec sous-onglets Garages et Particuliers
 * Affiche les infos du client après activation du QR code
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  QrCode,
  Building2,
  User,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Copy,
  Sparkles,
  Trash2,
  ExternalLink,
} from 'lucide-react'

// Types
export interface QRCodeItem {
  id: string
  code: string
  lotId: string
  type: 'garage' | 'particulier'
  status: 'stock' | 'active' | 'lost'
  assignedGarageId?: string
  assignedGarageName?: string
  // Infos client après activation
  activatedByName?: string
  activatedByEmail?: string
  activatedByPhone?: string
  vehicleId?: string
  vehiclePlateNumber?: string
  createdAt: string
  activatedAt?: string
}

interface MyQRCodesProps {
  qrCodes: QRCodeItem[]
  isLoading?: boolean
  onExportPDF?: (codeId: string) => Promise<void>
  onViewVehicle?: (vehicleId: string) => void
  onDeleteQR?: (qrId: string) => Promise<void>
}

const statusConfig = {
  stock: {
    label: 'En stock',
    icon: Clock,
    className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    dot: 'bg-blue-500',
  },
  active: {
    label: 'Actif',
    icon: CheckCircle,
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  lost: {
    label: 'Perdu',
    icon: XCircle,
    className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-500',
  },
}

export function MyQRCodes({
  qrCodes,
  isLoading = false,
  onExportPDF,
  onViewVehicle,
  onDeleteQR,
}: MyQRCodesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQR, setSelectedQR] = useState<QRCodeItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [qrToDelete, setQrToDelete] = useState<QRCodeItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Filtrer par type
  const garageQRCodes = qrCodes.filter(qr => qr.type === 'garage')
  const particulierQRCodes = qrCodes.filter(qr => qr.type === 'particulier')

  // Filtrer par recherche
  const filterBySearch = (items: QRCodeItem[]) => {
    if (!searchQuery) return items
    return items.filter(qr =>
      qr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.lotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.activatedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.vehiclePlateNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Stats par type
  const getStats = (items: QRCodeItem[]) => ({
    total: items.length,
    stock: items.filter(qr => qr.status === 'stock').length,
    active: items.filter(qr => qr.status === 'active').length,
    lost: items.filter(qr => qr.status === 'lost').length,
  })

  const garageStats = getStats(garageQRCodes)
  const particulierStats = getStats(particulierQRCodes)

  // Copier le code
  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Exporter
  const handleExport = async (codeId: string) => {
    if (!onExportPDF) return
    setIsExporting(true)
    try {
      await onExportPDF(codeId)
    } finally {
      setIsExporting(false)
    }
  }

  // Voir les détails
  const handleViewDetails = (qr: QRCodeItem) => {
    setSelectedQR(qr)
    setDetailsOpen(true)
  }

  // Confirmer suppression
  const handleDeleteConfirm = async () => {
    if (!qrToDelete || !onDeleteQR) return
    setIsDeleting(true)
    try {
      await onDeleteQR(qrToDelete.id)
      setDeleteDialogOpen(false)
      setQrToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // Copier l'URL publique
  const copyPublicUrl = async (code: string) => {
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/search?code=${code}`
    await navigator.clipboard.writeText(publicUrl)
    setCopiedUrl(code)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Générer l'URL publique
  const getPublicUrl = (code: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/search?code=${code}`
  }

  return (
    <div className="space-y-6">
      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">Total QR Codes</span>
            <div className="w-8 h-8 rounded-lg bg-okar-pink-500/10 flex items-center justify-center">
              <QrCode className="h-4 w-4 text-okar-pink-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-okar-text-primary mt-3">{qrCodes.length.toLocaleString()}</p>
        </div>
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">En stock</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-3">
            {(garageStats.stock + particulierStats.stock).toLocaleString()}
          </p>
        </div>
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3">
            {(garageStats.active + particulierStats.active).toLocaleString()}
          </p>
        </div>
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">Perdus</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-3">
            {(garageStats.lost + particulierStats.lost)}
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-okar-text-muted" />
        <Input
          placeholder="Rechercher par code, lot, client ou plaque..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 bg-okar-dark-card/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50 focus:ring-okar-pink-500/20 h-12 rounded-xl"
        />
      </div>

      {/* Onglets */}
      <Tabs defaultValue="particulier" className="space-y-4">
        <TabsList className="bg-okar-dark-card/50 border border-white/5 p-1 rounded-xl">
          <TabsTrigger 
            value="particulier" 
            className="data-[state=active]:bg-okar-pink-500/20 data-[state=active]:text-okar-pink-400 data-[state=active]:border-okar-pink-500/30 text-okar-text-muted rounded-lg transition-all"
          >
            <User className="h-4 w-4 mr-2" />
            Particuliers ({particulierQRCodes.length})
          </TabsTrigger>
          <TabsTrigger 
            value="garage" 
            className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 text-okar-text-muted rounded-lg transition-all"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Garages ({garageQRCodes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="particulier">
          <QRCodeTable
            qrCodes={filterBySearch(particulierQRCodes)}
            isLoading={isLoading}
            type="particulier"
            onCopy={copyCode}
            copiedCode={copiedCode}
            onViewDetails={handleViewDetails}
            onExport={handleExport}
            isExporting={isExporting}
            onViewVehicle={onViewVehicle}
            onDeleteQR={onDeleteQR ? (qr) => { setQrToDelete(qr); setDeleteDialogOpen(true); } : undefined}
            getPublicUrl={getPublicUrl}
            copiedUrl={copiedUrl}
            onCopyUrl={copyPublicUrl}
          />
        </TabsContent>

        <TabsContent value="garage">
          <QRCodeTable
            qrCodes={filterBySearch(garageQRCodes)}
            isLoading={isLoading}
            type="garage"
            onCopy={copyCode}
            copiedCode={copiedCode}
            onViewDetails={handleViewDetails}
            onExport={handleExport}
            isExporting={isExporting}
            onViewVehicle={onViewVehicle}
            onDeleteQR={onDeleteQR ? (qr) => { setQrToDelete(qr); setDeleteDialogOpen(true); } : undefined}
            getPublicUrl={getPublicUrl}
            copiedUrl={copiedUrl}
            onCopyUrl={copyPublicUrl}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog confirmation suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg text-okar-text-primary max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-3 text-lg font-semibold">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-rose-400" />
              </div>
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Êtes-vous sûr de vouloir supprimer ce QR code ?
            </DialogDescription>
          </DialogHeader>
          
          {qrToDelete && (
            <div className="py-4">
              <div className="p-4 bg-okar-dark-800/50 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-okar-text-muted text-sm">Code:</span>
                  <span className="text-okar-text-primary font-mono text-sm">{qrToDelete.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-okar-text-muted text-sm">Statut:</span>
                  <Badge className={statusConfig[qrToDelete.status].className}>
                    {statusConfig[qrToDelete.status].label}
                  </Badge>
                </div>
                {qrToDelete.status === 'active' && (
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-400 text-sm flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Attention: Ce QR code est actif et lié à un véhicule
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 border-white/10 text-okar-text-secondary hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg text-okar-text-primary max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-okar-text-primary flex items-center gap-3 text-lg font-semibold">
              <div className="w-8 h-8 rounded-lg bg-okar-pink-500/20 flex items-center justify-center">
                <QrCode className="h-4 w-4 text-okar-pink-400" />
              </div>
              Détails du QR Code
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted font-mono text-sm">
              {selectedQR?.code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedQR && (
            <div className="space-y-4 py-4">
              {/* Statut */}
              <div className="flex items-center justify-between p-3 bg-okar-dark-800/50 rounded-xl border border-white/5">
                <span className="text-okar-text-muted text-sm">Statut</span>
                <Badge className={statusConfig[selectedQR.status].className}>
                  {statusConfig[selectedQR.status].label}
                </Badge>
              </div>

              {/* Type */}
              <div className="flex items-center justify-between p-3 bg-okar-dark-800/50 rounded-xl border border-white/5">
                <span className="text-okar-text-muted text-sm">Type</span>
                <Badge className={selectedQR.type === 'garage' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }>
                  {selectedQR.type === 'garage' ? 'Garage' : 'Particulier'}
                </Badge>
              </div>

              {/* Lot ID */}
              <div className="flex items-center justify-between p-3 bg-okar-dark-800/50 rounded-xl border border-white/5">
                <span className="text-okar-text-muted text-sm">Lot</span>
                <span className="text-okar-text-primary font-mono font-medium">{selectedQR.lotId}</span>
              </div>

              {/* Garage assigné */}
              {selectedQR.assignedGarageName && (
                <div className="flex items-center justify-between p-3 bg-okar-dark-800/50 rounded-xl border border-white/5">
                  <span className="text-okar-text-muted text-sm">Garage</span>
                  <span className="text-okar-text-primary font-medium">{selectedQR.assignedGarageName}</span>
                </div>
              )}

              {/* Date création */}
              <div className="flex items-center justify-between p-3 bg-okar-dark-800/50 rounded-xl border border-white/5">
                <span className="text-okar-text-muted text-sm">Créé le</span>
                <span className="text-okar-text-primary">
                  {new Date(selectedQR.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>

              {/* Infos client (si activé) */}
              {selectedQR.status === 'active' && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <h4 className="text-sm font-semibold text-okar-text-primary mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-okar-pink-500/20 flex items-center justify-center">
                      <User className="h-3 w-3 text-okar-pink-400" />
                    </div>
                    Informations du client
                  </h4>
                  
                  <div className="space-y-2">
                    {selectedQR.activatedByName && (
                      <div className="flex items-center justify-between p-2.5 bg-okar-dark-800/30 rounded-lg">
                        <span className="text-okar-text-muted text-sm">Nom</span>
                        <span className="text-okar-text-primary font-medium">{selectedQR.activatedByName}</span>
                      </div>
                    )}
                    
                    {selectedQR.activatedByEmail && (
                      <div className="flex items-center justify-between p-2.5 bg-okar-dark-800/30 rounded-lg">
                        <span className="text-okar-text-muted text-sm flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                        </span>
                        <span className="text-okar-text-secondary text-sm">{selectedQR.activatedByEmail}</span>
                      </div>
                    )}
                    
                    {selectedQR.activatedByPhone && (
                      <div className="flex items-center justify-between p-2.5 bg-okar-dark-800/30 rounded-lg">
                        <span className="text-okar-text-muted text-sm flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                        </span>
                        <span className="text-okar-text-secondary text-sm">{selectedQR.activatedByPhone}</span>
                      </div>
                    )}

                    {selectedQR.vehiclePlateNumber && (
                      <div className="flex items-center justify-between p-2.5 bg-okar-dark-800/30 rounded-lg">
                        <span className="text-okar-text-muted text-sm">Véhicule</span>
                        <span className="text-okar-text-primary font-mono font-medium">{selectedQR.vehiclePlateNumber}</span>
                      </div>
                    )}

                    {selectedQR.activatedAt && (
                      <div className="flex items-center justify-between p-2.5 bg-okar-dark-800/30 rounded-lg">
                        <span className="text-okar-text-muted text-sm flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          Activé le
                        </span>
                        <span className="text-okar-text-secondary text-sm">
                          {new Date(selectedQR.activatedAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composant Table de QR codes
function QRCodeTable({
  qrCodes,
  isLoading,
  type,
  onCopy,
  copiedCode,
  onViewDetails,
  onExport,
  isExporting,
  onViewVehicle,
  onDeleteQR,
  getPublicUrl,
  copiedUrl,
  onCopyUrl,
}: {
  qrCodes: QRCodeItem[]
  isLoading: boolean
  type: 'garage' | 'particulier'
  onCopy: (code: string) => void
  copiedCode: string | null
  onViewDetails: (qr: QRCodeItem) => void
  onExport: (codeId: string) => Promise<void>
  isExporting: boolean
  onViewVehicle?: (vehicleId: string) => void
  onDeleteQR?: (qr: QRCodeItem) => void
  getPublicUrl: (code: string) => string
  copiedUrl: string | null
  onCopyUrl: (code: string) => void
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-okar-pink-500/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-okar-pink-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="text-okar-text-muted">Chargement...</span>
        </div>
      </div>
    )
  }

  if (qrCodes.length === 0) {
    return (
      <Card className="bg-okar-dark-card/50 backdrop-blur-md border-white/5 shadow-luxury rounded-2xl">
        <CardContent className="py-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <QrCode className="h-8 w-8 text-okar-text-muted opacity-50" />
            </div>
            <p className="text-okar-text-muted">Aucun QR code {type === 'garage' ? 'garage' : 'particulier'} trouvé</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-okar-dark-card/50 backdrop-blur-md border-white/5 shadow-luxury rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent bg-okar-dark-800/50">
                <TableHead className="text-okar-text-muted font-medium">Code</TableHead>
                <TableHead className="text-okar-text-muted font-medium">Lot</TableHead>
                <TableHead className="text-okar-text-muted font-medium">Statut</TableHead>
                {type === 'garage' && (
                  <TableHead className="text-okar-text-muted font-medium">Garage</TableHead>
                )}
                <TableHead className="text-okar-text-muted font-medium">Client / URL Publique</TableHead>
                <TableHead className="text-okar-text-muted font-medium">Date</TableHead>
                <TableHead className="text-okar-text-muted font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qr) => (
                <TableRow key={qr.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-okar-text-primary text-sm font-medium">{qr.code.substring(0, 12)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(qr.code)}
                        className="h-6 w-6 p-0 text-okar-text-muted hover:text-white hover:bg-white/5"
                      >
                        {copiedCode === qr.code ? (
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-okar-text-secondary font-mono text-sm">{qr.lotId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[qr.status].dot}`} />
                      <Badge className={statusConfig[qr.status].className}>
                        {statusConfig[qr.status].label}
                      </Badge>
                    </div>
                  </TableCell>
                  {type === 'garage' && (
                    <TableCell className="text-okar-text-secondary text-sm">
                      {qr.assignedGarageName || '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    {qr.status === 'active' ? (
                      <div className="space-y-2">
                        {qr.activatedByName && (
                          <p className="text-okar-text-primary text-sm font-medium">{qr.activatedByName}</p>
                        )}
                        {qr.vehiclePlateNumber && (
                          <p className="text-okar-text-muted text-xs font-mono">{qr.vehiclePlateNumber}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <p className="text-okar-text-muted text-xs truncate max-w-32 font-mono">{getPublicUrl(qr.code)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyUrl(qr.code)}
                            className="h-5 w-5 p-0 text-okar-text-muted hover:text-white hover:bg-white/5"
                          >
                            {copiedUrl === qr.code ? (
                              <CheckCircle className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <ExternalLink className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-okar-text-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-okar-text-muted text-sm">
                    {new Date(qr.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(qr)}
                        className="text-okar-text-muted hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {qr.vehicleId && onViewVehicle && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewVehicle(qr.vehicleId!)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                        >
                          Voir véhicule
                        </Button>
                      )}
                      {onDeleteQR && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteQR(qr)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default MyQRCodes
