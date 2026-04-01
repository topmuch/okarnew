/**
 * OKAR API - Driver Vehicle Transfer
 * Génère et gère les codes de transfert de propriété
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Générer un code à 6 chiffres unique
function generateTransferCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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
        transfers: {
          where: { usedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Aucun véhicule trouvé' },
        { status: 404 }
      )
    }

    // Vérifier s'il y a un code actif
    const activeTransfer = vehicle.transfers.find(
      t => t.expiresAt > new Date() && !t.usedAt
    )

    if (activeTransfer) {
      const remainingTime = Math.ceil(
        (activeTransfer.expiresAt.getTime() - Date.now()) / (1000 * 60)
      )
      return NextResponse.json({
        hasActiveCode: true,
        code: activeTransfer.code,
        expiresAt: activeTransfer.expiresAt,
        remainingMinutes: remainingTime
      })
    }

    return NextResponse.json({
      hasActiveCode: false
    })
  } catch (error) {
    console.error('Erreur récupération transfert:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      where: { ownerId: userId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Aucun véhicule trouvé' },
        { status: 404 }
      )
    }

    // Vérifier s'il y a déjà un code actif
    const existingTransfer = await db.vehicleTransfer.findFirst({
      where: {
        vehicleId: vehicle.id,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    })

    if (existingTransfer) {
      return NextResponse.json({
        success: true,
        code: existingTransfer.code,
        expiresAt: existingTransfer.expiresAt,
        message: 'Un code actif existe déjà'
      })
    }

    // Générer un nouveau code
    let code = generateTransferCode()
    let attempts = 0
    
    // S'assurer que le code est unique
    while (attempts < 10) {
      const existing = await db.vehicleTransfer.findUnique({
        where: { code }
      })
      if (!existing) break
      code = generateTransferCode()
      attempts++
    }

    // Créer le transfert (expire dans 24h)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const transfer = await db.vehicleTransfer.create({
      data: {
        vehicleId: vehicle.id,
        code,
        fromUserId: userId,
        expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      code: transfer.code,
      expiresAt: transfer.expiresAt,
      message: 'Code de transfert généré avec succès'
    })
  } catch (error) {
    console.error('Erreur génération transfert:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Code de transfert requis' },
        { status: 400 }
      )
    }

    // Vérifier le code de transfert
    const transfer = await db.vehicleTransfer.findUnique({
      where: { code },
      include: { vehicle: true }
    })

    if (!transfer) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 404 }
      )
    }

    if (transfer.usedAt) {
      return NextResponse.json(
        { error: 'Ce code a déjà été utilisé' },
        { status: 400 }
      )
    }

    if (transfer.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Ce code a expiré' },
        { status: 400 }
      )
    }

    // Effectuer le transfert
    await db.$transaction([
      // Mettre à jour le véhicule
      db.vehicle.update({
        where: { id: transfer.vehicleId },
        data: { 
          ownerId: userId,
          updatedAt: new Date()
        }
      }),
      // Marquer le transfert comme utilisé
      db.vehicleTransfer.update({
        where: { id: transfer.id },
        data: { 
          toUserId: userId,
          usedAt: new Date()
        }
      }),
      // Créer une alerte
      db.vehicleAlert.create({
        data: {
          vehicleId: transfer.vehicleId,
          type: 'maintenance_due',
          message: 'Véhicule transféré avec succès',
          severity: 'info',
          isRead: false
        }
      })
    ])

    return NextResponse.json({
      success: true,
      vehicle: {
        id: transfer.vehicle.id,
        plateNumber: transfer.vehicle.plateNumber,
        brand: transfer.vehicle.brand,
        model: transfer.vehicle.model
      },
      message: 'Véhicule transféré avec succès!'
    })
  } catch (error) {
    console.error('Erreur utilisation transfert:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
