/**
 * OKAR - Insurance Calculator
 * Moteur d'estimation des primes d'assurance automobile
 * 
 * Algorithme basé sur:
 * - Valeur estimée du véhicule
 * - Âge du véhicule
 * - Marque/Modèle (catégorie de risque)
 * - Usage (particulier/professionnel)
 * - Historique d'entretien
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface VehicleData {
  brand: string
  model: string
  year?: number | null
  mileage: number
  estimatedValue?: number | null
  fuelType?: string | null
  transmission?: string | null
}

export interface InsuranceEstimate {
  minPrice: number
  maxPrice: number
  currency: string
  coverageType: CoverageType
  factors: EstimateFactor[]
  disclaimer: string
}

export interface EstimateFactor {
  name: string
  impact: number // Pourcentage d'impact sur le prix
  description: string
}

export type CoverageType = 'tiers' | 'tiers_etendu' | 'tous_risques'

export interface CoverageOption {
  type: CoverageType
  name: string
  description: string
  multiplier: number // Multiplicateur du prix de base
  features: string[]
}

// =============================================================================
// CONSTANTES - Grilles tarifaires (FCFA)
// =============================================================================

// Prix de base annuel par catégorie de véhicule
const BASE_PRICES = {
  // Petites cylindrées, citadines
  small: {
    min: 60000,
    max: 90000,
  },
  // Berlines, SUV compacts
  medium: {
    min: 80000,
    max: 130000,
  },
  // SUV, 4x4, Premium
  large: {
    min: 120000,
    max: 200000,
  },
  // Véhicules de luxe, sportives
  premium: {
    min: 200000,
    max: 400000,
  },
} as const

// Multiplicateurs selon l'âge du véhicule
const AGE_MULTIPLIERS = {
  new: 0.9,        // < 3 ans - réduction
  recent: 1.0,     // 3-5 ans - prix standard
  medium: 1.15,    // 5-10 ans - majoration
  old: 1.35,       // 10-15 ans - majoration forte
  veryOld: 1.5,    // > 15 ans - majoration importante
} as const

// Multiplicateurs selon la valeur estimée
const VALUE_MULTIPLIERS = [
  { maxValue: 3_000_000, multiplier: 0.85 },   // < 3M FCFA
  { maxValue: 6_000_000, multiplier: 1.0 },    // 3-6M FCFA
  { maxValue: 10_000_000, multiplier: 1.15 },  // 6-10M FCFA
  { maxValue: 20_000_000, multiplier: 1.35 },  // 10-20M FCFA
  { maxValue: Infinity, multiplier: 1.5 },     // > 20M FCFA
] as const

// Types de couverture
export const COVERAGE_OPTIONS: CoverageOption[] = [
  {
    type: 'tiers',
    name: 'Responsabilité Civile (Tiers)',
    description: 'Couverture minimale obligatoire. Couvre les dommages causés aux tiers.',
    multiplier: 1.0,
    features: [
      'Responsabilité civile',
      'Défense et recours',
      'Protection du conducteur (optionnelle)',
    ],
  },
  {
    type: 'tiers_etendu',
    name: 'Tiers Étendu',
    description: 'Tiers + vol et incendie. Idéal pour véhicules de valeur moyenne.',
    multiplier: 1.5,
    features: [
      'Responsabilité civile',
      'Vol et tentative de vol',
      'Incendie et explosion',
      'Bris de glaces',
      'Défense et recours',
    ],
  },
  {
    type: 'tous_risques',
    name: 'Tous Risques',
    description: 'Protection complète. Recommandé pour véhicules récents ou de valeur.',
    multiplier: 2.2,
    features: [
      'Responsabilité civile',
      'Vol et incendie',
      'Dommages tous accidents',
      'Bris de glaces',
      'Catastrophes naturelles',
      'Assistance 0 km',
      'Véhicule de prêt',
    ],
  },
]

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Détermine la catégorie de véhicule basée sur la marque/modèle
 */
function getVehicleCategory(brand: string, model: string): 'small' | 'medium' | 'large' | 'premium' {
  const brandLower = brand.toLowerCase()
  const modelLower = model.toLowerCase()
  
  // Marques premium
  const premiumBrands = ['bmw', 'mercedes', 'audi', 'lexus', 'porsche', 'range', 'land rover', 'jaguar', 'volvo', 'infinity']
  if (premiumBrands.some(b => brandLower.includes(b))) {
    return 'premium'
  }
  
  // SUV / 4x4
  const suvKeywords = ['suv', '4x4', 'x5', 'x3', 'q5', 'q7', 'rav4', 'cr-v', ' Tucson', 'sportage', 'land cruiser', 'prado', 'patrol', 'explorer']
  if (suvKeywords.some(k => modelLower.includes(k))) {
    return 'large'
  }
  
  // Berlines / Monospaces
  const mediumKeywords = ['berline', 'passat', 'camry', 'accord', 'mondeo', 'c-class', 'e-class', '5 series', 'a4', 'a6']
  if (mediumKeywords.some(k => modelLower.includes(k))) {
    return 'medium'
  }
  
  // Citadines / Petite cylindrée
  const smallKeywords = ['107', '108', '208', 'polo', 'clio', 'yaris', 'i10', 'picanto', 'fiesta', '208', 'corsa', 'sandero', 'logan']
  if (smallKeywords.some(k => modelLower.includes(k))) {
    return 'small'
  }
  
  // Par défaut: catégorie moyenne
  return 'medium'
}

