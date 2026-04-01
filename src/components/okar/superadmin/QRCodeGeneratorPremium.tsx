/**
 * OKAR - QRCodeGeneratorPremium Component
 * 
 * Design "QRBag-inspired Dark Mode High-Contrast"
 * Fond: Bleu Nuit Très Profond (#0B0F19)
 * Cartes: Gris Bleuté Foncé (#151E32) avec bordures subtiles
 * Accents Vifs: Vert Émeraude (#10B981), Bleu Royal (#3B82F6), Orange Vif (#F97316), Rose Fuchsia (#EC4899)
 * 
 * Structure en gros blocs fonctionnels avec grille asymétrique
 * Boutons d'action géants (60px+) avec couleurs vives
 * Statistiques visuelles colorées (cartes vertes, bleues, orange)
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
  Shield,
  Zap,
  Eye,
  Copy,
  ExternalLink,
  CheckCircle2,
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

interface QRCodeGeneratorPremiumProps {
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

export function QRCodeGeneratorPremium({
  onGenerate,
  onAssign,
  onExportPDF,
  garages,
  recentLots,
  stockStats,
}: QRCodeGeneratorPremiumProps) {
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
  const availableLots = recentLots.filter(lot => lot.status === 'ready' && !lot.assignedTo)

  return (
    <div className="space-y-8">
      {/* ============ SECTION 1: EN-TÊTE SIMPLE ============ */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Génération de QR Codes
        </h1>
        <p className="text-[#64748B] text-lg">
          Créez des pass uniques pour garages ou particuliers.
        </p>
      </div>

      {/* ============ SECTION 2: ZONE DE TRAVAIL (GRILLE 2 COLONNES) ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE (70% / lg:col-span-2) - Configuration de Génération */}
        <Card className="lg:col-span-2 bg-[#151E32] border border-[#1E293B]/50 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#1E293B]/50 pb-6">
            <CardTitle className="text-white flex items-center gap-4 text-xl font-bold">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              Générer des QR Codes
            </CardTitle>
            <CardDescription className="text-[#64748B] text-base mt-2">
              Créez des QR codes uniques pour garages ou particuliers
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-8">
            {/* Sélecteur de Mode */}
            <div className="space-y-3">
              <Label className="text-[#94A3B8] text-sm font-semibold uppercase tracking-wide">Mode de génération</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGenerationMode('single')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                    generationMode === 'single'
                      ? 'bg-[#F97316]/10 border-[#F97316] text-[#F97316]'
                      : 'bg-[#0B0F19] border-[#1E293B] text-[#64748B] hover:border-[#334155]'
                  }`}
                >
                  <Hash className="h-5 w-5" />
                  <span className="font-semibold">Unitaire</span>
                </button>
                <button
                  onClick={() => setGenerationMode('lot')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                    generationMode === 'lot'
                      ? 'bg-[#F97316]/10 border-[#F97316] text-[#F97316]'
                      : 'bg-[#0B0F19] border-[#1E293B] text-[#64748B] hover:border-[#334155]'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span className="font-semibold">Par Lot</span>
                </button>
              </div>
            </div>

            {/* Sélecteur de Type */}
            <div className="space-y-3">
              <Label className="text-[#94A3B8] text-sm font-semibold uppercase tracking-wide">Type de QR Code</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setQrType('particulier')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                    qrType === 'particulier'
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]'
                      : 'bg-[#0B0F19] border-[#1E293B] text-[#64748B] hover:border-[#334155]'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-semibold">Particulier</span>
                </button>
                <button
                  onClick={() => setQrType('garage')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                    qrType === 'garage'
                      ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]'
                      : 'bg-[#0B0F19] border-[#1E293B] text-[#64748B] hover:border-[#334155]'
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold">Garage</span>
                </button>
              </div>
            </div>

            {/* Garage destinataire (si type garage) */}
            {qrType === 'garage' && (
              <div className="space-y-3">
                <Label className="text-[#94A3B8] text-sm font-semibold uppercase tracking-wide">Garage destinataire</Label>
                <Select value={selectedGarage} onValueChange={setSelectedGarage}>
                  <SelectTrigger className="bg-[#0B0F19] border-2 border-[#1E293B] text-white h-14 rounded-xl text-base focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]">
                    <SelectValue placeholder="Choisir un garage" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151E32] border-[#1E293B]">
                    {garages.map((garage) => (
                      <SelectItem key={garage.id} value={garage.id} className="text-white hover:bg-[#1E293B] focus:bg-[#1E293B]">
                        {garage.businessName} - {garage.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Nombre de QR codes (si mode lot) */}
            {generationMode === 'lot' && (
              <div className="space-y-3">
                <Label className="text-[#94A3B8] text-sm font-semibold uppercase tracking-wide">Nombre de QR codes</Label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                    min={1}
                    max={10000}
                    className="bg-[#0B0F19] border-2 border-[#1E293B] text-white h-14 rounded-xl text-lg font-semibold flex-1 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                  />
                  <div className="flex gap-2">
                    {[50, 100, 500].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="lg"
                        onClick={() => setCount(preset)}
                        className={`h-14 px-5 rounded-xl font-bold transition-all ${
                          count === preset
                            ? 'bg-[#F97316]/10 border-[#F97316] text-[#F97316]'
                            : 'border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B]'
                        }`}
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progression */}
            {isGenerating && (
              <div className="space-y-3 bg-[#0B0F19] rounded-xl p-4 border border-[#1E293B]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Génération en cours...</span>
                  <span className="text-[#10B981] font-bold text-lg">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-[#1E293B] [&>div]:bg-gradient-to-r [&>div]:from-[#10B981] [&>div]:to-[#059669]" />
              </div>
            )}

            {/* BOUTON D'ACTION GÉANT */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (qrType === 'garage' && !selectedGarage) || count < 1}
              className={`w-full h-16 rounded-xl font-bold text-lg shadow-xl transition-all duration-200 ${
                qrType === 'garage' 
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-[#10B981]/30 hover:shadow-[#10B981]/50'
                  : 'bg-gradient-to-r from-[#EC4899] to-[#DB2777] hover:from-[#DB2777] hover:to-[#BE185D] shadow-[#EC4899]/30 hover:shadow-[#EC4899]/50'
              } text-white disabled:opacity-50`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <QrCode className="h-6 w-6 mr-3" />
                  {generationMode === 'single' 
                    ? `Générer 1 QR Code ${qrType === 'garage' ? 'Garage' : 'Particulier'}`
                    : `Générer ${count} QR Codes ${qrType === 'garage' ? 'Garage' : 'Particulier'}`
                  }
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* COLONNE DROITE (30%) - Attribution Rapide */}
        <Card className="bg-gradient-to-b from-[#1E293B]/80 to-[#151E32] border-2 border-[#3B82F6]/30 shadow-2xl shadow-[#3B82F6]/10 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#3B82F6]/20 pb-6">
            <CardTitle className="text-white flex items-center gap-4 text-xl font-bold">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              Attribution Rapide
            </CardTitle>
            <CardDescription className="text-[#64748B] text-base mt-2">
              Assignez un lot à un garage
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 pt-6">
            {/* Sélection du lot */}
            <div className="space-y-3">
              <Label className="text-[#94A3B8] text-sm font-semibold uppercase tracking-wide">Sélectionner un lot</Label>
              <Select value={selectedLot} onValueChange={setSelectedLot}>
                <SelectTrigger className="bg-[#0B0F19] border-2 border-[#1E293B] text-white h-12 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]">
                  <SelectValue placeholder="Lot disponible" />
                </SelectTrigger>
                <SelectContent className="bg-[#151E32] border-[#1E293B]">
                  {availableLots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.lotId} className="text-white hover:bg-[#1E293B] focus:bg-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{lot.lotId}</span>
                        <Badge className={
                          lot.type === 'garage' 
                            ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
                            : 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30'
                        }>
                          {lot.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Garage destinataire */}
            <div className="space-y-3">
              <Label className="text-[#94A3B8] text-sm font-semibold uppercase tracking-wide">Garage destinataire</Label>
              <Select value={selectedGarage} onValueChange={setSelectedGarage}>
                <SelectTrigger className="bg-[#0B0F19] border-2 border-[#1E293B] text-white h-12 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]">
                  <SelectValue placeholder="Choisir un garage" />
                </SelectTrigger>
                <SelectContent className="bg-[#151E32] border-[#1E293B]">
                  {garages.map((garage) => (
                    <SelectItem key={garage.id} value={garage.id} className="text-white hover:bg-[#1E293B] focus:bg-[#1E293B]">
                      {garage.businessName} - {garage.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Récapitulatif */}
            {selectedLot && (
              <div className="bg-[#0B0F19] rounded-xl p-4 border border-[#1E293B]">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-[#10B981]" />
                  <span className="text-[#94A3B8] text-sm">Lot sélectionné</span>
                </div>
                <p className="text-white font-mono font-semibold">{selectedLot}</p>
              </div>
            )}

            {/* BOUTON D'ACTION GÉANT */}
            <Button
              onClick={handleAssign}
              disabled={isAssigning || !selectedLot || !selectedGarage}
              className="w-full h-16 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl font-bold text-lg shadow-xl shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 transition-all duration-200 disabled:opacity-50"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Attribution...
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Attribuer le lot
                </>
              )}
            </Button>

            {/* Stats rapides */}
            <div className="pt-4 border-t border-[#1E293B]">
              <p className="text-[#64748B] text-xs uppercase tracking-wide mb-3">Lots disponibles</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-[#3B82F6]">{availableLots.length}</span>
                <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                  En attente
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ SECTION 3: STATISTIQUES VISUELLES COLORÉES ============ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte Verte - QR à générer */}
        <Card className="bg-gradient-to-br from-[#10B981] to-[#059669] border-0 shadow-2xl shadow-[#10B981]/30 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold uppercase tracking-wide">QR à générer</p>
                <p className="text-5xl font-bold text-white mt-2 font-mono">{stockStats.inStock.toLocaleString()}</p>
                <p className="text-white/70 text-sm mt-2">En stock disponible</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full" style={{ width: '75%' }} />
              </div>
              <span className="text-white/80 text-sm font-semibold">75%</span>
            </div>
          </CardContent>
        </Card>

        {/* Carte Bleue - Garages Actifs */}
        <Card className="bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] border-0 shadow-2xl shadow-[#3B82F6]/30 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold uppercase tracking-wide">Agences Actives</p>
                <p className="text-5xl font-bold text-white mt-2 font-mono">{garages.length}</p>
                <p className="text-white/70 text-sm mt-2">Garages partenaires</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-white/60" />
              <span className="text-white/80 text-sm">Opérationnels</span>
            </div>
          </CardContent>
        </Card>

        {/* Carte Orange - Anti-Fraud */}
        <Card className="bg-gradient-to-br from-[#F97316] to-[#EA580C] border-0 shadow-2xl shadow-[#F97316]/30 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold uppercase tracking-wide">Anti-Fraud</p>
                <p className="text-5xl font-bold text-white mt-2 font-mono">{stockStats.active.toLocaleString()}</p>
                <p className="text-white/70 text-sm mt-2">Codes uniques actifs</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white/60" />
              <span className="text-white/80 text-sm">Sécurisés</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ SECTION 4: LOTS RÉCENTS ============ */}
      <Card className="bg-[#151E32] border border-[#1E293B]/50 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-[#1E293B]/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl font-bold">Lots récents</CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                {garageLots.length} Garages
              </Badge>
              <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                {particulierLots.length} Particuliers
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList className="bg-[#0B0F19] border border-[#1E293B] mb-6 p-1 rounded-xl">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#EC4899]/20 data-[state=active]:text-[#EC4899] text-[#64748B] rounded-lg px-4">
                Tous ({recentLots.length})
              </TabsTrigger>
              <TabsTrigger value="garage" className="data-[state=active]:bg-[#10B981]/20 data-[state=active]:text-[#10B981] text-[#64748B] rounded-lg px-4">
                <Building2 className="h-4 w-4 mr-2" />
                Garages
              </TabsTrigger>
              <TabsTrigger value="particulier" className="data-[state=active]:bg-[#3B82F6]/20 data-[state=active]:text-[#3B82F6] text-[#64748B] rounded-lg px-4">
                <User className="h-4 w-4 mr-2" />
                Particuliers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <LotsGrid lots={recentLots} onExport={handleExport} isExporting={isExporting} />
            </TabsContent>
            <TabsContent value="garage">
              <LotsGrid lots={garageLots} onExport={handleExport} isExporting={isExporting} />
            </TabsContent>
            <TabsContent value="particulier">
              <LotsGrid lots={particulierLots} onExport={handleExport} isExporting={isExporting} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de succès */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-[#151E32] border border-[#1E293B] shadow-2xl shadow-black/40 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-4 text-xl font-bold">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              Lot généré avec succès!
            </DialogTitle>
            <DialogDescription className="text-[#64748B] text-base pt-3">
              {generatedLot?.count} QR codes {generatedLot?.type === 'garage' ? 'Garage' : 'Particulier'} ont été générés
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-5">
            <div className="bg-[#0B0F19] rounded-xl p-5 border border-[#1E293B]">
              <p className="text-[#64748B] text-sm mb-2">ID du lot</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-xl font-bold">{generatedLot?.lotId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLot?.lotId || '')
                  }}
                  className="text-[#64748B] hover:text-white hover:bg-[#1E293B] h-9 w-9 rounded-lg"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => generatedLot && handleExport(generatedLot.lotId)}
                className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] h-12 rounded-xl font-semibold shadow-lg shadow-[#3B82F6]/20"
              >
                <FileText className="h-5 w-5 mr-2" />
                Exporter PDF
              </Button>
              <Button
                onClick={() => setShowSuccessDialog(false)}
                variant="outline"
                className="flex-1 border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] h-12 rounded-xl"
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

// Composant pour afficher la grille des lots
function LotsGrid({ 
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
      <div className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E293B] flex items-center justify-center">
            <Package className="h-8 w-8 text-[#64748B]" />
          </div>
          <p className="text-[#64748B] text-lg">Aucun lot dans cette catégorie</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lots.map((lot) => (
        <div
          key={lot.id}
          className="bg-[#0B0F19] rounded-xl p-5 border border-[#1E293B] hover:border-[#334155] transition-all duration-200 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              lot.type === 'garage' 
                ? 'bg-[#10B981]/10' 
                : 'bg-[#3B82F6]/10'
            }`}>
              {lot.type === 'garage' ? (
                <Building2 className="h-6 w-6 text-[#10B981]" />
              ) : (
                <User className="h-6 w-6 text-[#3B82F6]" />
              )}
            </div>
            {lot.assignedTo ? (
              <Badge className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                Attribué
              </Badge>
            ) : (
              <Badge className="bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30">
                En stock
              </Badge>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-white font-mono font-semibold text-lg">{lot.lotId}</p>
            <p className="text-[#64748B] text-sm mt-1">
              {lot.count} codes • {lot.type === 'garage' ? 'Garage' : 'Particulier'}
            </p>
            <p className="text-[#64748B] text-xs mt-1">
              {new Date(lot.createdAt).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(lot.lotId)}
              disabled={isExporting}
              className="flex-1 border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] h-10 rounded-lg group-hover:border-[#3B82F6]/50"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] h-10 rounded-lg group-hover:border-[#3B82F6]/50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default QRCodeGeneratorPremium
