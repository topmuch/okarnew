/**
 * OKAR API - Driver Vehicle Info
 * Récupère les informations du véhicule du conducteur
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

    // Calculer les jours restants pour les échéances
    const now = new Date()
    const insuranceExpiry = vehicle.insuranceExpiryDate 
      ? new Date(vehicle.insuranceExpiryDate) 
      : null
    const technicalControl = vehicle.technicalControlDate 
      ? new Date(vehicle.technicalControlDate) 
      : null
    const nextOilChange = vehicle.nextOilChangeDate 
      ? new Date(vehicle.nextOilChangeDate) 
      : null

    const daysUntilInsurance = insuranceExpiry 
      ? Math.ceil((insuranceExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null

    const daysUntilCT = technicalControl 
      ? Math.ceil((technicalControl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
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
        insurance: {
          expiryDate: insuranceExpiry,
          daysRemaining: daysUntilInsurance,
          status: daysUntilInsurance !== null 
            ? daysUntilInsurance < 0 ? 'expired' 
            : daysUntilInsurance <= 15 ? 'expiring_soon' 
            : 'valid'
            : 'unknown'
        },
        technicalControl: {
          date: technicalControl,
          daysRemaining: daysUntilCT,
          status: daysUntilCT !== null 
            ? daysUntilCT < 0 ? 'expired' 
            : daysUntilCT <= 15 ? 'expiring_soon' 
            : 'valid'
            : 'unknown'
        },
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
