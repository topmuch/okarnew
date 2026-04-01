/**
 * OKAR - API de Recherche Publique
 * 
 * GET /api/public/search?plate=AA-1234-AA
 * 
 * Permet de rechercher un véhicule par plaque sans authentification.
 * Retourne des informations basiques (teasing) pour inciter à acheter le rapport complet.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const plate = searchParams.get('plate')

    if (!plate || plate.trim().length < 2) {
      return NextResponse.json(
        { error: 'Numéro de plaque requis (minimum 2 caractères)' },
        { status: 400 }
      )
    }

    // Normaliser la plaque (majuscules, sans espaces)
    const normalizedPlate = plate.toUpperCase().replace(/\s+/g, '-')

    // Pour SQLite, on utilise une requête raw pour la recherche insensible à la casse
    // car Prisma avec SQLite ne supporte pas bien le mode 'insensitive'
    const vehicles = await db.$queryRaw<any[]>`
      SELECT 
        v.id, v.plateNumber, v.brand, v.model, v.year, v.color, 
        v.mileage, v.healthScore, v.technicalControlStatus, v.insuranceStatus,
        v.estimatedValue, v.resaleScore, v.createdAt,
        v.qrCodeId, v.garageId, v.ownerId
      FROM Vehicle v
      WHERE UPPER(v.plateNumber) LIKE UPPER('%' || ${normalizedPlate} || '%')
      LIMIT 1
    `

    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({
        found: false,
        plate: normalizedPlate,
        message: 'Aucun véhicule trouvé avec ce numéro de plaque'
      })
    }

    const vehicle = vehicles[0]

    // Récupérer les relations séparément
    const [qrCode, owner, garage, maintenanceCount, transfersCount] = await Promise.all([
      vehicle.qrCodeId ? db.qRCode.findUnique({
        where: { id: vehicle.qrCodeId },
        select: { type: true, status: true, activatedAt: true }
      }) : null,
      db.user.findUnique({
        where: { id: vehicle.ownerId },
        select: { name: true }
      }),
      vehicle.garageId ? db.garage.findUnique({
        where: { id: vehicle.garageId },
        select: { businessName: true, city: true }
      }) : null,
      db.maintenanceRecord.count({ where: { vehicleId: vehicle.id } }),
      db.vehicleTransfer.count({ where: { vehicleId: vehicle.id } })
    ])

    // Retourner les informations de teasing (gratuit)
    // Les informations sensibles ne sont PAS incluses
    return NextResponse.json({
      found: true,
      plate: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      healthScore: vehicle.healthScore,
      mileage: vehicle.mileage,
      // Infos teasing
      totalInterventions: maintenanceCount,
      qrType: qrCode?.type || 'particulier',
      // Statuts (sans dates précises)
      technicalControlStatus: vehicle.technicalControlStatus,
      insuranceStatus: vehicle.insuranceStatus,
      // Indiquer si suivi par un garage
      followedByGarage: !!garage,
      garageCity: garage?.city || null,
      // Date de création du dossier (ancienneté)
      trackedSince: vehicle.createdAt?.toISOString() || new Date().toISOString(),
      // Nombre de propriétaires précédents
      previousOwners: transfersCount,
      // Valeur estimée (optionnel)
      estimatedValue: vehicle.estimatedValue || null,
      resaleScore: vehicle.resaleScore || null,
    })

  } catch (error) {
    console.error('Erreur lors de la recherche publique:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