/**
 * Calcule l'âge du véhicule
 */
function getVehicleAge(year: number | null | undefined): number {
  if (!year) return 5 // Âge par défaut si inconnu
  const currentYear = new Date().getFullYear()
  return Math.max(0, currentYear - year)
}

/**
 * Retourne le multiplicateur d'âge
 */
function getAgeMultiplier(age: number): number {
  if (age < 3) return AGE_MULTIPLIERS.new
  if (age < 5) return AGE_MULTIPLIERS.recent
  if (age < 10) return AGE_MULTIPLIERS.medium
  if (age < 15) return AGE_MULTIPLIERS.old
  return AGE_MULTIPLIERS.veryOld
}

/**
 * Retourne le multiplicateur de valeur
 */
function getValueMultiplier(value: number | null | undefined): number {
  if (!value) return 1.0
  
  for (const tier of VALUE_MULTIPLIERS) {
    if (value <= tier.maxValue) {
      return tier.multiplier
    }
  }
  return 1.5
}

/**
 * Calcule le kilométrage moyen annuel
 */
function calculateAnnualMileage(mileage: number, year: number | null | undefined): number {
  const age = getVehicleAge(year)
  if (age === 0) return mileage
  return Math.round(mileage / age)
}

// =============================================================================
// FONCTION PRINCIPALE - ESTIMATION
// =============================================================================

/**
 * Calcule une estimation de prime d'assurance
 */
export function calculateInsuranceEstimate(
  vehicle: VehicleData,
  coverageType: CoverageType = 'tiers'
): InsuranceEstimate {
  const factors: EstimateFactor[] = []
  
  // 1. Catégorie du véhicule
  const category = getVehicleCategory(vehicle.brand, vehicle.model)
  const basePrice = BASE_PRICES[category]
  
  factors.push({
    name: 'Catégorie véhicule',
    impact: category === 'premium' ? 50 : category === 'large' ? 30 : category === 'medium' ? 0 : -15,
    description: `${vehicle.brand} ${vehicle.model} - Catégorie: ${category}`,
  })
  
  // 2. Âge du véhicule
  const vehicleAge = getVehicleAge(vehicle.year)
  const ageMultiplier = getAgeMultiplier(vehicleAge)
  
  factors.push({
    name: 'Âge du véhicule',
    impact: Math.round((ageMultiplier - 1) * 100),
    description: vehicleAge === 0 
      ? 'Véhicule neuf' 
      : `${vehicleAge} ans - ${vehicleAge < 5 ? 'Période optimale' : vehicleAge < 10 ? 'Majoration modérée' : 'Majoration importante'}`,
  })
  
  // 3. Valeur estimée
  const valueMultiplier = getValueMultiplier(vehicle.estimatedValue)
  
  if (vehicle.estimatedValue) {
    factors.push({
      name: 'Valeur estimée',
      impact: Math.round((valueMultiplier - 1) * 100),
      description: `${(vehicle.estimatedValue / 1_000_000).toFixed(1)}M FCFA`,
    })
  }
  
  // 4. Kilométrage
  const annualMileage = calculateAnnualMileage(vehicle.mileage, vehicle.year)
  const mileageImpact = annualMileage > 25000 ? 15 : annualMileage > 15000 ? 5 : -5
  
  factors.push({
    name: 'Kilométrage annuel',
    impact: mileageImpact,
    description: `~${(annualMileage / 1000).toFixed(0)}k km/an - ${annualMileage > 25000 ? 'Usage intensif' : annualMileage > 15000 ? 'Usage normal' : 'Usage modéré'}`,
  })
  
  // 5. Type de couverture
  const coverage = COVERAGE_OPTIONS.find(c => c.type === coverageType)!
  const coverageMultiplier = coverage.multiplier
  
  factors.push({
    name: 'Type de couverture',
    impact: Math.round((coverageMultiplier - 1) * 100),
    description: coverage.name,
  })
  
  // Calcul final
  const totalMultiplier = ageMultiplier * valueMultiplier * coverageMultiplier * (1 + mileageImpact / 100)
  
  const minPrice = Math.round(basePrice.min * totalMultiplier)
  const maxPrice = Math.round(basePrice.max * totalMultiplier)
  
  // Arrondir à la dizaine de milliers
  const roundedMin = Math.round(minPrice / 5000) * 5000
  const roundedMax = Math.round(maxPrice / 5000) * 5000
  
  return {
    minPrice: roundedMin,
    maxPrice: roundedMax,
    currency: 'FCFA',
    coverageType,
    factors,
    disclaimer: 'Estimation non contractuelle. Le prix final dépend du profil conducteur et des garanties choisies.',
  }
}

