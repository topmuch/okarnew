/**
 * OKAR - API Activation QR Code
 * 
 * POST /api/public/qrcode/activate
 * 
 * Active un QR code en créant un véhicule et optionnellement un utilisateur
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/auth'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      ownerName,
      ownerEmail,
      ownerPhone,
      plateNumber,
      brand,
      model,
      year,
      createAccount = false,
      password,
    } = body

    // Validation
    if (!code || !ownerEmail || !plateNumber || !brand || !model) {
      return NextResponse.json(
        { error: 'Informations manquantes. Code, email, plaque, marque et modèle sont requis.' },
        { status: 400 }
      )
    }

    // Vérifier le QR code
    const qrCode = await db.qRCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code invalide' },
        { status: 400 }
      )
    }

    if (qrCode.status !== 'stock') {
      return NextResponse.json(
        { error: 'Ce QR code a déjà été activé' },
        { status: 400 }
      )
    }

    // Vérifier si la plaque existe déjà
    const existingVehicle = await db.vehicle.findUnique({
      where: { plateNumber: plateNumber.toUpperCase() },
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Un véhicule avec cette plaque existe déjà' },
        { status: 400 }
      )
    }

    // Créer ou trouver l'utilisateur
    let user = await db.user.findUnique({
      where: { email: ownerEmail.toLowerCase() },
    })

    if (!user) {
      // Générer un mot de passe temporaire si non fourni
      const tempPassword = password || randomBytes(8).toString('base64').slice(0, 12)
      const passwordHash = hashPassword(tempPassword)

      user = await db.user.create({
        data: {
          email: ownerEmail.toLowerCase(),
          name: ownerName,
          phone: ownerPhone,
          passwordHash,
          role: 'driver',
          isApproved: true,
          subscriptionStatus: 'free',
        },
      })
    }

    // Créer le véhicule
    const vehicle = await db.vehicle.create({
      data: {
        plateNumber: plateNumber.toUpperCase(),
        brand,
        model,
        year: year ? parseInt(year) : null,
        ownerId: user.id,
        qrCodeId: qrCode.id,
        garageId: qrCode.assignedGarageId,
        healthScore: 100, // Score initial parfait
      },
    })

    // Mettre à jour le QR code
    await db.qRCode.update({
      where: { id: qrCode.id },
      data: {
        status: 'active',
        activatedAt: new Date(),
        activatedByName: ownerName,
        activatedByEmail: ownerEmail.toLowerCase(),
        activatedByPhone: ownerPhone,
      },
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'QR_CODE_ACTIVATED',
        entityType: 'qrcode',
        entityId: qrCode.id,
        details: JSON.stringify({
          code: qrCode.code,
          vehiclePlate: plateNumber,
          ownerEmail: ownerEmail,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      vehicleId: vehicle.id,
      userId: user.id,
      message: 'Véhicule activé avec succès',
    })

  } catch (error) {
    console.error('Erreur activation QR code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'activation' },
      { status: 500 }
    )
  }
}
