/**
 * OKAR - Utilitaire de Calcul de Statut des Documents
 * 
 * Ce module fournit des fonctions pour calculer et afficher
 * le statut des documents administratifs (Assurance, Contrôle Technique).
 * 
 * Règles métier :
 * - EXPIRÉ : Date de fin < Date du jour
 * - BIENTÔT EXPIRÉ : Date de fin < J+30 jours
 * - VALIDE : Date de fin >= J+30 jours
 * - INCONNU : Pas de date de fin
 */

// Types
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired' | 'unknown'
export type SeverityLevel = 'success' | 'warning' | 'error' | 'info'

export interface DocumentStatusResult {
  status: DocumentStatus
  isValid: boolean
  daysRemaining: number | null
  label: string
  color: string
  bgColor: string
  borderColor: string
  severity: SeverityLevel
  icon: 'check' | 'alert' | 'error' | 'unknown'
}

// Seuils de notification (en jours)
const WARNING_THRESHOLD = 30  // Alerte orange si < 30 jours
const CRITICAL_THRESHOLD = 0  // Alerte rouge si < 0 jours (expiré)

/**
 * Calcule le statut d'un document basé sur ses dates
 * 
 * @param startDate - Date de début du document (optionnel)
 * @param endDate - Date de fin du document
 * @returns Objet DocumentStatusResult avec toutes les infos d'affichage
 */
export function calculateDocumentStatus(
  startDate: Date | string | null,
  endDate: Date | string | null
): DocumentStatusResult {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Normaliser à minuit pour comparer les dates

  // Pas de date de fin -> statut inconnu
  if (!endDate) {
    return {
      status: 'unknown',
      isValid: false,
      daysRemaining: null,
      label: 'Non renseigné',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      severity: 'info',
      icon: 'unknown',
    }
  }

  // Convertir en Date si string
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  end.setHours(23, 59, 59, 999) // Fin de journée

  // Calculer les jours restants
  const diffTime = end.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Déterminer le statut
  if (daysRemaining < CRITICAL_THRESHOLD) {
    return {
      status: 'expired',
      isValid: false,
      daysRemaining,
      label: 'EXPIRÉ',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      severity: 'error',
      icon: 'error',
    }
  }

  if (daysRemaining <= WARNING_THRESHOLD) {
    return {
      status: 'expiring_soon',
      isValid: true,
      daysRemaining,
      label: `Expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      severity: 'warning',
      icon: 'alert',
    }
  }

  return {
    status: 'valid',
    isValid: true,
    daysRemaining,
    label: 'Valide',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    severity: 'success',
    icon: 'check',
  }
}

/**
 * Calcule le statut de l'assurance
 */
export function calculateInsuranceStatus(
  startDate: Date | string | null,
  endDate: Date | string | null
): DocumentStatusResult {
  return calculateDocumentStatus(startDate, endDate)
}

/**
 * Calcule le statut du contrôle technique
 */
export function calculateTechnicalCheckStatus(
  startDate: Date | string | null,
  endDate: Date | string | null
): DocumentStatusResult {
  return calculateDocumentStatus(startDate, endDate)
}

/**
 * Formate une date pour l'affichage
 * 
 * @param date - Date à formater
 * @param format - Format de sortie ('short' | 'long' | 'relative')
 */
export function formatDateForDisplay(
  date: Date | string | null,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  if (!date) return '—'

  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    const now = new Date()
    const diffTime = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Il y a ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`
    }
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Demain'
    return `Dans ${diffDays} jours`
  }

  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' }

  return d.toLocaleDateString('fr-FR', options)
}

/**
 * Vérifie si un véhicule a des documents à surveiller
 * et génère les alertes appropriées
 */
export function checkVehicleDocuments(vehicle: {
  insuranceStartDate?: Date | string | null
  insuranceEndDate?: Date | string | null
  technicalCheckStartDate?: Date | string | null
  technicalCheckEndDate?: Date | string | null
}): {
  hasWarnings: boolean
  hasErrors: boolean
  alerts: Array<{
    type: 'insurance' | 'technical_check'
    severity: SeverityLevel
    message: string
    daysRemaining: number | null
  }>
} {
  const alerts: Array<{
    type: 'insurance' | 'technical_check'
    severity: SeverityLevel
    message: string
    daysRemaining: number | null
  }> = []

  // Vérifier l'assurance
  const insuranceStatus = calculateInsuranceStatus(
    vehicle.insuranceStartDate || null,
    vehicle.insuranceEndDate || null
  )

  if (insuranceStatus.status !== 'valid') {
    alerts.push({
      type: 'insurance',
      severity: insuranceStatus.severity,
      message: insuranceStatus.status === 'expired'
        ? 'Assurance expirée'
        : insuranceStatus.status === 'expiring_soon'
        ? `Assurance : expire dans ${insuranceStatus.daysRemaining} jours`
        : 'Assurance non renseignée',
      daysRemaining: insuranceStatus.daysRemaining,
    })
  }

  // Vérifier le contrôle technique
  const ctStatus = calculateTechnicalCheckStatus(
    vehicle.technicalCheckStartDate || null,
    vehicle.technicalCheckEndDate || null
  )

  if (ctStatus.status !== 'valid') {
    alerts.push({
      type: 'technical_check',
      severity: ctStatus.severity,
      message: ctStatus.status === 'expired'
        ? 'Contrôle technique expiré'
        : ctStatus.status === 'expiring_soon'
        ? `CT : expire dans ${ctStatus.daysRemaining} jours`
        : 'Contrôle technique non renseigné',
      daysRemaining: ctStatus.daysRemaining,
    })
  }

  return {
    hasWarnings: alerts.some(a => a.severity === 'warning'),
    hasErrors: alerts.some(a => a.severity === 'error'),
    alerts,
  }
}

/**
 * Génère un résumé textuel des statuts
 */
export function getDocumentsSummary(vehicle: {
  insuranceStartDate?: Date | string | null
  insuranceEndDate?: Date | string | null
  technicalCheckStartDate?: Date | string | null
  technicalCheckEndDate?: Date | string | null
}): string {
  const insurance = calculateInsuranceStatus(
    vehicle.insuranceStartDate || null,
    vehicle.insuranceEndDate || null
  )
  const ct = calculateTechnicalCheckStatus(
    vehicle.technicalCheckStartDate || null,
    vehicle.technicalCheckEndDate || null
  )

  const parts: string[] = []

  if (insurance.status === 'valid') {
    parts.push(`Assurance OK (${insurance.daysRemaining}j)`)
  } else if (insurance.status === 'expiring_soon') {
    parts.push(`Assurance: ${insurance.daysRemaining}j restants`)
  } else if (insurance.status === 'expired') {
    parts.push('Assurance EXPIRÉE')
  }

  if (ct.status === 'valid') {
    parts.push(`CT OK (${ct.daysRemaining}j)`)
  } else if (ct.status === 'expiring_soon') {
    parts.push(`CT: ${ct.daysRemaining}j restants`)
  } else if (ct.status === 'expired') {
    parts.push('CT EXPIRÉ')
  }

  return parts.join(' • ') || 'Documents non renseignés'
}

// Export par défaut
export default {
  calculateDocumentStatus,
  calculateInsuranceStatus,
  calculateTechnicalCheckStatus,
  formatDateForDisplay,
  checkVehicleDocuments,
  getDocumentsSummary,
}
