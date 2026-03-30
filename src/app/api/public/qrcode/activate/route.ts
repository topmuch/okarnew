/**
 * OKAR - API Activation QR Code
 * 
 * POST /api/public/qrcode/activate
 * 
 * Active un QR code en créant un véhicule et optionnellement un utilisateur.
 * Supporte les nouveaux champs de dates pour Assurance et Contrôle Technique.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/auth'
import { randomBytes } from 'crypto'
import { calculateInsuranceStatus, calculateTechnicalCheckStatus } from '@/lib/documentStatus'

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
      color,
      mileage,
      vin,
      // Nouveaux champs de dates
      insuranceStartDate,
      insuranceEndDate,
      technicalCheckStartDate,
      technicalCheckEndDate,
      createAccount = false,
      password,
    } = body

    // Validation des champs requis
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

    // Parser les dates et calculer les statuts
    const insuranceStart = insuranceStartDate ? new Date(insuranceStartDate) : null
    const insuranceEnd = insuranceEndDate ? new Date(insuranceEndDate) : null
    const technicalCheckStart = technicalCheckStartDate ? new Date(technicalCheckStartDate) : null
    const technicalCheckEnd = technicalCheckEndDate ? new Date(technicalCheckEndDate) : null

    // Calculer les statuts automatiquement
    const insuranceStatusResult = calculateInsuranceStatus(insuranceStart, insuranceEnd)
    const ctStatusResult = calculateTechnicalCheckStatus(technicalCheckStart, technicalCheckEnd)

    // Créer le véhicule avec les nouveaux champs
    const vehicle = await db.vehicle.create({
      data: {
        plateNumber: plateNumber.toUpperCase(),
        brand,
        model,
        year: year ? parseInt(year) : null,
        color: color || null,
        mileage: mileage ? parseInt(mileage) : 0,
        vin: vin || null,
        ownerId: user.id,
        qrCodeId: qrCode.id,
        garageId: qrCode.assignedGarageId,
        healthScore: 100, // Score initial parfait
        // Nouveaux champs assurance
        insuranceStartDate: insuranceStart,
        insuranceEndDate: insuranceEnd,
        insuranceStatus: insuranceStatusResult.status,
        // Nouveaux champs CT
        technicalCheckStartDate: technicalCheckStart,
        technicalCheckEndDate: technicalCheckEnd,
        technicalCheckStatus: ctStatusResult.status,
        // Compatibilité avec anciens champs
        insuranceExpiryDate: insuranceEnd,
        technicalControlDate: technicalCheckEnd,
        technicalControlStatus: ctStatusResult.status,
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

    // Créer des alertes si nécessaire
    if (insuranceStatusResult.status === 'expiring_soon' || insuranceStatusResult.status === 'expired') {
      await db.vehicleAlert.create({
        data: {
          vehicleId: vehicle.id,
          type: 'insurance_expiry',
          message: insuranceStatusResult.status === 'expired'
            ? `Assurance expirée depuis le ${insuranceEnd?.toLocaleDateString('fr-FR') || 'N/A'}`
            : `Assurance expire dans ${insuranceStatusResult.daysRemaining} jours`,
          severity: insuranceStatusResult.status === 'expired' ? 'critical' : 'warning',
        },
      })
    }

    if (ctStatusResult.status === 'expiring_soon' || ctStatusResult.status === 'expired') {
      await db.vehicleAlert.create({
        data: {
          vehicleId: vehicle.id,
          type: 'ct_expiry',
          message: ctStatusResult.status === 'expired'
            ? `Contrôle technique expiré depuis le ${technicalCheckEnd?.toLocaleDateString('fr-FR') || 'N/A'}`
            : `Contrôle technique expire dans ${ctStatusResult.daysRemaining} jours`,
          severity: ctStatusResult.status === 'expired' ? 'critical' : 'warning',
        },
      })
    }

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
          hasInsuranceDates: !!(insuranceStart && insuranceEnd),
          hasCTDates: !!(technicalCheckStart && technicalCheckEnd),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      vehicleId: vehicle.id,
      userId: user.id,
      message: 'Véhicule activé avec succès',
      documents: {
        insurance: {
          status: insuranceStatusResult.status,
          daysRemaining: insuranceStatusResult.daysRemaining,
        },
        technicalCheck: {
          status: ctStatusResult.status,
          daysRemaining: ctStatusResult.daysRemaining,
        },
      },
    })

  } catch (error) {
    console.error('Erreur activation QR code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'activation' },
      { status: 500 }
    )
  }
}
