/**
 * OKAR - API Stats Conducteur
 * 
 * Calcule et retourne les statistiques avancées du véhicule:
 * - Estimation de la valeur ("La Cote OKAR")
 * - Score de revente & Plan d'action
 * - Coût total de possession (TCO)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// =============================================================================
// PRIX DU MARCHÉ SÉNÉGALAIS (en FCFA)
// =============================================================================
const MARKET_PRICES: Record<string, Record<string, Record<number, number>>> = {
  'Toyota': {
    'Corolla': { 2015: 4500000, 2016: 5000000, 2017: 5500000, 2018: 6500000, 2019: 7500000, 2020: 8500000, 2021: 9500000, 2022: 11000000, 2023: 12500000 },
    'Yaris': { 2015: 3500000, 2016: 4000000, 2017: 4500000, 2018: 5000000, 2019: 5800000, 2020: 6500000, 2021: 7500000, 2022: 8500000, 2023: 9500000 },
    'RAV4': { 2015: 8000000, 2016: 9000000, 2017: 10000000, 2018: 12000000, 2019: 14000000, 2020: 16000000, 2021: 18000000, 2022: 20000000, 2023: 23000000 },
    'Hilux': { 2015: 10000000, 2016: 11000000, 2017: 13000000, 2018: 15000000, 2019: 17000000, 2020: 19000000, 2021: 22000000, 2022: 25000000, 2023: 28000000 },
    'Land Cruiser': { 2015: 18000000, 2016: 20000000, 2017: 23000000, 2018: 26000000, 2019: 30000000, 2020: 35000000, 2021: 40000000, 2022: 45000000, 2023: 50000000 },
    'Camry': { 2015: 6000000, 2016: 7000000, 2017: 8000000, 2018: 9500000, 2019: 11000000, 2020: 13000000, 2021: 15000000, 2022: 17000000, 2023: 19000000 },
  },
  'Renault': {
    'Logan': { 2015: 2500000, 2016: 2800000, 2017: 3200000, 2018: 3800000, 2019: 4200000, 2020: 4500000, 2021: 5000000, 2022: 5500000, 2023: 6000000 },
    'Sandero': { 2015: 2800000, 2016: 3200000, 2017: 3600000, 2018: 4200000, 2019: 4800000, 2020: 5200000, 2021: 5800000, 2022: 6500000, 2023: 7200000 },
    'Duster': { 2015: 5500000, 2016: 6200000, 2017: 7000000, 2018: 8000000, 2019: 9000000, 2020: 10000000, 2021: 11500000, 2022: 13000000, 2023: 14500000 },
    'Koleos': { 2015: 8000000, 2016: 9000000, 2017: 10000000, 2018: 11500000, 2019: 13000000, 2020: 14500000, 2021: 16000000, 2022: 18000000, 2023: 20000000 },
  },
  'Peugeot': {
    '206': { 2015: 2000000, 2016: 2300000, 2017: 2600000, 2018: 3000000 },
    '207': { 2015: 2200000, 2016: 2500000, 2017: 2800000, 2018: 3200000 },
    '208': { 2015: 3000000, 2016: 3500000, 2017: 4000000, 2018: 4800000, 2019: 5500000, 2020: 6500000, 2021: 7500000, 2022: 8500000, 2023: 9500000 },
    '301': { 2015: 3000000, 2016: 3400000, 2017: 3800000, 2018: 4500000, 2019: 5000000, 2020: 5500000, 2021: 6000000, 2022: 6500000, 2023: 7000000 },
    '308': { 2015: 4500000, 2016: 5200000, 2017: 6000000, 2018: 7000000, 2019: 8000000, 2020: 9500000, 2021: 11000000, 2022: 12500000, 2023: 14000000 },
    '508': { 2015: 6000000, 2016: 6800000, 2017: 7600000, 2018: 8500000, 2019: 9500000, 2020: 10500000, 2021: 12000000, 2022: 13500000, 2023: 15000000 },
    '3008': { 2015: 7000000, 2016: 8000000, 2017: 9000000, 2018: 10500000, 2019: 12000000, 2020: 13500000, 2021: 15000000, 2022: 17000000, 2023: 19000000 },
  },
  'Hyundai': {
    'Accent': { 2015: 3500000, 2016: 4000000, 2017: 4500000, 2018: 5200000, 2019: 5800000, 2020: 6500000, 2021: 7200000, 2022: 8000000, 2023: 9000000 },
    'Elantra': { 2015: 4500000, 2016: 5200000, 2017: 6000000, 2018: 7000000, 2019: 8000000, 2020: 9000000, 2021: 10000000, 2022: 11500000, 2023: 13000000 },
    'Tucson': { 2015: 7000000, 2016: 8000000, 2017: 9000000, 2018: 10500000, 2019: 12000000, 2020: 14000000, 2021: 16000000, 2022: 18000000, 2023: 20000000 },
    'Santa Fe': { 2015: 10000000, 2016: 11500000, 2017: 13000000, 2018: 15000000, 2019: 17000000, 2020: 19500000, 2021: 22000000, 2022: 25000000, 2023: 28000000 },
  },
  'Kia': {
    'Rio': { 2015: 3000000, 2016: 3500000, 2017: 4000000, 2018: 4600000, 2019: 5200000, 2020: 5800000, 2021: 6500000, 2022: 7200000, 2023: 8000000 },
    'Cerato': { 2015: 4000000, 2016: 4600000, 2017: 5300000, 2018: 6200000, 2019: 7000000, 2020: 8000000, 2021: 9000000, 2022: 10500000, 2023: 12000000 },
    'Sportage': { 2015: 6500000, 2016: 7500000, 2017: 8500000, 2018: 10000000, 2019: 11500000, 2020: 13500000, 2021: 15500000, 2022: 17500000, 2023: 19500000 },
    'Sorento': { 2015: 9000000, 2016: 10500000, 2017: 12000000, 2018: 14000000, 2019: 16000000, 2020: 18500000, 2021: 21000000, 2022: 24000000, 2023: 27000000 },
  },
  'Mercedes': {
    'Classe A': { 2015: 12000000, 2016: 14000000, 2017: 16000000, 2018: 19000000, 2019: 22000000, 2020: 25500000, 2021: 29000000, 2022: 33000000, 2023: 37000000 },
    'Classe C': { 2015: 15000000, 2016: 17500000, 2017: 20000000, 2018: 23000000, 2019: 26000000, 2020: 30000000, 2021: 34000000, 2022: 39000000, 2023: 44000000 },
    'Classe E': { 2015: 22000000, 2016: 25500000, 2017: 29000000, 2018: 33000000, 2019: 38000000, 2020: 43000000, 2021: 48000000, 2022: 55000000, 2023: 62000000 },
    'GLC': { 2015: 20000000, 2016: 23500000, 2017: 27000000, 2018: 31000000, 2019: 35000000, 2020: 40000000, 2021: 45000000, 2022: 52000000, 2023: 59000000 },
  },
  'BMW': {
    'Série 1': { 2015: 11000000, 2016: 13000000, 2017: 15000000, 2018: 17500000, 2019: 20000000, 2020: 23000000, 2021: 26000000, 2022: 30000000, 2023: 34000000 },
    'Série 3': { 2015: 14000000, 2016: 16500000, 2017: 19000000, 2018: 22000000, 2019: 25000000, 2020: 28500000, 2021: 32000000, 2022: 37000000, 2023: 42000000 },
    'Série 5': { 2015: 21000000, 2016: 24500000, 2017: 28000000, 2018: 32000000, 2019: 36000000, 2020: 41000000, 2021: 46000000, 2022: 53000000, 2023: 60000000 },
    'X3': { 2015: 18000000, 2016: 21000000, 2017: 24000000, 2018: 28000000, 2019: 32000000, 2020: 36500000, 2021: 41000000, 2022: 47000000, 2023: 53000000 },
  },
}

// Prix par défaut pour les marques/modèles non listés
const DEFAULT_PRICE = 3000000

// =============================================================================
// FONCTIONS DE CALCUL
// =============================================================================

/**
 * Obtient le prix de base d'un véhicule
 */
