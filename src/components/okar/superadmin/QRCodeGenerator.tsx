/**
 * OKAR - QRCodeGenerator Component
 * 
 * Design "Dark Luxury" avec effets glassmorphism
 * Générateur de QR codes avec choix du type (Garage/Particulier)
 * Génération unitaire ou par lot avec assignation à un garage
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  QrCode,
  Plus,
  Download,
  Loader2,
  CheckCircle,
  FileText,
  Package,
  Building2,
  User,
  Hash,
  Users,
  Sparkles,
} from 'lucide-react'

// Types
export interface QRCodeLot {
  id: string
  lotId: string
  count: number
  type: 'garage' | 'particulier'
  status: 'generating' | 'ready' | 'assigned'
  createdAt: string
  assignedTo?: string
  codes: string[]
}

export interface Garage {
  id: string
  businessName: string
  city: string
}

interface QRCodeGeneratorProps {
  onGenerate: (count: number, type: 'garage' | 'particulier', garageId?: string) => Promise<QRCodeLot>
  onAssign: (lotId: string, garageId: string) => Promise<void>
  onExportPDF: (lotId: string) => Promise<void>
  garages: Garage[]
  recentLots: QRCodeLot[]
  stockStats: {
    total: number
    inStock: number
    active: number
    lost: number
  }
}

export function QRCodeGenerator({
  onGenerate,
  onAssign,
  onExportPDF,
  garages,
  recentLots,
  stockStats,
}: QRCodeGeneratorProps) {
  const [count, setCount] = useState(100)
  const [qrType, setQrType] = useState<'garage' | 'particulier'>('particulier')
  const [selectedGarage, setSelectedGarage] = useState('')
  const [selectedLot, setSelectedLot] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [generatedLot, setGeneratedLot] = useState<QRCodeLot | null>(null)
  const [generationMode, setGenerationMode] = useState<'single' | 'lot'>('lot')

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simuler la progression
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    try {
      const finalCount = generationMode === 'single' ? 1 : count
      const lot = await onGenerate(finalCount, qrType, qrType === 'garage' ? selectedGarage : undefined)
      setProgress(100)
      setGeneratedLot(lot)
      setShowSuccessDialog(true)
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
    } finally {
      clearInterval(interval)
      setIsGenerating(false)
    }
  }

  const handleExport = async (lotId: string) => {
    setIsExporting(true)
    try {
      await onExportPDF(lotId)
    } finally {
      setIsExporting(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedLot || !selectedGarage) return
    setIsAssigning(true)
    try {
      await onAssign(selectedLot, selectedGarage)
      setSelectedLot('')
      setSelectedGarage('')
    } finally {
      setIsAssigning(false)
    }
  }

  // Stats par type
  const garageLots = recentLots.filter(l => l.type === 'garage')
  const particulierLots = recentLots.filter(l => l.type === 'particulier')

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">Total généré</span>
            <div className="w-8 h-8 rounded-lg bg-okar-pink-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-okar-pink-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-okar-text-primary mt-3">{stockStats.total.toLocaleString()}</p>
        </div>
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">En stock</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <QrCode className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-3">{stockStats.inStock.toLocaleString()}</p>
        </div>
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3">{stockStats.active.toLocaleString()}</p>
        </div>
        <div className="bg-okar-dark-card/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-luxury">
          <div className="flex items-center justify-between">
            <span className="text-okar-text-muted text-sm font-medium">Perdus</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <QrCode className="h-4 w-4 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-3">{stockStats.lost}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Générateur */}
        <Card className="bg-okar-dark-card/50 backdrop-blur-md border-white/5 shadow-luxury rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-okar-text-primary flex items-center gap-3 text-lg font-semibold">
              <div className="w-8 h-8 rounded-lg bg-okar-pink-500/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-okar-pink-400" />
              </div>
              Générer des QR Codes
            </CardTitle>
            <CardDescription className="text-okar-text-muted">
              Créez des QR codes uniques pour garages ou particuliers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {/* Mode de génération */}
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm font-medium">Mode de génération</Label>
              <Tabs value={generationMode} onValueChange={(v) => setGenerationMode(v as 'single' | 'lot')}>
                <TabsList className="bg-okar-dark-800/50 border border-white/5 w-full p-1 rounded-xl">
                  <TabsTrigger value="single" className="flex-1 data-[state=active]:bg-okar-pink-500/20 data-[state=active]:text-okar-pink-400 text-okar-text-muted rounded-lg">
                    <Hash className="h-4 w-4 mr-2" />
                    Unitaire
                  </TabsTrigger>
                  <TabsTrigger value="lot" className="flex-1 data-[state=active]:bg-okar-pink-500/20 data-[state=active]:text-okar-pink-400 text-okar-text-muted rounded-lg">
                    <Package className="h-4 w-4 mr-2" />
                    Par lot
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Type de QR Code */}
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm font-medium">Type de QR Code</Label>
              <Tabs value={qrType} onValueChange={(v) => setQrType(v as 'garage' | 'particulier')}>
                <TabsList className="bg-okar-dark-800/50 border border-white/5 w-full p-1 rounded-xl">
                  <TabsTrigger value="particulier" className="flex-1 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-okar-text-muted rounded-lg">
                    <User className="h-4 w-4 mr-2" />
                    Particulier
                  </TabsTrigger>
                  <TabsTrigger value="garage" className="flex-1 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-okar-text-muted rounded-lg">
                    <Building2 className="h-4 w-4 mr-2" />
                    Garage
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Garage destinataire (si type garage) */}
            {qrType === 'garage' && (
              <div className="space-y-2">
                <Label className="text-okar-text-secondary text-sm font-medium">Garage destinataire</Label>
                <Select value={selectedGarage} onValueChange={setSelectedGarage}>
                  <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary h-11 rounded-xl">
                    <SelectValue placeholder="Choisir un garage" />
                  </SelectTrigger>
                  <SelectContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10">
                    {garages.map((garage) => (
                      <SelectItem key={garage.id} value={garage.id} className="text-okar-text-primary hover:bg-white/5">
                        {garage.businessName} - {garage.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Nombre de QR codes (si mode lot) */}
            {generationMode === 'lot' && (
              <div className="space-y-2">
                <Label className="text-okar-text-secondary text-sm font-medium">Nombre de QR codes</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                    min={1}
                    max={10000}
                    className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary h-11 rounded-xl"
                  />
                  <div className="flex gap-1">
                    {[50, 100, 500].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setCount(preset)}
                        className="border-white/10 text-okar-text-muted hover:text-white hover:bg-white/5 h-11 rounded-xl"
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-okar-text-muted">Génération en cours...</span>
                  <span className="text-okar-text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-okar-dark-800/50 [&>div]:bg-gradient-to-r [&>div]:from-okar-pink-500 [&>div]:to-okar-pink-600" />
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (qrType === 'garage' && !selectedGarage) || count < 1}
              className={`w-full h-12 rounded-xl font-semibold shadow-lg ${
                qrType === 'garage' 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-okar-pink-600 to-okar-pink-700 hover:from-okar-pink-700 hover:to-okar-pink-800 shadow-okar-pink/20'
              } text-white`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  {generationMode === 'single' 
                    ? `Générer 1 QR Code ${qrType === 'garage' ? 'Garage' : 'Particulier'}`
                    : `Générer ${count} QR Codes ${qrType === 'garage' ? 'Garage' : 'Particulier'}`
                  }
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Attribution */}
        <Card className="bg-okar-dark-card/50 backdrop-blur-md border-white/5 shadow-luxury rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-okar-text-primary flex items-center gap-3 text-lg font-semibold">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              Attribuer à un garage
            </CardTitle>
            <CardDescription className="text-okar-text-muted">
              Assignez un lot existant à un garage partenaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm font-medium">Sélectionner un lot</Label>
              <Select value={selectedLot} onValueChange={setSelectedLot}>
                <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary h-11 rounded-xl">
                  <SelectValue placeholder="Choisir un lot disponible" />
                </SelectTrigger>
                <SelectContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10">
                  {recentLots
                    .filter(lot => lot.status === 'ready' && !lot.assignedTo)
                    .map((lot) => (
                      <SelectItem key={lot.id} value={lot.lotId} className="text-okar-text-primary hover:bg-white/5">
                        <div className="flex items-center gap-2">
                          <span>{lot.lotId}</span>
                          <Badge className={
                            lot.type === 'garage' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }>
                            {lot.type}
                          </Badge>
                          <span className="text-okar-text-muted">({lot.count} codes)</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm font-medium">Garage destinataire</Label>
              <Select value={selectedGarage} onValueChange={setSelectedGarage}>
                <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary h-11 rounded-xl">
                  <SelectValue placeholder="Choisir un garage" />
                </SelectTrigger>
                <SelectContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10">
                  {garages.map((garage) => (
                    <SelectItem key={garage.id} value={garage.id} className="text-okar-text-primary hover:bg-white/5">
                      {garage.businessName} - {garage.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAssign}
              disabled={isAssigning || !selectedLot || !selectedGarage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-semibold shadow-lg shadow-blue-600/20"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Attribution...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Attribuer le lot
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lots récents par type */}
      <Card className="bg-okar-dark-card/50 backdrop-blur-md border-white/5 shadow-luxury rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-okar-text-primary text-lg font-semibold">Lots récents</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList className="bg-okar-dark-800/50 border border-white/5 mb-4 p-1 rounded-xl">
              <TabsTrigger value="all" className="data-[state=active]:bg-okar-pink-500/20 data-[state=active]:text-okar-pink-400 text-okar-text-muted rounded-lg">
                Tous ({recentLots.length})
              </TabsTrigger>
              <TabsTrigger value="garage" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-okar-text-muted rounded-lg">
                <Building2 className="h-4 w-4 mr-1" />
                Garages ({garageLots.length})
              </TabsTrigger>
              <TabsTrigger value="particulier" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-okar-text-muted rounded-lg">
                <User className="h-4 w-4 mr-1" />
                Particuliers ({particulierLots.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <LotsList lots={recentLots} onExport={handleExport} isExporting={isExporting} />
            </TabsContent>
            <TabsContent value="garage">
              <LotsList lots={garageLots} onExport={handleExport} isExporting={isExporting} />
            </TabsContent>
            <TabsContent value="particulier">
              <LotsList lots={particulierLots} onExport={handleExport} isExporting={isExporting} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de succès */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg text-okar-text-primary max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-okar-text-primary flex items-center gap-3 text-lg font-semibold">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              Lot généré avec succès!
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted pt-2">
              {generatedLot?.count} QR codes {generatedLot?.type === 'garage' ? 'Garage' : 'Particulier'} ont été générés
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-okar-dark-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-okar-text-muted text-sm mb-1">ID du lot</p>
              <p className="text-okar-text-primary font-mono text-lg font-medium">{generatedLot?.lotId}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => generatedLot && handleExport(generatedLot.lotId)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-semibold shadow-lg shadow-blue-600/20"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
              <Button
                onClick={() => setShowSuccessDialog(false)}
                variant="outline"
                className="flex-1 border-white/10 text-okar-text-secondary hover:text-white hover:bg-white/5 h-11 rounded-xl"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composant pour afficher la liste des lots
function LotsList({ 
  lots, 
  onExport, 
  isExporting 
}: { 
  lots: QRCodeLot[]
  onExport: (lotId: string) => Promise<void>
  isExporting: boolean
}) {
  if (lots.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <Package className="h-6 w-6 text-okar-text-muted opacity-50" />
          </div>
          <p className="text-okar-text-muted">Aucun lot dans cette catégorie</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {lots.map((lot) => (
        <div
          key={lot.id}
          className="flex items-center justify-between p-4 bg-okar-dark-800/30 rounded-xl border border-white/5 hover:bg-okar-dark-800/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              lot.type === 'garage' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
            }`}>
              {lot.type === 'garage' ? (
                <Building2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <User className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div>
              <p className="text-okar-text-primary font-semibold">{lot.lotId}</p>
              <p className="text-okar-text-muted text-sm">
                {lot.count} codes • {lot.type === 'garage' ? 'Garage' : 'Particulier'} • {new Date(lot.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lot.assignedTo ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Attribué
              </Badge>
            ) : (
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                En stock
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(lot.lotId)}
              disabled={isExporting}
              className="border-white/10 text-okar-text-muted hover:text-white hover:bg-white/5 h-9 w-9 rounded-lg"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default QRCodeGenerator
