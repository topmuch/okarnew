/**
 * OKAR - Smart Oil Wizard Component
 * Assistant Vidange Intelligent Universel
 * 
 * S'adapte automatiquement à tous les types de véhicules:
 * - Poids Lourds / Camions / Bus
 * - Utilitaires / Vans
 * - Voitures Neuves (sous garantie)
 * - Véhicules Anciens / Standard
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Truck,
  Car,
  Bus,
  Wrench,
  Droplets,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  ChevronRight,
  MessageCircle,
  Thermometer,
  Calendar,
  Gauge,
  Package,
  AlertCircle,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  classifyVehicle,
  getClassificationSummary,
  VehicleCategory,
  VehicleCategoryInfo,
  CATEGORY_CONFIG,
  VehicleData,
} from '@/lib/vehicleClassifier'
import {
  getRecommendationsForCategory,
  getAvailableOils,
  estimateOilChangePrice,
  generateWhatsAppMessage,
  OilProduct,
  FilterProduct,
  CategoryRecommendations,
} from '@/lib/oilRulesDB'

// =============================================================================
// TYPES
// =============================================================================

interface SmartOilWizardProps {
  vehicle: VehicleData
  onValidate: (data: OilChangeData) => void
  onCancel: () => void
}

export interface OilChangeData {
  category: VehicleCategory
  categoryInfo: VehicleCategoryInfo
  selectedOil: OilProduct
  quantity: number
  selectedFilters: string[]
  additionalChecks: string[]
  estimatedPrice: number
  notes: string
}

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================

export function SmartOilWizard({ vehicle, onValidate, onCancel }: SmartOilWizardProps) {
  // États
  const [step, setStep] = useState<'detection' | 'selection' | 'validation'>('detection')
  const [selectedOilId, setSelectedOilId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(0)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [additionalChecks, setSelectedAdditionalChecks] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  // Classification automatique du véhicule
  const classification = useMemo(() => {
    return getClassificationSummary(vehicle)
  }, [vehicle])

  // Recommandations basées sur la catégorie
  const recommendations = useMemo(() => {
    return getRecommendationsForCategory(classification.category.category)
  }, [classification])

  // Huiles disponibles pour cette catégorie
  const availableOils = useMemo(() => {
    return getAvailableOils(classification.category.category)
  }, [classification])

  // Initialiser les valeurs par défaut
  useEffect(() => {
    // Huile recommandée
    if (recommendations.oil.primary.length > 0) {
      requestAnimationFrame(() => setSelectedOilId(recommendations.oil.primary[0].id))
    }

    // Quantité recommandée
    requestAnimationFrame(() => setQuantity(recommendations.oil.estimatedQuantity.recommended))

    // Filtres obligatoires
    const mandatoryFilterIds = recommendations.filters.mandatoryFilters.map(f => f.id)
    requestAnimationFrame(() => setSelectedFilters(mandatoryFilterIds))

    // Checks additionnels
    requestAnimationFrame(() => setSelectedAdditionalChecks([]))
  }, [recommendations])

  // Huile sélectionnée
  const selectedOil = useMemo(() => {
    return availableOils.find(o => o.id === selectedOilId) || availableOils[0]
  }, [selectedOilId, availableOils])

  // Calcul du prix
  const priceEstimate = useMemo(() => {
    if (!selectedOil) return { oilPrice: 0, filtersPrice: 0, total: 0 }
    return estimateOilChangePrice(
      classification.category.category,
      quantity,
      selectedFilters
    )
  }, [classification.category.category, selectedOil, quantity, selectedFilters])

  // Filtres sélectionnés (objets complets)
  const selectedFilterObjects = useMemo(() => {
    return recommendations.filters.filters.filter(f => selectedFilters.includes(f.id))
  }, [recommendations.filters.filters, selectedFilters])

  // Toggle filtre
  const toggleFilter = (filterId: string, mandatory: boolean) => {
    if (mandatory) return // Ne pas décocher les filtres obligatoires

    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  // Toggle check additionnel
  const toggleAdditionalCheck = (check: string) => {
    setSelectedAdditionalChecks(prev =>
      prev.includes(check)
        ? prev.filter(c => c !== check)
        : [...prev, check]
    )
  }

  // Validation finale
  const handleValidate = () => {
    // Vérifier les avertissements pour les véhicules neufs
    if (classification.category.category === 'C') {
      const hasApprovedOil = selectedOil?.isManufacturerApproved
      if (!hasApprovedOil) {
        setWarningMessage('⚠️ ATTENTION: L\'huile sélectionnée n\'est pas homologuée constructeur. Cela peut voider la garantie. Voulez-vous continuer ?')
        setShowWarning(true)
        return
      }
    }

    // Vérifier la quantité
    const { min, max } = recommendations.oil.estimatedQuantity
    if (quantity < min || quantity > max) {
      setWarningMessage(`⚠️ Quantité inhabituelle pour ce type de véhicule (recommandé: ${min}-${max}L). Confirmer ?`)
      setShowWarning(true)
      return
    }

    submitData()
  }

  const submitData = () => {
    if (!selectedOil) return

    onValidate({
      category: classification.category.category,
      categoryInfo: classification.category,
      selectedOil,
      quantity,
      selectedFilters,
      additionalChecks,
      estimatedPrice: priceEstimate.total,
      notes,
    })
  }

  // Envoyer WhatsApp
  const sendWhatsApp = () => {
    const message = generateWhatsAppMessage(
      classification.category.category,
      {
        plateNumber: vehicle.plateNumber || 'N/A',
        brand: vehicle.brand || 'Véhicule',
        model: vehicle.model || '',
      },
      {
        quantity,
        oilType: selectedOil?.viscosity || '10W-40',
        filters: selectedFilterObjects.map(f => f.name),
      }
    )

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  // Icône selon catégorie
  const CategoryIcon = () => {
    switch (classification.category.category) {
      case 'A':
        return <Truck className="h-8 w-8 text-orange-400" />
      case 'B':
        return <Bus className="h-8 w-8 text-violet-400" />
      case 'C':
        return <Car className="h-8 w-8 text-emerald-400" />
      case 'D':
      default:
        return <Car className="h-8 w-8 text-gray-400" />
    }
  }

  // ==========================================================================
  // ÉTAPE 1: DÉTECTION AUTOMATIQUE
  // ==========================================================================
  if (step === 'detection') {
    return (
      <div className="space-y-6">
        {/* En-tête classification */}
        <Card className={cn(
          "border-2",
          classification.category.category === 'A' && "border-orange-500/50 bg-orange-500/5",
          classification.category.category === 'B' && "border-violet-500/50 bg-violet-500/5",
          classification.category.category === 'C' && "border-emerald-500/50 bg-emerald-500/5",
          classification.category.category === 'D' && "border-gray-500/50 bg-gray-500/5"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center",
                classification.category.bgClass
              )}>
                <span className="text-3xl">{classification.category.icon}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {recommendations.title}
                  </h2>
                  <Badge className={cn(
                    "text-xs",
                    classification.category.category === 'A' && "bg-orange-500/20 text-orange-300",
                    classification.category.category === 'B' && "bg-violet-500/20 text-violet-300",
                    classification.category.category === 'C' && "bg-emerald-500/20 text-emerald-300",
                    classification.category.category === 'D' && "bg-gray-500/20 text-gray-300"
                  )}>
                    {classification.category.shortLabel}
                  </Badge>
                </div>
                <p className="text-[#94A3B8]">{recommendations.subtitle}</p>

                {/* Infos véhicule */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-[#94A3B8]">
                    <Car className="h-4 w-4" />
                    {vehicle.brand} {vehicle.model}
                  </span>
                  {vehicle.year && (
                    <span className="flex items-center gap-1 text-[#94A3B8]">
                      <Calendar className="h-4 w-4" />
                      {vehicle.year}
                    </span>
                  )}
                  {vehicle.mileage && (
                    <span className="flex items-center gap-1 text-[#94A3B8]">
                      <Gauge className="h-4 w-4" />
                      {vehicle.mileage.toLocaleString()} km
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contexte climatique */}
            <div className="mt-4 p-3 bg-[#1E293B] rounded-lg flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Climat: {classification.climateContext.climate}</p>
                <p className="text-xs text-[#64748B]">{classification.climateContext.recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertes spécifiques */}
        {classification.category.category === 'C' && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-300">Garantie Constructeur</p>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    Ce véhicule est encore sous garantie. L'utilisation d'une huile non homologuée 
                    peut voider la garantie. Vérifiez le manuel du constructeur.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conseils rapides */}
        <Card className="bg-[#1E293B] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-[#64748B]" />
              Points d'attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {classification.quickTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                  <AlertCircle className="h-4 w-4 text-[#64748B] mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button
          onClick={() => setStep('selection')}
          className="w-full bg-gradient-to-r from-[#ff6201] to-[#ff8a01] hover:from-[#ff6201]/90 hover:to-[#ff8a01]/90"
        >
          Continuer vers la sélection
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )
  }

  // ==========================================================================
  // ÉTAPE 2: SÉLECTION HUILE & FILTRES
  // ==========================================================================
  if (step === 'selection') {
    return (
      <div className="space-y-6">
        {/* Sélection Huile */}
        <Card className="bg-[#1E293B] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              Huile Moteur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection */}
            <Select value={selectedOilId || ''} onValueChange={setSelectedOilId}>
              <SelectTrigger className="bg-[#0F172A] border-white/10 text-white">
                <SelectValue placeholder="Sélectionner une huile" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-white/10">
                {availableOils.map(oil => (
                  <SelectItem 
                    key={oil.id} 
                    value={oil.id}
                    className="text-white hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span>{oil.viscosity}</span>
                      {oil.badge && (
                        <Badge className="text-xs bg-blue-500/20 text-blue-300">
                          {oil.badge}
                        </Badge>
                      )}
                      {oil.recommended && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-300">
                          Recommandé
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Détails huile sélectionnée */}
            {selectedOil && (
              <div className="p-3 bg-[#0F172A] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{selectedOil.name}</span>
                  <Badge className={cn(
                    selectedOil.type === 'synthese' && "bg-purple-500/20 text-purple-300",
                    selectedOil.type === 'semi-synthese' && "bg-blue-500/20 text-blue-300",
                    selectedOil.type === 'mineral' && "bg-gray-500/20 text-gray-300"
                  )}>
                    {selectedOil.type === 'synthese' ? 'Synthèse' : 
                     selectedOil.type === 'semi-synthese' ? 'Semi-Synthèse' : 'Minéral'}
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B]">{selectedOil.spec}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">{selectedOil.capacity}</span>
                  <span className="text-amber-300 font-medium">{selectedOil.price.toLocaleString()} FCFA</span>
                </div>
                {selectedOil.isManufacturerApproved && (
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    <Shield className="h-3 w-3" />
                    Homologué constructeur
                  </div>
                )}
              </div>
            )}

            {/* Quantité */}
            <div className="space-y-2">
              <Label className="text-[#94A3B8] text-sm">Quantité (Litres)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="bg-[#0F172A] border-white/10 text-white w-24"
                  min={recommendations.oil.estimatedQuantity.min}
                  max={recommendations.oil.estimatedQuantity.max}
                />
                <span className="text-[#64748B] text-sm">
                  Recommandé: {recommendations.oil.estimatedQuantity.min}-{recommendations.oil.estimatedQuantity.max}L
                </span>
              </div>
            </div>

            {/* Notes huile */}
            {recommendations.oil.notes.length > 0 && (
              <div className="space-y-1">
                {recommendations.oil.notes.map((note, i) => (
                  <p key={i} className="text-xs text-[#64748B] flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    {note}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sélection Filtres */}
        <Card className="bg-[#1E293B] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-violet-400" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.filters.filters.map((filter) => {
              const isMandatory = recommendations.filters.mandatoryFilters.some(f => f.id === filter.id)
              const isSelected = selectedFilters.includes(filter.id)

              return (
                <div
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id, isMandatory)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    isSelected
                      ? "bg-violet-500/10 border-violet-500/30"
                      : "bg-[#0F172A] border-white/5",
                    isMandatory ? "cursor-default" : "cursor-pointer hover:border-white/20"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isMandatory}
                    className="data-[state=checked]:bg-violet-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{filter.name}</span>
                      {filter.critical && (
                        <Badge className="text-xs bg-red-500/20 text-red-300">
                          Critique
                        </Badge>
                      )}
                      {isMandatory && (
                        <Badge className="text-xs bg-violet-500/20 text-violet-300">
                          Obligatoire
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {filter.frequency} • {filter.price.toLocaleString()} FCFA
                    </p>
                    {filter.note && (
                      <p className="text-xs text-amber-300 mt-1">{filter.note}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Checks additionnels */}
        <Card className="bg-[#1E293B] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-emerald-400" />
              Vérifications Supplémentaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.additionalChecks.map((check, i) => {
              const isSelected = additionalChecks.includes(check)
              return (
                <div
                  key={i}
                  onClick={() => toggleAdditionalCheck(check)}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
                >
                  <Checkbox
                    checked={isSelected}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                  <span className="text-sm text-[#94A3B8]">{check}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Récapitulatif prix */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#94A3B8]">Huile ({quantity}L)</span>
              <span className="text-white">{priceEstimate.oilPrice.toLocaleString()} FCFA</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#94A3B8]">Filtres ({selectedFilters.length})</span>
              <span className="text-white">{priceEstimate.filtersPrice.toLocaleString()} FCFA</span>
            </div>
            <Separator className="my-2 bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total estimé</span>
              <span className="text-xl font-bold text-amber-300">{priceEstimate.total.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-[#94A3B8] text-sm">Notes (optionnel)</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations, particularités..."
            className="bg-[#1E293B] border-white/10 text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('detection')}
            className="flex-1 border-white/10 text-[#94A3B8]"
          >
            Retour
          </Button>
          <Button
            onClick={handleValidate}
            disabled={!selectedOil || quantity <= 0}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Valider la vidange
          </Button>
        </div>

        {/* Dialogue d'avertissement */}
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent className="bg-[#1E293B] border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="h-5 w-5" />
                Attention
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#94A3B8]">
                {warningMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setShowWarning(false)}
                className="bg-white/10 text-white hover:bg-white/20"
              >
                Annuler
              </AlertDialogAction>
              <AlertDialogAction
                onClick={submitData}
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                Confirmer quand même
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return null
}

export default SmartOilWizard