function getBasePrice(brand: string, model: string, year: number): number {
  const brandPrices = MARKET_PRICES[brand]
  if (!brandPrices) return DEFAULT_PRICE
  
  const modelPrices = brandPrices[model]
  if (!modelPrices) return DEFAULT_PRICE
  
  // Trouver l'année la plus proche
  const years = Object.keys(modelPrices).map(Number).sort((a, b) => a - b)
  
  if (years.length === 0) return DEFAULT_PRICE
  
  // Si l'année existe
  if (modelPrices[year]) return modelPrices[year]
  
  // Sinon, interpolation linéaire
  const minYear = years[0]
  const maxYear = years[years.length - 1]
  
  if (year < minYear) {
    // Décote pour les années antérieures (10% par année)
    const yearsDiff = minYear - year
    return Math.round(modelPrices[minYear] * Math.pow(0.9, yearsDiff))
  }
  
  if (year > maxYear) {
    // Augmentation pour les années postérieures (5% par année)
    const yearsDiff = year - maxYear
    return Math.round(modelPrices[maxYear] * Math.pow(1.05, yearsDiff))
  }
  
  // Interpolation entre les deux années les plus proches
  let lowerYear = minYear
  let upperYear = maxYear
  
  for (const y of years) {
    if (y < year) lowerYear = y
    if (y > year && upperYear === maxYear) upperYear = y
  }
  
  if (lowerYear === upperYear) return modelPrices[lowerYear]
  
  const ratio = (year - lowerYear) / (upperYear - lowerYear)
  return Math.round(modelPrices[lowerYear] + ratio * (modelPrices[upperYear] - modelPrices[lowerYear]))
}

