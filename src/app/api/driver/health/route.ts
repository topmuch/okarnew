/**
 * OKAR API - Driver Vehicle Health Score
 * Calcule le score de santé du véhicule basé sur plusieurs facteurs
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le véhicule du conducteur
    const vehicle = await db.vehicle.findFirst({
      where: { ownerId: userId },
      include: {
        maintenanceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Aucun véhicule trouvé' },
        { status: 404 }
      )
    }

    const now = new Date()
    
    // Calculer le score de santé
    let healthScore = 100
    let factors: { name: string; impact: number; status: 'good' | 'warning' | 'critical' }[] = []

    // 1. Assurance (impact: -30 points si expirée, -15 si proche)
    if (vehicle.insuranceExpiryDate) {
      const daysUntilInsurance = Math.ceil(
        (new Date(vehicle.insuranceExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilInsurance < 0) {
        healthScore -= 30
        factors.push({ name: 'Assurance', impact: -30, status: 'critical' })
      } else if (daysUntilInsurance <= 15) {
        healthScore -= 15
        factors.push({ name: 'Assurance', impact: -15, status: 'warning' })
      } else {
        factors.push({ name: 'Assurance', impact: 0, status: 'good' })
      }
    }

    // 2. Contrôle Technique (impact: -25 points si expiré, -10 si proche)
    if (vehicle.technicalControlDate) {
      const daysUntilCT = Math.ceil(
        (new Date(vehicle.technicalControlDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilCT < 0) {
        healthScore -= 25
        factors.push({ name: 'Contrôle Technique', impact: -25, status: 'critical' })
      } else if (daysUntilCT <= 15) {
        healthScore -= 10
        factors.push({ name: 'Contrôle Technique', impact: -10, status: 'warning' })
      } else {
        factors.push({ name: 'Contrôle Technique', impact: 0, status: 'good' })
      }
    }

    // 3. Vidange (impact: -15 points si en retard)
    if (vehicle.nextOilChangeDate) {
      const daysUntilOil = Math.ceil(
        (new Date(vehicle.nextOilChangeDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilOil < 0) {
        healthScore -= 15
        factors.push({ name: 'Vidange', impact: -15, status: 'critical' })
      } else if (daysUntilOil <= 15) {
        healthScore -= 5
        factors.push({ name: 'Vidange', impact: -5, status: 'warning' })
      } else {
        factors.push({ name: 'Vidange', impact: 0, status: 'good' })
      }
    }

    // 4. Régularité des entretiens (bonus/malus)
    const maintenanceCount = vehicle.maintenanceHistory.length
    const recentMaintenance = vehicle.maintenanceHistory.filter(
      m => (now.getTime() - new Date(m.createdAt).getTime()) < 365 * 24 * 60 * 60 * 1000
    ).length
    
    if (recentMaintenance >= 3) {
      // Bonus pour entretien régulier
      healthScore = Math.min(100, healthScore + 5)
      factors.push({ name: 'Entretien régulier', impact: 5, status: 'good' })
    } else if (recentMaintenance < 1 && maintenanceCount > 0) {
      // Malus pour manque d'entretien
      healthScore -= 10
      factors.push({ name: 'Entretien', impact: -10, status: 'warning' })
    }

    // S'assurer que le score est entre 0 et 100
    healthScore = Math.max(0, Math.min(100, healthScore))

    // Déterminer le statut global
    let status: 'good' | 'warning' | 'critical' = 'good'
    if (healthScore < 40) {
      status = 'critical'
    } else if (healthScore < 70) {
      status = 'warning'
    }

    // Message explicatif
    let message = ''
    if (status === 'good') {
      message = 'Votre véhicule est en excellent état. Continuez à l\'entretenir régulièrement!'
    } else if (status === 'warning') {
      message = 'Quelques points nécessitent votre attention. Consultez les échéances à venir.'
    } else {
      message = 'Des actions urgentes sont requises. Vérifiez les alertes et prenez rendez-vous.'
    }

    return NextResponse.json({
      health: {
        score: healthScore,
        status,
        message,
        factors,
        maintenanceCount,
        recentMaintenanceCount: recentMaintenance
      }
    })
  } catch (error) {
    console.error('Erreur calcul santé:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
