/**
 * OKAR - QR Code Check API
 * Vérifie le statut d'un QR code et retourne les informations associées
 * 
 * Scénarios:
 * - QR vierge (stock) → Retourne qrId pour activation
 * - QR actif → Retourne les infos du véhicule
 * - QR non attribué au garage → Erreur
 * - QR invalide/perdu → Erreur
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/qrcodes/check?code=OKAR-XXX-XXX
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const garageId = searchParams.get('garageId') || 'demo-garage-id'

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code QR requis' },
        { status: 400 }
      )
    }

    // Rechercher le QR code
    const qrCode = await db.qRCode.findUnique({
      where: { code },
      include: {
        vehicle: {
          include: {
            owner: {
              select: { name: true, phone: true, email: true }
            },
            maintenanceHistory: {
              where: { status: 'validated' },
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: {
                id: true,
                type: true,
                title: true,
                createdAt: true,
                mileage: true
              }
            }
          }
        },
        assignedGarage: {
          select: { id: true, businessName: true }
        }
      }
    })

    // QR code non trouvé
    if (!qrCode) {
      return NextResponse.json({
        success: false,
        status: 'invalid',
        error: 'QR code non trouvé dans le système'
      })
    }

    // QR code marqué comme perdu
    if (qrCode.status === 'lost') {
      return NextResponse.json({
        success: false,
        status: 'invalid',
        error: 'Ce QR code a été signalé comme perdu'
      })
    }

    // Vérifier si le QR appartient au garage
    if (qrCode.assignedGarageId && qrCode.assignedGarageId !== garageId) {
      return NextResponse.json({
        success: false,
        status: 'not_yours',
        error: 'Ce QR code appartient à un autre garage',
        assignedTo: qrCode.assignedGarage?.businessName
      })
    }

    // QR code en stock - prêt à activer
    if (qrCode.status === 'stock') {
      return NextResponse.json({
        success: true,
        status: 'valid_stock',
        data: {
          qrId: qrCode.id,
          code: qrCode.code,
          lotId: qrCode.lotId,
          createdAt: qrCode.createdAt
        }
      })
    }

    // QR code actif - retourner les infos du véhicule
    if (qrCode.status === 'active' && qrCode.vehicle) {
      const vehicle = qrCode.vehicle
      
      return NextResponse.json({
        success: true,
        status: 'active_vehicle',
        data: {
          qrId: qrCode.id,
          code: qrCode.code,
          vehicle: {
            id: vehicle.id,
            plateNumber: vehicle.plateNumber,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            mileage: vehicle.mileage,
            healthScore: vehicle.healthScore,
            technicalControlDate: vehicle.technicalControlDate,
            technicalControlStatus: vehicle.technicalControlStatus,
            insuranceExpiryDate: vehicle.insuranceExpiryDate,
            insuranceStatus: vehicle.insuranceStatus,
            owner: {
              name: vehicle.owner.name,
              phone: vehicle.owner.phone,
              email: vehicle.owner.email
            },
            recentHistory: vehicle.maintenanceHistory
          }
        }
      })
    }

    // Cas par défaut
    return NextResponse.json({
      success: false,
      status: 'unknown',
      error: 'Statut du QR code non reconnu'
    })

  } catch (error) {
    console.error('Erreur vérification QR:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification du QR code' },
      { status: 500 }
    )
  }
}
