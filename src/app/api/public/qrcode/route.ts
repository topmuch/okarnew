/**
 * OKAR - API Publique QR Code
 * 
 * GET /api/public/qrcode?code=OKAR-XXXXXXXX
 * 
 * Vérifie un QR code et retourne ses informations (publiques)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { found: false, message: 'Code QR requis' },
        { status: 400 }
      )
    }

    // Normaliser le code
    const normalizedCode = code.toUpperCase().trim()

    // Chercher le QR code
    const qrCode = await db.qRCode.findUnique({
      where: { code: normalizedCode },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
            year: true,
            color: true,
            mileage: true,
            healthScore: true,
            owner: {
              select: {
                name: true,
              }
            }
          }
        },
        assignedGarage: {
          select: {
            id: true,
            businessName: true,
            city: true,
          }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json({
        found: false,
        message: 'Ce QR code n\'existe pas dans notre base de données'
      })
    }

    // Retourner les infos selon le statut
    return NextResponse.json({
      found: true,
      code: qrCode.code,
      type: qrCode.type,
      status: qrCode.status,
      vehicle: qrCode.vehicle ? {
        plateNumber: qrCode.vehicle.plateNumber,
        brand: qrCode.vehicle.brand,
        model: qrCode.vehicle.model,
        year: qrCode.vehicle.year,
        color: qrCode.vehicle.color,
        mileage: qrCode.vehicle.mileage,
        healthScore: qrCode.vehicle.healthScore,
      } : null,
      garage: qrCode.assignedGarage,
      activatedAt: qrCode.activatedAt?.toISOString() || null,
    })

  } catch (error) {
    console.error('Erreur vérification QR code:', error)
    return NextResponse.json(
      { found: false, message: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