/**
 * Calcule la valeur estimée du véhicule
 */
function calculateEstimatedValue(
  brand: string,
  model: string,
  year: number | null,
  mileage: number,
  maintenanceHistory: Array<{ type: string; isOwnerValidated: boolean; createdAt: Date }>,
  alerts: Array<{ type: string; severity: string }>
): { value: number; breakdown: { base: number; mileageDeduction: number; historyBonus: number; accidentMalus: number; alertMalus: number } } {
  
  const vehicleYear = year || 2015
  const basePrice = getBasePrice(brand, model, vehicleYear)
  
  let value = basePrice
  const breakdown = {
    base: basePrice,
    mileageDeduction: 0,
    historyBonus: 0,
    accidentMalus: 0,
    alertMalus: 0
  }
  
  // Décote kilométrique: 50 FCFA par km au-dessus de 50 000 km
  const mileageThreshold = 50000
  if (mileage > mileageThreshold) {
    const deduction = Math.round((mileage - mileageThreshold) * 50)
    breakdown.mileageDeduction = deduction
    value -= deduction
  }
  
  // Bonus historique certifié
  const validatedCount = maintenanceHistory.filter(h => h.isOwnerValidated).length
  const totalMaintenance = maintenanceHistory.length
  
  if (validatedCount >= 10) {
    breakdown.historyBonus = 500000
    value += 500000
  } else if (validatedCount >= 5) {
    breakdown.historyBonus = 300000
    value += 300000
  } else if (validatedCount >= 3) {
    breakdown.historyBonus = 150000
    value += 150000
  }
  
  // Score d'entretien (bonus si régularité)
  if (totalMaintenance >= 5) {
    const recentMaintenance = maintenanceHistory.filter(h => {
      const date = new Date(h.createdAt)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return date > sixMonthsAgo
    }).length
    
    if (recentMaintenance >= 2) {
      breakdown.historyBonus += 100000
      value += 100000
    }
  }
  
  // Malus accidents
  const accidentCount = maintenanceHistory.filter(h => h.type === 'accident').length
  if (accidentCount > 0) {
    const malus = accidentCount * 300000
    breakdown.accidentMalus = malus
    value -= malus
  }
  
  // Malus alertes critiques
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
  if (criticalAlerts > 0) {
    const malus = criticalAlerts * 150000
    breakdown.alertMalus = malus
    value -= malus
  }
  
  // Valeur minimum: 500 000 FCFA
  value = Math.max(500000, value)
  
  return { value, breakdown }
}

