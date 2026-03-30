/**
 * OKAR API - Driver Intervention Validation
 * Valide ou rejette une intervention proposée par un garage
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { interventionId, action, notes } = body

    if (!interventionId || !action) {
      return NextResponse.json(
        { error: 'ID intervention et action requis' },
        { status: 400 }
      )
    }

    if (!['validate', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide (validate ou reject)' },
        { status: 400 }
      )
    }

    // Vérifier que l'intervention existe et appartient au véhicule du conducteur
    const vehicle = await db.vehicle.findFirst({
      where: { ownerId: userId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Aucun véhicule trouvé' },
        { status: 404 }
      )
    }

    const intervention = await db.maintenanceRecord.findFirst({
      where: {
        id: interventionId,
        vehicleId: vehicle.id
      }
    })

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    if (intervention.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cette intervention a déjà été traitée' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut de l'intervention
    const updatedIntervention = await db.maintenanceRecord.update({
      where: { id: interventionId },
      data: {
        status: action === 'validate' ? 'validated' : 'rejected',
        isOwnerValidated: action === 'validate',
        ownerValidationDate: new Date(),
        validationDate: new Date(),
        validationNotes: notes || null
      }
    })

    // Si validée, mettre à jour le kilométrage du véhicule si supérieur
    if (action === 'validate' && intervention.mileage > vehicle.mileage) {
      await db.vehicle.update({
        where: { id: vehicle.id },
        data: {
          mileage: intervention.mileage,
          updatedAt: new Date()
        }
      })
    }

    // Recalculer le score de santé du véhicule
    if (action === 'validate') {
      const allInterventions = await db.maintenanceRecord.count({
        where: {
          vehicleId: vehicle.id,
          status: 'validated'
        }
      })
      
      // Bonus de score pour chaque intervention validée
      const newScore = Math.min(100, vehicle.healthScore + 2)
      await db.vehicle.update({
        where: { id: vehicle.id },
        data: { healthScore: newScore }
      })
    }

    // Créer une alerte de notification
    await db.vehicleAlert.create({
      data: {
        vehicleId: vehicle.id,
        type: 'maintenance_due',
        message: action === 'validate' 
          ? `Intervention "${intervention.title}" validée avec succès`
          : `Intervention "${intervention.title}" rejetée`,
        severity: action === 'validate' ? 'info' : 'warning',
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      intervention: {
        id: updatedIntervention.id,
        status: updatedIntervention.status,
        validatedAt: updatedIntervention.validationDate
      },
      message: action === 'validate' 
        ? 'Intervention validée avec succès! Votre carnet est mis à jour.'
        : 'Intervention rejetée. Le garage en sera informé.'
    })
  } catch (error) {
    console.error('Erreur validation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
