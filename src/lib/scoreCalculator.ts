/**
 * OKAR - Score Calculator Utility
 * 
 * Calcule le score de confiance d'un véhicule basé sur:
 * - Historique d'entretien
 * - Régularité des interventions
 * - Statut des documents (CT, assurance)
 * - Accidents déclarés
 * 
 * RÈGLE CRITIQUE:
 * - Un véhicule SANS historique = "NON ÉVALUÉ" (pas de score)
 * - Le score ne doit JAMAIS être inventé sans données
 */

// Types
export interface VehicleDataForScore {
  plateNumber: string
  mileage: number
  interventions: Array<{
    id: string
    type: string
    status: string
    createdAt: Date | string
    mileage: number
    isOwnerValidated: boolean
  }>
  accidents: Array<{
    id: string
    severity: 'minor' | 'moderate' | 'severe'
    createdAt: Date | string
  }>
  technicalControl?: {
    status: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
    daysRemaining: number | null
  }
  insurance?: {
    status: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
    daysRemaining: number | null
  }
  ownersCount: number
  createdAt: Date | string
}

export interface ScoreResult {
  status: 'evaluated' | 'not_evaluated' | 'partial'
  score: number | null
  displayScore: string
  label: string
  message: string
  color: 'green' | 'orange' | 'red' | 'gray'
  factors: Array<{
    name: string
    impact: number
    status: 'good' | 'warning' | 'critical' | 'neutral'
    description?: string
  }>
  recommendations: string[]
  confidence: 'high' | 'medium' | 'low' | 'none'
}

/**
 * Calcule le score de confiance d'un véhicule
 */
