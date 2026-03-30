/**
 * OKAR - Garage Interventions API
 * CRUD pour les interventions du garage
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/interventions - Liste des interventions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // all, en_cours, historique
    const type = searchParams.get('type') || 'all'
    const garageId = searchParams.get('garageId') || 'demo-garage-id'

    // Si pas de garage en base, retourner des données de démo
    const garage = await db.garage.findUnique({ where: { id: garageId } })
    if (!garage) {
      return NextResponse.json({
        success: true,
        data: getDemoInterventions(status)
      })
    }

    // Construire les filtres
    const whereClause: any = { garageId }
    
    if (status === 'en_cours') {
      whereClause.status = { in: ['pending', 'in_progress'] }
    } else if (status === 'historique') {
      whereClause.status = { in: ['validated', 'rejected'] }
    }
    
    if (type !== 'all') {
      whereClause.type = type
    }

    const interventions = await db.maintenanceRecord.findMany({
      where: whereClause,
      include: {
        vehicle: {
          include: {
            owner: {
              select: { name: true, phone: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const formatted = interventions.map(intervention => ({
      id: intervention.id,
      vehicle: {
        plateNumber: intervention.vehicle.plateNumber,
        brand: intervention.vehicle.brand,
        model: intervention.vehicle.model,
        owner: intervention.vehicle.owner.name,
        ownerPhone: intervention.vehicle.owner.phone
      },
      type: intervention.type,
      title: intervention.title,
      description: intervention.description,
      mileage: intervention.mileage,
      cost: intervention.cost,
      status: intervention.status,
      isOwnerValidated: intervention.isOwnerValidated,
      createdAt: intervention.createdAt,
      validationDate: intervention.validationDate
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error('Erreur récupération interventions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des interventions' },
      { status: 500 }
    )
  }
}

// POST /api/garage/interventions - Créer une intervention
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      garageId,
      vehicleId,
      type,
      title,
      description,
      mileage,
      cost,
      oilType,
      oilQuantity,
      parts,
      photos,
      invoiceUrl
    } = body

    if (!garageId || !vehicleId || !type || !mileage || !cost) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      )
    }

    const intervention = await db.maintenanceRecord.create({
      data: {
        vehicleId,
        garageId,
        createdByUserId: 'system', // TODO: récupérer l'utilisateur connecté
        type,
        title: title || getInterventionTitle(type),
        description,
        mileage: parseInt(mileage),
        cost: parseFloat(cost),
        oilType,
        oilQuantity,
        parts: parts ? JSON.stringify(parts) : null,
        photos: photos ? JSON.stringify(photos) : null,
        invoiceUrl,
        status: 'pending'
      }
    })

    // Mettre à jour le kilométrage du véhicule
    await db.vehicle.update({
      where: { id: vehicleId },
      data: { mileage: parseInt(mileage) }
    })

    return NextResponse.json({ success: true, data: intervention })
  } catch (error) {
    console.error('Erreur création intervention:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'intervention' },
      { status: 500 }
    )
  }
}

// PUT /api/garage/interventions - Mettre à jour le statut
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { interventionId, status, validationNotes } = body

    if (!interventionId || !status) {
      return NextResponse.json(
        { success: false, error: 'ID et statut requis' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      validationNotes
    }

    if (status === 'validated') {
      updateData.validationDate = new Date()
      updateData.isOwnerValidated = true
      updateData.ownerValidationDate = new Date()
    }

    const intervention = await db.maintenanceRecord.update({
      where: { id: interventionId },
      data: updateData
    })

    return NextResponse.json({ success: true, data: intervention })
  } catch (error) {
    console.error('Erreur mise à jour intervention:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

function getInterventionTitle(type: string): string {
  const titles: Record<string, string> = {
    oil_change: 'Vidange',
    maintenance: 'Entretien courant',
    major_repair: 'Réparation majeure',
    accident: 'Réparation carrosserie',
    inspection: 'Contrôle technique',
    tire_change: 'Changement de pneus',
    battery: 'Remplacement batterie'
  }
  return titles[type] || 'Intervention'
}

// Données de démo
function getDemoInterventions(status: string) {
  const allInterventions = [
    {
      id: '1',
      vehicle: {
        plateNumber: 'DK-409-HN',
        brand: 'Toyota',
        model: 'Corolla',
        owner: 'Ahmed Fall',
        ownerPhone: '77 123 45 67'
      },
      type: 'oil_change',
      title: 'Vidange moteur',
      description: 'Vidange complète avec filtre',
      mileage: 125000,
      cost: 45000,
      status: 'in_progress',
      isOwnerValidated: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      validationDate: null
    },
    {
      id: '2',
      vehicle: {
        plateNumber: 'DK-123-AB',
        brand: 'Renault',
        model: 'Logan',
        owner: 'Fatou Diop',
        ownerPhone: '78 234 56 78'
      },
      type: 'major_repair',
      title: 'Réparation freins',
      description: 'Remplacement plaquettes et disques avant',
      mileage: 89000,
      cost: 120000,
      status: 'pending',
      isOwnerValidated: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      validationDate: null
    },
    {
      id: '3',
      vehicle: {
        plateNumber: 'DK-789-XY',
        brand: 'Peugeot',
        model: '208',
        owner: 'Moussa Sow',
        ownerPhone: '76 345 67 89'
      },
      type: 'inspection',
      title: 'Contrôle technique',
      description: 'Diagnostic complet',
      mileage: 67000,
      cost: 15000,
      status: 'validated',
      isOwnerValidated: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      validationDate: new Date(Date.now() - 20 * 60 * 60 * 1000)
    },
    {
      id: '4',
      vehicle: {
        plateNumber: 'DK-456-CD',
        brand: 'Mercedes',
        model: 'Classe C',
        owner: 'Aminata Ndiaye',
        ownerPhone: '77 456 78 90'
      },
      type: 'accident',
      title: 'Réparation aile avant',
      description: 'Remplacement aile et peinture',
      mileage: 45000,
      cost: 350000,
      status: 'validated',
      isOwnerValidated: true,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      validationDate: new Date(Date.now() - 48 * 60 * 60 * 1000)
    },
    {
      id: '5',
      vehicle: {
        plateNumber: 'DK-999-ZZ',
        brand: 'BMW',
        model: 'Série 3',
        owner: 'Ibrahima Ba',
        ownerPhone: '78 567 89 01'
      },
      type: 'oil_change',
      title: 'Vidange',
      description: 'Vidange huile synthèse',
      mileage: 78000,
      cost: 65000,
      status: 'rejected',
      isOwnerValidated: false,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      validationDate: null
    }
  ]

  if (status === 'en_cours') {
    return allInterventions.filter(i => ['pending', 'in_progress'].includes(i.status))
  } else if (status === 'historique') {
    return allInterventions.filter(i => ['validated', 'rejected'].includes(i.status))
  }
  return allInterventions
}