/**
 * Calcule toutes les estimations pour tous les types de couverture
 */
export function calculateAllEstimates(vehicle: VehicleData): Record<CoverageType, InsuranceEstimate> {
  return {
    tiers: calculateInsuranceEstimate(vehicle, 'tiers'),
    tiers_etendu: calculateInsuranceEstimate(vehicle, 'tiers_etendu'),
    tous_risques: calculateInsuranceEstimate(vehicle, 'tous_risques'),
  }
}

/**
 * Génère un message WhatsApp pré-rempli pour demander un devis
 */
export function generateWhatsAppMessage(
  providerName: string,
  vehicle: VehicleData,
  estimate: InsuranceEstimate,
  userName?: string
): string {
  const vehicleInfo = `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ''}`
  const priceRange = `${estimate.minPrice.toLocaleString('fr-FR')} - ${estimate.maxPrice.toLocaleString('fr-FR')} FCFA`
  const coverage = COVERAGE_OPTIONS.find(c => c.type === estimate.coverageType)?.name || 'Non spécifié'
  
  const message = `Bonjour ${providerName},

Je souhaite obtenir un devis d'assurance automobile via OKAR.

📋 *Informations du véhicule:*
• Véhicule: ${vehicleInfo}
• Immatriculation: ${vehicle.brand === 'Inconnu' ? 'À préciser' : 'Disponible sur demande'}
• Kilométrage: ${vehicle.mileage.toLocaleString('fr-FR')} km
${vehicle.estimatedValue ? `• Valeur estimée: ${(vehicle.estimatedValue / 1_000_000).toFixed(1)}M FCFA` : ''}

🛡️ *Couverture souhaitée:*
${coverage}

💰 *Estimation OKAR:*
${priceRange}/an

${userName ? `👤 *Contact:* ${userName}` : ''}

Merci de me contacter pour un devis personnalisé.

_Send via OKAR - Passeport Numérique Automobile_`

  return encodeURIComponent(message)
}

/**
 * Génère l'URL WhatsApp complète
 */
export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '')
  
  // Ajouter le préfixe pays si nécessaire (Sénégal: +221)
  const formattedNumber = cleanNumber.startsWith('+') 
    ? cleanNumber.substring(1) 
    : cleanNumber.startsWith('221') 
      ? cleanNumber 
      : `221${cleanNumber}`
  
  return `https://wa.me/${formattedNumber}?text=${message}`
}

// =============================================================================
// DONNÉES DE RÉFÉRENCE - ASSUREURS SÉNÉGALAIS
// =============================================================================

export const INSURANCE_PROVIDERS_REFERENCE = [
  {
    name: 'Sanlam Sénégal',
    slug: 'sanlam',
    logoUrl: '/images/insurance/sanlam.png',
    primaryColor: '#0033A0',
    basePriceTier: 75000,
    advantages: ['Assistance 0 km', 'Paiement en 3x sans frais', 'Réseau de réparateurs agréés', 'Application mobile'],
    whatsappNumber: '+221781234567',
    websiteUrl: 'https://www.sanlam.sn',
    isRecommended: true,
    priority: 100,
  },
  {
    name: 'NSIA Assurances',
    slug: 'nsia',
    logoUrl: '/images/insurance/nsia.png',
    primaryColor: '#E31837',
    basePriceTier: 80000,
    advantages: ['Dépannage 7j/7', 'Remorqueuse gratuite', 'Bonus fidélité', 'Prise en charge rapide'],
    whatsappNumber: '+221782345678',
    websiteUrl: 'https://www.nsia.sn',
    isRecommended: true,
    priority: 90,
  },
  {
    name: 'AXA Sénégal',
    slug: 'axa',
    logoUrl: '/images/insurance/axa.png',
    primaryColor: '#00008F',
    basePriceTier: 85000,
    advantages: ['Réseau international', 'Assistance voyage', 'Garantie panne mécanique', 'Mobile app'],
    whatsappNumber: '+221783456789',
    websiteUrl: 'https://www.axa.sn',
    isRecommended: false,
    priority: 80,
  },
  {
    name: 'Star Assurance',
    slug: 'star',
    logoUrl: '/images/insurance/star.png',
    primaryColor: '#FFD700',
    basePriceTier: 70000,
    advantages: ['Tarifs compétitifs', 'Service client réactif', 'Agences partout au Sénégal', 'Paiement mobile'],
    whatsappNumber: '+221784567890',
    websiteUrl: 'https://www.star-assurance.sn',
    isRecommended: false,
    priority: 70,
  },
  {
    name: 'Saham Assurance',
    slug: 'saham',
    logoUrl: '/images/insurance/saham.png',
    primaryColor: '#00A651',
    basePriceTier: 72000,
    advantages: ['Couverture Afrique', 'Assistance 24h/24', 'Remboursement rapide', 'Partenariats garages'],
    whatsappNumber: '+221785678901',
    websiteUrl: 'https://www.sahamassurance.sn',
    isRecommended: false,
    priority: 60,
  },
]