export function calculateTrustScore(vehicle: VehicleDataForScore): ScoreResult {
  const { interventions, accidents, technicalControl, insurance, ownersCount, createdAt } = vehicle

  // ===========================================
  // CAS 1: VÉHICULE NOUVEAU / AUCUNE DONNÉE
  // ===========================================
  const validInterventions = interventions.filter(i => i.status === 'validated' || i.isOwnerValidated)
  const hasNoData = validInterventions.length === 0 && accidents.length === 0

  if (hasNoData) {
    return {
      status: 'not_evaluated',
      score: null,
      displayScore: '—',
      label: 'NON ÉVALUÉ',
      message: "Ce véhicule vient d'être enregistré. Son score évoluera avec ses premières interventions certifiées.",
      color: 'gray',
      factors: [
        { name: 'Historique', impact: 0, status: 'neutral', description: 'Aucune intervention enregistrée' },
        { name: 'Documents', impact: 0, status: 'neutral', description: 'Non vérifiés' },
      ],
      recommendations: [
        'Effectuez votre première vidange chez un garage partenaire OKAR',
        'Faites valider vos documents (CT, assurance)',
      ],
      confidence: 'none',
    }
  }

  // ===========================================
  // CAS 2: VÉHICULE AVEC HISTORIQUE PARTIEL
  // ===========================================
  const hasPartialData = validInterventions.length > 0 && validInterventions.length < 3

  if (hasPartialData) {
    // Calcul partiel basé sur les données existantes
    let partialScore = 50 // Base neutre

    // Points pour les interventions existantes
    partialScore += validInterventions.length * 5

    // Pénalités pour accidents
    accidents.forEach(acc => {
      if (acc.severity === 'severe') partialScore -= 20
      else if (acc.severity === 'moderate') partialScore -= 10
      else partialScore -= 5
    })

    // Ajustement documents
    if (technicalControl?.status === 'valid') partialScore += 5
    if (insurance?.status === 'valid') partialScore += 5

    partialScore = Math.max(20, Math.min(80, partialScore))

    return {
      status: 'partial',
      score: partialScore,
      displayScore: `${partialScore}*`,
      label: 'ÉVALUATION EN COURS',
      message: `Score provisoire basé sur ${validInterventions.length} intervention(s). Plus d'historique = score plus fiable.`,
      color: partialScore >= 60 ? 'orange' : 'red',
      factors: generateFactors(validInterventions, accidents, technicalControl, insurance, ownersCount),
      recommendations: [
        'Continuez à faire entretenir votre véhicule chez des garages OKAR',
        'Demandez à votre garage de valider chaque intervention',
      ],
      confidence: 'low',
    }
  }

  // ===========================================
  // CAS 3: VÉHICULE AVEC HISTORIQUE COMPLET
  // ===========================================
  let score = 70 // Base pour un véhicule avec historique

  // === Facteurs positifs ===

  // Régularité des entretiens (max +15)
  const oilChanges = validInterventions.filter(i => i.type === 'oil_change' || i.type === 'Vidange')
  if (oilChanges.length >= 3) score += 10
  if (oilChanges.length >= 5) score += 5

  // Interventions variées (max +10)
  const interventionTypes = new Set(validInterventions.map(i => i.type))
  if (interventionTypes.size >= 3) score += 5
  if (interventionTypes.size >= 5) score += 5

  // Documents à jour (max +10)
  if (technicalControl?.status === 'valid') {
    score += 5
    if (technicalControl.daysRemaining && technicalControl.daysRemaining > 180) score += 2
  }
  if (insurance?.status === 'valid') {
    score += 3
    if (insurance.daysRemaining && insurance.daysRemaining > 90) score += 2
  }

  // Validations propriétaire (max +5)
  const ownerValidated = validInterventions.filter(i => i.isOwnerValidated)
  if (ownerValidated.length >= validInterventions.length * 0.8) score += 5

  // Un seul propriétaire (max +5)
  if (ownersCount === 1) score += 5

  // === Facteurs négatifs ===

  // Accidents
  accidents.forEach(acc => {
    if (acc.severity === 'severe') score -= 25
    else if (acc.severity === 'moderate') score -= 15
    else score -= 8
  })

  // Documents expirés
  if (technicalControl?.status === 'expired') score -= 15
  if (insurance?.status === 'expired') score -= 10

  // Incohérence kilométrique (à détecter)
  const sortedByMileage = [...validInterventions].sort((a, b) => b.mileage - a.mileage)
  let hasMileageAnomaly = false
  for (let i = 0; i < sortedByMileage.length - 1; i++) {
    if (sortedByMileage[i].mileage < sortedByMileage[i + 1].mileage) {
      hasMileageAnomaly = true
      score -= 20
      break
    }
  }

  // Trop de propriétaires
  if (ownersCount > 3) score -= 10

  // Borner le score
  score = Math.max(0, Math.min(100, score))

  // Déterminer la couleur et le label
  const color: 'green' | 'orange' | 'red' = score >= 70 ? 'green' : score >= 40 ? 'orange' : 'red'
  const label = score >= 80 ? 'EXCELLLENT' : score >= 60 ? 'BON' : score >= 40 ? 'MOYEN' : 'À SURVEILLER'
  const message = generateMessage(score, validInterventions.length, accidents.length)

  return {
    status: 'evaluated',
    score,
    displayScore: `${score}`,
    label,
    message,
    color,
    factors: generateFactors(validInterventions, accidents, technicalControl, insurance, ownersCount),
    recommendations: generateRecommendations(score, technicalControl, insurance, oilChanges.length),
    confidence: validInterventions.length >= 5 ? 'high' : 'medium',
  }
}

/**
 * Génère les facteurs pour l'affichage
 */
