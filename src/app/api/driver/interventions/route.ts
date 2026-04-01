/**
 * OKAR API - Driver Interventions
 * Récupère l'historique des interventions du véhicule
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'validated', 'all'
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le véhicule du conducteur
    const vehicle = await db.vehicle.findFirst({
      where: { ownerId: userId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Aucun véhicule trouvé' },
        { status: 404 }
      )
    }

    // Construire le filtre
    const where: { vehicleId: string; status?: string } = { vehicleId: vehicle.id }
    if (status && status !== 'all') {
      where.status = status
    }

    // Récupérer les interventions
    const interventions = await db.maintenanceRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        garage: {
          select: {
            id: true,
            businessName: true,
            address: true,
            city: true,
            rating: true
          }
        }
      }
    })

    // Grouper par type pour les statistiques
    const stats = {
      total: interventions.length,
      validated: interventions.filter(i => i.status === 'validated').length,
      pending: interventions.filter(i => i.status === 'pending').length,
      rejected: interventions.filter(i => i.status === 'rejected').length,
      byType: {
        oil_change: interventions.filter(i => i.type === 'oil_change').length,
        major_repair: interventions.filter(i => i.type === 'major_repair').length,
        accident: interventions.filter(i => i.type === 'accident').length,
        tire_change: interventions.filter(i => i.type === 'tire_change').length,
        battery: interventions.filter(i => i.type === 'battery').length,
        inspection: interventions.filter(i => i.type === 'inspection').length
      }
    }

    // Calculer l'évolution du kilométrage
    const mileageHistory = interventions
      .filter(i => i.mileage > 0)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(i => ({
        date: i.createdAt,
        mileage: i.mileage,
        type: i.type
      }))

    // Détecter les anomalies de kilométrage (possible fraude)
    const mileageAnomalies: { date: Date; from: number; to: number }[] = []
    for (let i = 1; i < mileageHistory.length; i++) {
      if (mileageHistory[i].mileage < mileageHistory[i - 1].mileage) {
        mileageAnomalies.push({
          date: mileageHistory[i].date,
          from: mileageHistory[i - 1].mileage,
          to: mileageHistory[i].mileage
        })
      }
    }

    return NextResponse.json({
      interventions: interventions.map(i => ({
        id: i.id,
        type: i.type,
        title: i.title,
        description: i.description,
        mileage: i.mileage,
        cost: i.cost,
        status: i.status,
        isOwnerValidated: i.isOwnerValidated,
        createdAt: i.createdAt,
        validationDate: i.validationDate,
        garage: i.garage,
        oilType: i.oilType,
        oilQuantity: i.oilQuantity,
        parts: i.parts ? JSON.parse(i.parts) : [],
        photos: i.photos ? JSON.parse(i.photos) : [],
        invoiceUrl: i.invoiceUrl
      })),
      stats,
      mileageHistory,
      mileageAnomalies
    })
  } catch (error) {
    console.error('Erreur récupération interventions:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