/**
 * Calcule le score de revente
 */
function calculateResaleScore(
  vehicle: {
    mileage: number
    technicalControlDate: Date | null
    technicalControlStatus: string
    insuranceExpiryDate: Date | null
    insuranceStatus: string
    nextOilChangeMileage: number | null
    nextOilChangeDate: Date | null
  },
  maintenanceHistory: Array<{
    type: string
    isOwnerValidated: boolean
    createdAt: Date
    mileage: number
  }>,
  alerts: Array<{ type: string; severity: string }>
): { score: number; factors: Array<{ name: string; impact: number; status: 'positive' | 'negative' | 'neutral' }> } {
  
  let score = 100
  const factors: Array<{ name: string; impact: number; status: 'positive' | 'negative' | 'neutral' }> = []
  
  // === MALUS ===
  
  // Kilométrage élevé
  if (vehicle.mileage > 150000) {
    score -= 20
    factors.push({ name: 'Kilométrage élevé (>150 000 km)', impact: -20, status: 'negative' })
  } else if (vehicle.mileage > 100000) {
    score -= 10
    factors.push({ name: 'Kilométrage modéré (>100 000 km)', impact: -10, status: 'negative' })
  }
  
  // Contrôle technique expiré ou bientôt
  if (vehicle.technicalControlStatus === 'expired') {
    score -= 30
    factors.push({ name: 'Contrôle Technique expiré', impact: -30, status: 'negative' })
  } else if (vehicle.technicalControlStatus === 'expiring_soon') {
    score -= 10
    factors.push({ name: 'CT expire bientôt', impact: -10, status: 'negative' })
  }
  
  // Assurance expirée
  if (vehicle.insuranceStatus === 'expired') {
    score -= 15
    factors.push({ name: 'Assurance expirée', impact: -15, status: 'negative' })
  } else if (vehicle.insuranceStatus === 'expiring_soon') {
    score -= 5
    factors.push({ name: 'Assurance expire bientôt', impact: -5, status: 'negative' })
  }
  
  // Accidents déclarés
  const accidentCount = maintenanceHistory.filter(h => h.type === 'accident').length
  if (accidentCount > 0) {
    const malus = Math.min(25, accidentCount * 15)
    score -= malus
    factors.push({ name: `${accidentCount} accident(s) déclaré(s)`, impact: -malus, status: 'negative' })
  }
  
  // Alertes critiques
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
  if (criticalAlerts > 0) {
    score -= criticalAlerts * 10
    factors.push({ name: `${criticalAlerts} alerte(s) critique(s)`, impact: -criticalAlerts * 10, status: 'negative' })
  }
  
  // === BONUS ===
  
  // Historique d'entretien
  if (maintenanceHistory.length >= 10) {
    score += 10
    factors.push({ name: 'Historique riche (10+ interventions)', impact: 10, status: 'positive' })
  } else if (maintenanceHistory.length >= 5) {
    score += 5
    factors.push({ name: 'Bon historique (5+ interventions)', impact: 5, status: 'positive' })
  }
  
  // Toutes les interventions validées
  const allValidated = maintenanceHistory.length > 0 && maintenanceHistory.every(h => h.isOwnerValidated)
  if (allValidated) {
    score += 10
    factors.push({ name: 'Historique 100% certifié', impact: 10, status: 'positive' })
  }
  
  // Vidange récente
  const lastOilChange = maintenanceHistory
    .filter(h => h.type === 'oil_change')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  
  if (lastOilChange) {
    const daysSince = Math.floor((Date.now() - new Date(lastOilChange.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince < 180) {
      score += 5
      factors.push({ name: 'Vidange récente (< 6 mois)', impact: 5, status: 'positive' })
    }
  }
  
  // Aucun accident
  if (accidentCount === 0) {
    score += 10
    factors.push({ name: 'Aucun accident déclaré', impact: 10, status: 'positive' })
  }
  
  // Documents à jour
  if (vehicle.technicalControlStatus === 'valid' && vehicle.insuranceStatus === 'valid') {
    score += 5
    factors.push({ name: 'Documents à jour', impact: 5, status: 'positive' })
  }
  
  // Limiter le score entre 0 et 100
  score = Math.max(0, Math.min(100, score))
  
  return { score, factors }
}

/**
 * Génère les actions à faire
 */
function generateActionItems(
  vehicle: {
    mileage: number
    technicalControlDate: Date | null
    technicalControlStatus: string
    insuranceExpiryDate: Date | null
    insuranceStatus: string
    nextOilChangeMileage: number | null
    nextOilChangeDate: Date | null
  },
  maintenanceHistory: Array<{
    type: string
    isOwnerValidated: boolean
    createdAt: Date
    mileage: number
  }>
): Array<{
  id: string
  category: 'critical' | 'recommended' | 'strength'
  title: string
  description: string
  impact: number
  action?: string
  deadline?: string
}> {
  
  const actions: Array<{
    id: string
    category: 'critical' | 'recommended' | 'strength'
    title: string
    description: string
    impact: number
    action?: string
    deadline?: string
  }> = []
  
  // === ACTIONS CRITIQUES ===
  
  // CT expiré
  if (vehicle.technicalControlStatus === 'expired') {
    actions.push({
      id: 'ct_expired',
      category: 'critical',
      title: 'Contrôle Technique expiré',
      description: 'Faire le CT immédiatement',
      impact: -30,
      action: 'Prendre rendez-vous'
    })
  } else if (vehicle.technicalControlStatus === 'expiring_soon' && vehicle.technicalControlDate) {
    const days = Math.ceil((new Date(vehicle.technicalControlDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    actions.push({
      id: 'ct_expiring',
      category: 'critical',
      title: `CT expire dans ${days} jours`,
      description: '-10 pts si non fait',
      impact: -10,
      deadline: `${days} jours`
    })
  }
  
  // Assurance expirée
  if (vehicle.insuranceStatus === 'expired') {
    actions.push({
      id: 'insurance_expired',
      category: 'critical',
      title: 'Assurance expirée',
      description: 'Renouveler immédiatement',
      impact: -15,
      action: 'Contacter assureur'
    })
  } else if (vehicle.insuranceStatus === 'expiring_soon' && vehicle.insuranceExpiryDate) {
    const days = Math.ceil((new Date(vehicle.insuranceExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    actions.push({
      id: 'insurance_expiring',
      category: 'critical',
      title: `Assurance expire dans ${days} jours`,
      description: '-5 pts si non renouvelée',
      impact: -5,
      deadline: `${days} jours`
    })
  }
  
  // === ACTIONS RECOMMANDÉES ===
  
  // Vidange recommandée
  if (vehicle.nextOilChangeMileage && vehicle.mileage > vehicle.nextOilChangeMileage - 1000) {
    const kmRemaining = vehicle.nextOilChangeMileage - vehicle.mileage
    if (kmRemaining <= 0) {
      actions.push({
        id: 'oil_overdue',
        category: 'recommended',
        title: 'Vidange en retard',
        description: 'Dépassement du kilométrage recommandé',
        impact: 5,
        action: 'Prendre rendez-vous'
      })
    } else {
      actions.push({
        id: 'oil_soon',
        category: 'recommended',
        title: `Vidange dans ${kmRemaining} km`,
        description: '+5 pts après validation',
        impact: 5
      })
    }
  }
  
  // Pas d'historique récent
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const recentMaintenance = maintenanceHistory.filter(h => new Date(h.createdAt) > sixMonthsAgo)
  
  if (recentMaintenance.length === 0 && maintenanceHistory.length > 0) {
    actions.push({
      id: 'no_recent_maintenance',
      category: 'recommended',
      title: 'Aucun entretien récent',
      description: 'Faire un contrôle général',
      impact: 3,
      action: 'Trouver un garage'
    })
  }
  
  // === POINTS FORTS ===
  
  // Historique parfait
  const oilChanges = maintenanceHistory.filter(h => h.type === 'oil_change')
  if (oilChanges.length >= 3) {
    actions.push({
      id: 'oil_history',
      category: 'strength',
      title: `Historique de vidanges parfait`,
      description: `+${Math.min(15, oilChanges.length * 5)} pts`,
      impact: Math.min(15, oilChanges.length * 5)
    })
  }
  
  // Aucun accident
  const accidentCount = maintenanceHistory.filter(h => h.type === 'accident').length
  if (accidentCount === 0) {
    actions.push({
      id: 'no_accident',
      category: 'strength',
      title: 'Aucun accident déclaré',
      description: '+10 pts',
      impact: 10
    })
  }
  
  // Documents à jour
  if (vehicle.technicalControlStatus === 'valid' && vehicle.insuranceStatus === 'valid') {
    actions.push({
      id: 'docs_valid',
      category: 'strength',
      title: 'Documents à jour',
      description: '+5 pts',
      impact: 5
    })
  }
  
  return actions
}

/**
 * Calcule le coût total de possession
 */
function calculateTCO(
  maintenanceHistory: Array<{
    type: string
    cost: number | null
    createdAt: Date
  }>
): {
  totalCost12Months: number
  totalCostAllTime: number
  averageMonthlyCost: number
  costBreakdown: { category: string; amount: number; percentage: number; color: string }[]
  comparisonPercent: number
} {
  
  const now = new Date()
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  
  let totalCost12Months = 0
  let totalCostAllTime = 0
  let entretienCost = 0
  let reparationCost = 0
  
  for (const record of maintenanceHistory) {
    const cost = record.cost || 0
    totalCostAllTime += cost
    
    if (new Date(record.createdAt) >= twelveMonthsAgo) {
      totalCost12Months += cost
      
      // Catégorisation
      if (['oil_change', 'maintenance', 'inspection', 'tire_change', 'battery'].includes(record.type)) {
        entretienCost += cost
      } else if (['major_repair', 'accident'].includes(record.type)) {
        reparationCost += cost
      }
    }
  }
  
  const averageMonthlyCost = totalCost12Months / 12
  
  // Comparaison avec le marché (mock - moyenne estimée à 400 000 FCFA/an)
  const marketAverage = 400000
  const comparisonPercent = Math.round(((marketAverage - totalCost12Months) / marketAverage) * 100)
  
  // Répartition
  const total = entretienCost + reparationCost
  const costBreakdown = [
    {
      category: 'Entretien courant',
      amount: entretienCost,
      percentage: total > 0 ? Math.round((entretienCost / total) * 100) : 0,
      color: '#22c55e'
    },
    {
      category: 'Réparations majeures',
      amount: reparationCost,
      percentage: total > 0 ? Math.round((reparationCost / total) * 100) : 0,
      color: '#f97316'
    }
  ]
  
  return {
    totalCost12Months,
    totalCostAllTime,
    averageMonthlyCost,
    costBreakdown,
    comparisonPercent
  }
}

// =============================================================================
// API HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const userId = searchParams.get('userId')
    
    if (!vehicleId && !userId) {
      return NextResponse.json(
        { error: 'vehicleId ou userId requis' },
        { status: 400 }
      )
    }
    
    let vehicle
    
    if (vehicleId) {
      vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          maintenanceHistory: {
            orderBy: { createdAt: 'desc' }
          },
          alerts: {
            where: { isResolved: false }
          },
          stats: true,
          valueHistory: {
            orderBy: { recordedAt: 'desc' },
            take: 12
          }
        }
      })
    } else if (userId) {
      vehicle = await db.vehicle.findFirst({
        where: { ownerId: userId },
        include: {
          maintenanceHistory: {
            orderBy: { createdAt: 'desc' }
          },
          alerts: {
            where: { isResolved: false }
          },
          stats: true,
          valueHistory: {
            orderBy: { recordedAt: 'desc' },
            take: 12
          }
        }
      })
    }
    
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }
    
    // Calculer la valeur estimée
    const valueResult = calculateEstimatedValue(
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.mileage,
      vehicle.maintenanceHistory,
      vehicle.alerts
    )
    
    // Calculer le score de revente
    const scoreResult = calculateResaleScore(
      vehicle,
      vehicle.maintenanceHistory,
      vehicle.alerts
    )
    
    // Générer les actions
    const actionItems = generateActionItems(
      vehicle,
      vehicle.maintenanceHistory
    )
    
    // Calculer le TCO
    const tcoResult = calculateTCO(vehicle.maintenanceHistory)
    
    // Historique des valeurs pour le graphique
    const valueHistoryData = vehicle.valueHistory.map(v => ({
      date: v.recordedAt,
      value: v.value,
      reason: v.reason
    }))
    
    // Ajouter la valeur actuelle
    valueHistoryData.unshift({
      date: new Date(),
      value: valueResult.value,
      reason: 'Calcul actuel'
    })
    
    // Sauvegarder ou mettre à jour les stats
    await db.vehicleStats.upsert({
      where: { vehicleId: vehicle.id },
      create: {
        vehicleId: vehicle.id,
        estimatedValue: valueResult.value,
        resaleScore: scoreResult.score,
        totalCost12Months: tcoResult.totalCost12Months,
        totalCostAllTime: tcoResult.totalCostAllTime,
        averageMonthlyCost: Math.round(tcoResult.averageMonthlyCost),
        comparisonPercent: tcoResult.comparisonPercent,
        valueHistory: JSON.stringify(valueHistoryData)
      },
      update: {
        estimatedValue: valueResult.value,
        resaleScore: scoreResult.score,
        totalCost12Months: tcoResult.totalCost12Months,
        totalCostAllTime: tcoResult.totalCostAllTime,
        averageMonthlyCost: Math.round(tcoResult.averageMonthlyCost),
        comparisonPercent: tcoResult.comparisonPercent,
        valueHistory: JSON.stringify(valueHistoryData),
        lastCalculated: new Date()
      }
    })
    
    // Mettre à jour le véhicule
    await db.vehicle.update({
      where: { id: vehicle.id },
      data: {
        estimatedValue: valueResult.value,
        resaleScore: scoreResult.score,
        lastStatsUpdate: new Date()
      }
    })
    
    // Enregistrer dans l'historique si changement significatif
    const lastValue = vehicle.valueHistory[0]?.value || 0
    if (Math.abs(valueResult.value - lastValue) > lastValue * 0.05) {
      await db.valueHistory.create({
        data: {
          vehicleId: vehicle.id,
          value: valueResult.value,
          reason: 'Recalcul automatique'
        }
      })
    }
    
    // Compter les interventions certifiées
    const certifiedCount = vehicle.maintenanceHistory.filter(h => h.isOwnerValidated).length
    
    return NextResponse.json({
      success: true,
      data: {
        // Valeur estimée
        estimatedValue: valueResult.value,
        valueBreakdown: valueResult.breakdown,
        valueHistory: valueHistoryData,
        valueMessage: certifiedCount > 0
          ? `Basé sur ${certifiedCount} entretien${certifiedCount > 1 ? 's' : ''} certifié${certifiedCount > 1 ? 's' : ''}, ${vehicle.mileage.toLocaleString()} km, État ${scoreResult.score >= 80 ? 'excellent' : scoreResult.score >= 60 ? 'bon' : 'correct'}`
          : `Estimation basée sur le marché, ${vehicle.mileage.toLocaleString()} km`,
        valueBonusMessage: certifiedCount >= 5
          ? `Ma voiture vaut ${valueResult.breakdown.historyBonus.toLocaleString()} FCFA de plus grâce à mon historique prouvé`
          : undefined,
        
        // Score de revente
        resaleScore: scoreResult.score,
        resaleFactors: scoreResult.factors,
        
        // Plan d'action
        actionItems,
        
        // TCO
        tco: tcoResult,
        
        // Infos véhicule
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          plateNumber: vehicle.plateNumber
        }
      }
    })
    
  } catch (error) {
    console.error('Erreur calcul stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    )
  }
}