function generateFactors(
  interventions: any[],
  accidents: any[],
  technicalControl?: any,
  insurance?: any,
  ownersCount?: number
): ScoreResult['factors'] {
  const factors: ScoreResult['factors'] = []

  // Historique
  factors.push({
    name: 'Historique',
    impact: interventions.length >= 5 ? 10 : interventions.length >= 3 ? 5 : 0,
    status: interventions.length >= 5 ? 'good' : interventions.length >= 3 ? 'warning' : 'critical',
    description: `${interventions.length} intervention(s) certifiée(s)`,
  })

  // Contrôle technique
  factors.push({
    name: 'Contrôle Technique',
    impact: technicalControl?.status === 'valid' ? 5 : technicalControl?.status === 'expiring_soon' ? -5 : -10,
    status: technicalControl?.status === 'valid' ? 'good' : technicalControl?.status === 'expiring_soon' ? 'warning' : 'critical',
  })

  // Assurance
  factors.push({
    name: 'Assurance',
    impact: insurance?.status === 'valid' ? 3 : -5,
    status: insurance?.status === 'valid' ? 'good' : insurance?.status === 'expiring_soon' ? 'warning' : 'critical',
  })

  // Accidents
  factors.push({
    name: 'Accidents',
    impact: accidents.length === 0 ? 10 : accidents.length === 1 ? -5 : -15,
    status: accidents.length === 0 ? 'good' : accidents.length === 1 ? 'warning' : 'critical',
    description: accidents.length === 0 ? 'Aucun accident déclaré' : `${accidents.length} accident(s)`,
  })

  // Propriétaires
  if (ownersCount) {
    factors.push({
      name: 'Propriétaires',
      impact: ownersCount === 1 ? 5 : ownersCount <= 2 ? 0 : -10,
      status: ownersCount === 1 ? 'good' : ownersCount <= 2 ? 'warning' : 'critical',
      description: ownersCount === 1 ? '1er propriétaire' : `${ownersCount} propriétaires`,
    })
  }

  return factors
}

/**
 * Génère le message principal
 */
function generateMessage(score: number, interventionCount: number, accidentCount: number): string {
  if (score >= 80) {
    return `Excellent historique ! ${interventionCount} interventions certifiées et aucun problème majeur détecté.`
  }
  if (score >= 60) {
    return `Bon historique avec ${interventionCount} interventions enregistrées. Quelques points d'attention à surveiller.`
  }
  if (score >= 40) {
    return `Historique moyen. ${accidentCount > 0 ? `${accidentCount} accident(s) déclaré(s) et ` : ''}des interventions à compléter.`
  }
  return `Historique limité ou problématique. Plusieurs points nécessitent votre attention.`
}

/**
 * Génère les recommandations
 */
function generateRecommendations(
  score: number,
  technicalControl?: any,
  insurance?: any,
  oilChangeCount?: number
): string[] {
  const recommendations: string[] = []

  if (technicalControl?.status === 'expired') {
    recommendations.push('⚠️ Contrôle technique expiré - À renouveler urgemment')
  } else if (technicalControl?.status === 'expiring_soon') {
    recommendations.push('📅 Contrôle technique à prévoir dans les 30 jours')
  }

  if (insurance?.status === 'expired') {
    recommendations.push('⚠️ Assurance expirée - Non conforme')
  } else if (insurance?.status === 'expiring_soon') {
    recommendations.push('📅 Assurance à renouveler prochainement')
  }

  if (oilChangeCount && oilChangeCount < 2) {
    recommendations.push('🔧 Faites votre première vidange chez un garage OKAR')
  }

  if (score < 50) {
    recommendations.push('📊 Améliorez votre score en faisant entretenir votre véhicule régulièrement')
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Continuez à entretenir votre véhicule chez des garages OKAR')
  }

  return recommendations
}

/**
 * Helper: Formate le score pour l'affichage
 */
export function formatScore(result: ScoreResult): string {
  if (result.status === 'not_evaluated') {
    return 'NON ÉVALUÉ'
  }
  if (result.status === 'partial') {
    return `${result.score}*`
  }
  return `${result.score}/100`
}

/**
 * Helper: Retourne la couleur CSS pour le score
 */
export function getScoreColor(result: ScoreResult): string {
  switch (result.color) {
    case 'green':
      return 'text-green-600'
    case 'orange':
      return 'text-orange-500'
    case 'red':
      return 'text-red-500'
    case 'gray':
    default:
      return 'text-gray-400'
  }
}

/**
 * Helper: Retourne la classe de fond pour le score
 */
export function getScoreBgColor(result: ScoreResult): string {
  switch (result.color) {
    case 'green':
      return 'bg-green-100'
    case 'orange':
      return 'bg-orange-100'
    case 'red':
      return 'bg-red-100'
    case 'gray':
    default:
      return 'bg-gray-100'
  }
}
