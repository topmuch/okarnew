/**
 * OKAR - Insurance Comparator Component
 * Comparateur d'assurances auto avec estimation et redirection WhatsApp
 * 
 * Design: Cartes avec logos, badges, avantages, et CTA
 * Fonctionnalités: Estimation dynamique, sélection couverture, tracking leads
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Shield,
  Star,
  Check,
  ExternalLink,
  MessageCircle,
  Phone,
  Info,
  TrendingUp,
  Clock,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  COVERAGE_OPTIONS,
  type CoverageType,
  type InsuranceEstimate,
  type VehicleData,
  calculateAllEstimates,
  generateWhatsAppMessage,
  getWhatsAppUrl,
} from '@/lib/insuranceCalculator'

// =============================================================================
// TYPES
// =============================================================================

interface InsuranceProvider {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  coverages: string[]
  basePriceTier: number
  advantages: string[]
  whatsappNumber: string | null
  phoneNumber: string | null
  websiteUrl: string | null
  isActive: boolean
  isRecommended: boolean
  priority: number
  clickCount: number
}

interface ProviderWithEstimate extends InsuranceProvider {
  estimate: InsuranceEstimate
  priceRange: string
}

interface InsuranceComparatorProps {
  vehicle: VehicleData & { id?: string; plateNumber?: string }
  userName?: string
  userPhone?: string
  source?: 'comparator' | 'alert' | 'report_pdf'
  compact?: boolean
  onLeadCreated?: (leadId: string) => void
}

// =============================================================================
// COMPOSANTS
// =============================================================================

function ProviderCard({
  provider,
  vehicle,
  userName,
  coverageType,
  onSelect,
  index,
}: {
  provider: ProviderWithEstimate
  vehicle: VehicleData
  userName?: string
  coverageType: CoverageType
  onSelect: (provider: ProviderWithEstimate) => void
  index: number
}) {
  const isCheapest = index === 0
  const message = generateWhatsAppMessage(provider.name, vehicle, provider.estimate, userName)
  const whatsappUrl = provider.whatsappNumber 
    ? getWhatsAppUrl(provider.whatsappNumber, message)
    : null

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        provider.isRecommended 
          ? "border-2 border-orange-400 shadow-lg" 
          : "border border-gray-200",
        "rounded-2xl"
      )}
    >
      {/* Badge Recommandé */}
      {provider.isRecommended && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Recommandé
          </div>
        </div>
      )}

      {/* Badge Le moins cher */}
      {isCheapest && !provider.isRecommended && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Le plus accessible
          </div>
        </div>
      )}

      <CardContent className="p-5">
        {/* En-tête: Logo + Nom */}
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ backgroundColor: provider.primaryColor }}
          >
            {provider.logoUrl ? (
              <img 
                src={provider.logoUrl} 
                alt={provider.name} 
                className="w-10 h-10 object-contain"
              />
            ) : (
              provider.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{provider.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {COVERAGE_OPTIONS.find(c => c.type === coverageType)?.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Prix estimé */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">Estimation annuelle</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">
              {provider.priceRange}
            </span>
            <span className="text-sm text-gray-500">FCFA</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Soit ~{Math.round(provider.estimate.minPrice / 12).toLocaleString('fr-FR')} FCFA/mois
          </p>
        </div>

        {/* Avantages */}
        <div className="space-y-2 mb-4">
          {provider.advantages.slice(0, 3).map((advantage, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{advantage}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          {whatsappUrl && (
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl"
              onClick={() => {
                // Track lead
                onSelect(provider)
                // Open WhatsApp
                window.open(whatsappUrl, '_blank')
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Obtenir un devis
            </Button>
          )}
          {provider.websiteUrl && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => window.open(provider.websiteUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CoverageSelector({
  selected,
  onSelect,
  estimates,
}: {
  selected: CoverageType
  onSelect: (type: CoverageType) => void
  estimates: Record<CoverageType, InsuranceEstimate>
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {COVERAGE_OPTIONS.map((option) => (
        <button
          key={option.type}
          onClick={() => onSelect(option.type)}
          className={cn(
            "p-3 rounded-xl text-center transition-all duration-200",
            selected === option.type
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          )}
        >
          <div className="text-xs font-medium mb-1">{option.name.split(' ')[0]}</div>
          <div className="text-sm font-bold">
            {estimates[option.type].minPrice.toLocaleString('fr-FR')}
          </div>
          <div className="text-xs opacity-75">FCFA</div>
        </button>
      ))}
    </div>
  )
}

function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-amber-800">
          <strong>Estimation non contractuelle.</strong> Le prix final dépend de votre profil conducteur, 
          de l'historique de sinistralité et des garanties spécifiques choisies. 
          Contactez directement l'assureur pour un devis personnalisé.
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================

export function InsuranceComparator({
  vehicle,
  userName,
  userPhone,
  source = 'comparator',
  compact = false,
  onLeadCreated,
}: InsuranceComparatorProps) {
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [selectedCoverage, setSelectedCoverage] = useState<CoverageType>('tiers')
  const [estimates, setEstimates] = useState<Record<CoverageType, InsuranceEstimate> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithEstimate | null>(null)

  // Charger les assureurs et calculer les estimations
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calculer les estimations localement
        const allEstimates = calculateAllEstimates(vehicle)
        setEstimates(allEstimates)

        // Charger les assureurs depuis l'API
        const response = await fetch('/api/insurance/providers')
        if (response.ok) {
          const data = await response.json()
          setProviders(data.providers || [])
        } else {
          // Fallback: utiliser les données de référence
          const { INSURANCE_PROVIDERS_REFERENCE } = await import('@/lib/insuranceCalculator')
          setProviders(INSURANCE_PROVIDERS_REFERENCE as unknown as InsuranceProvider[])
        }
      } catch (error) {
        console.error('Error fetching insurance data:', error)
        // Fallback
        const { INSURANCE_PROVIDERS_REFERENCE } = await import('@/lib/insuranceCalculator')
        setProviders(INSURANCE_PROVIDERS_REFERENCE as unknown as InsuranceProvider[])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [vehicle])

  // Enregistrer un lead
  const handleSelectProvider = useCallback(async (provider: ProviderWithEstimate) => {
    try {
      const response = await fetch('/api/insurance/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          vehicleInfo: {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            plate: vehicle.plateNumber,
            estimatedValue: vehicle.estimatedValue,
          },
          coverageType: selectedCoverage,
          estimatedPrice: provider.estimate.minPrice,
          userName,
          userPhone,
          source,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onLeadCreated?.(data.leadId)
      }
    } catch (error) {
      console.error('Error creating lead:', error)
    }
  }, [vehicle, selectedCoverage, userName, userPhone, source, onLeadCreated])

  // Calculer les prix pour chaque assureur
  const providersWithEstimates: ProviderWithEstimate[] = providers
    .map((provider) => {
      const estimate = estimates?.[selectedCoverage] || {
        minPrice: provider.basePriceTier,
        maxPrice: provider.basePriceTier * 1.5,
        currency: 'FCFA',
        coverageType: selectedCoverage,
        factors: [],
        disclaimer: '',
      }
      
      // Ajuster selon le tier de prix de l'assureur
      const adjustedMin = Math.round(estimate.minPrice * (provider.basePriceTier / 80000))
      const adjustedMax = Math.round(estimate.maxPrice * (provider.basePriceTier / 80000))
      
      return {
        ...provider,
        estimate: {
          ...estimate,
          minPrice: adjustedMin,
          maxPrice: adjustedMax,
        },
        priceRange: `${adjustedMin.toLocaleString('fr-FR')} - ${adjustedMax.toLocaleString('fr-FR')}`,
      }
    })
    .sort((a, b) => a.estimate.minPrice - b.estimate.minPrice)

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <Shield className="h-12 w-12 text-orange-300 mx-auto mb-4" />
            <p className="text-gray-500">Chargement des offres d'assurance...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Version compacte pour intégration dans d'autres vues
  if (compact) {
    const cheapestProvider = providersWithEstimates[0]
    
    return (
      <Card 
        className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Assurance auto</p>
                <p className="text-sm text-gray-600">
                  À partir de <span className="font-bold text-orange-600">{cheapestProvider?.priceRange.split(' - ')[0]} FCFA</span>
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg"
              onClick={(e) => {
                e.stopPropagation()
                setShowDetails(true)
              }}
            >
              Comparer
            </Button>
          </div>
        </CardContent>

        {/* Modal détaillé */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Comparateur d'Assurance Auto
              </DialogTitle>
              <DialogDescription>
                Offres personnalisées pour votre {vehicle.brand} {vehicle.model}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <CoverageSelector
                selected={selectedCoverage}
                onSelect={setSelectedCoverage}
                estimates={estimates!}
              />
              
              <div className="grid grid-cols-1 gap-4">
                {providersWithEstimates.slice(0, 3).map((provider, idx) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    vehicle={vehicle}
                    userName={userName}
                    coverageType={selectedCoverage}
                    onSelect={handleSelectProvider}
                    index={idx}
                  />
                ))}
              </div>
              
              <DisclaimerBanner />
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    )
  }

  // Version complète
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 shadow-lg rounded-2xl">
        <CardContent className="p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Comparateur d'Assurance</h2>
              <p className="text-white/90">
                Basé sur votre {vehicle.brand} {vehicle.model}
                {vehicle.year ? ` ${vehicle.year}` : ''} - {vehicle.mileage.toLocaleString('fr-FR')} km
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sélecteur de couverture */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Type de couverture
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estimates && (
            <CoverageSelector
              selected={selectedCoverage}
              onSelect={setSelectedCoverage}
              estimates={estimates}
            />
          )}
        </CardContent>
      </Card>

      {/* Détails de la couverture sélectionnée */}
      <Card className="bg-blue-50 border border-blue-200 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                {COVERAGE_OPTIONS.find(c => c.type === selectedCoverage)?.name}
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                {COVERAGE_OPTIONS.find(c => c.type === selectedCoverage)?.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {COVERAGE_OPTIONS.find(c => c.type === selectedCoverage)?.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="bg-white text-blue-700 border-blue-200">
                    <Check className="h-3 w-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille des assureurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providersWithEstimates.map((provider, idx) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            vehicle={vehicle}
            userName={userName}
            coverageType={selectedCoverage}
            onSelect={handleSelectProvider}
            index={idx}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Alerte assurance expirant */}
      {vehicle.estimatedValue && vehicle.estimatedValue > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Protégez votre investissement</h4>
                <p className="text-sm text-amber-700">
                  Votre véhicule est estimé à <strong>{(vehicle.estimatedValue / 1_000_000).toFixed(1)}M FCFA</strong>. 
                  Une assurance tous risques vous protège en cas de vol, d'accident ou de dommages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InsuranceComparator
