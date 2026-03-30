/**
 * OKAR API - Driver Vehicle Info
 * 
 * GET /api/driver/vehicle
 * 
 * Récupère les informations du véhicule du conducteur connecté.
 * Utilise les nouveaux champs de dates pour calculer les statuts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  calculateInsuranceStatus, 
  calculateTechnicalCheckStatus,
  checkVehicleDocuments 
} from '@/lib/documentStatus'

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
        qrCode: true,
        alerts: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Aucun véhicule trouvé' },
        { status: 404 }
      )
    }

    // Calculer les statuts avec les nouveaux champs
    const insuranceStatus = calculateInsuranceStatus(
      vehicle.insuranceStartDate || vehicle.insuranceExpiryDate, // Fallback pour compatibilité
      vehicle.insuranceEndDate || vehicle.insuranceExpiryDate
    )

    const technicalCheckStatus = calculateTechnicalCheckStatus(
      vehicle.technicalCheckStartDate || vehicle.technicalControlDate,
      vehicle.technicalCheckEndDate || vehicle.technicalControlDate
    )

    // Vérifier les documents et générer les alertes
    const documentCheck = checkVehicleDocuments({
      insuranceStartDate: vehicle.insuranceStartDate,
      insuranceEndDate: vehicle.insuranceEndDate,
      technicalCheckStartDate: vehicle.technicalCheckStartDate,
      technicalCheckEndDate: vehicle.technicalCheckEndDate,
    })

    // Calculer les jours restants pour le prochain vidange
    const now = new Date()
    const nextOilChange = vehicle.nextOilChangeDate 
      ? new Date(vehicle.nextOilChangeDate) 
      : null

    const daysUntilOilChange = nextOilChange 
      ? Math.ceil((nextOilChange.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
      : null

    return NextResponse.json({
      vehicle: {
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        mileage: vehicle.mileage,
        healthScore: vehicle.healthScore,
        qrCode: vehicle.qrCode?.code || null,
        
        // Assurance avec statut calculé
        insurance: {
          startDate: vehicle.insuranceStartDate || vehicle.insuranceExpiryDate,
          endDate: vehicle.insuranceEndDate || vehicle.insuranceExpiryDate,
          daysRemaining: insuranceStatus.daysRemaining,
          status: insuranceStatus.status,
          label: insuranceStatus.label,
          isValid: insuranceStatus.isValid,
          color: insuranceStatus.color,
          bgColor: insuranceStatus.bgColor,
        },
        
        // Contrôle Technique avec statut calculé
        technicalControl: {
          startDate: vehicle.technicalCheckStartDate || vehicle.technicalControlDate,
          endDate: vehicle.technicalCheckEndDate || vehicle.technicalControlDate,
          daysRemaining: technicalCheckStatus.daysRemaining,
          status: technicalCheckStatus.status,
          label: technicalCheckStatus.label,
          isValid: technicalCheckStatus.isValid,
          color: technicalCheckStatus.color,
          bgColor: technicalCheckStatus.bgColor,
        },
        
        // Vidange
        oilChange: {
          nextDate: nextOilChange,
          nextMileage: vehicle.nextOilChangeMileage,
          daysRemaining: daysUntilOilChange,
          status: daysUntilOilChange !== null 
            ? daysUntilOilChange < 0 ? 'overdue' 
            : daysUntilOilChange <= 15 ? 'due_soon' 
            : 'ok'
            : 'unknown'
        },
        
        // Alerte documents
        documentAlerts: documentCheck.alerts,
        hasDocumentWarnings: documentCheck.hasWarnings,
        hasDocumentErrors: documentCheck.hasErrors,
        
        // Alertes générales
        alerts: vehicle.alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          createdAt: alert.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Erreur récupération véhicule:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
