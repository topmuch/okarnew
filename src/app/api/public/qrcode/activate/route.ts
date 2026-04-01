/**
 * OKAR - API Activation QR Code
 * 
 * POST /api/public/qrcode/activate
 * 
 * Active un QR code en créant un véhicule et optionnellement un utilisateur.
 * 
 * CORRECTIONS APPORTÉES :
 * - Transaction atomique Prisma pour garantir l'intégrité des données
 * - Mise à jour explicite du QR Code avec tous les liens
 * - Logs détaillés pour debugging
 * - Gestion des erreurs robuste avec rollback automatique
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes, scryptSync } from 'crypto'
import { calculateInsuranceStatus, calculateTechnicalCheckStatus } from '@/lib/documentStatus'

// Fonction de hashage pour les mots de passe
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('[ACTIVATE] 🚀 DÉBUT DE L\'ACTIVATION QR CODE')
  console.log('═══════════════════════════════════════════════════════════')
  
  try {
    const body = await request.json()
    console.log('[ACTIVATE] 📦 Body reçu:', JSON.stringify(body, null, 2))
    
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
      photoUrl,
      insuranceStartDate,
      insuranceEndDate,
      technicalCheckStartDate,
      technicalCheckEndDate,
      password,
    } = body

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 1 : VALIDATION DES DONNÉES
    // ═════════════════════════════════════════════════════════
    
    if (!code || !ownerEmail || !plateNumber || !brand || !model) {
      console.log('[ACTIVATE] ❌ ERREUR: Champs requis manquants')
      return NextResponse.json(
        { error: 'Informations manquantes. Code, email, plaque, marque et modèle sont requis.' },
        { status: 400 }
      )
    }

    const normalizedCode = code.toUpperCase().trim()
    const normalizedPlate = plateNumber.toUpperCase().trim()
    const normalizedEmail = ownerEmail.toLowerCase().trim()
    
    console.log(`[ACTIVATE] Code normalisé: ${normalizedCode}`)
    console.log(`[ACTIVATE] Plaque normalisée: ${normalizedPlate}`)

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 2 : VÉRIFICATION DU QR CODE
    // ═════════════════════════════════════════════════════════
    
    console.log(`[ACTIVATE] 🔍 Recherche du QR code: ${normalizedCode}`)
    const qrCode = await db.qRCode.findUnique({
      where: { code: normalizedCode },
    })

    if (!qrCode) {
      console.log(`[ACTIVATE] ❌ QR Code non trouvé: ${normalizedCode}`)
      return NextResponse.json(
        { error: 'QR code invalide', code: 'QR_NOT_FOUND' },
        { status: 400 }
      )
    }

    console.log(`[ACTIVATE] ✅ QR Code trouvé: id=${qrCode.id}, status=${qrCode.status}`)

    if (qrCode.status !== 'stock') {
      console.log(`[ACTIVATE] ⚠️ QR Code déjà utilisé: status=${qrCode.status}`)
      return NextResponse.json(
        { error: 'Ce QR code a déjà été activé', code: 'QR_ALREADY_USED' },
        { status: 400 }
      )
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 3 : VÉRIFICATION PLAQUE UNIQUE
    // ═════════════════════════════════════════════════════════
    
    console.log(`[ACTIVATE] 🔍 Vérification plaque unique: ${normalizedPlate}`)
    const existingVehicle = await db.vehicle.findUnique({
      where: { plateNumber: normalizedPlate },
    })

    if (existingVehicle) {
      console.log(`[ACTIVATE] ❌ Plaque déjà existante: ${normalizedPlate}`)
      return NextResponse.json(
        { error: 'Un véhicule avec cette plaque existe déjà', code: 'PLATE_EXISTS' },
        { status: 400 }
      )
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 4 : TRANSACTION ATOMIQUE
    // ═════════════════════════════════════════════════════════
    
    console.log('[ACTIVATE] 🔄 Démarrage de la transaction atomique...')
    
    const result = await db.$transaction(async (tx) => {
      // 4.1 : Créer ou trouver l'utilisateur
      console.log(`[ACTIVATE] 👤 Recherche/création utilisateur: ${normalizedEmail}`)
      
      let user = await tx.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (!user) {
        const tempPassword = password || randomBytes(8).toString('base64').slice(0, 12)
        const passwordHash = hashPassword(tempPassword)
        
        user = await tx.user.create({
          data: {
            email: normalizedEmail,
            name: ownerName || 'Nouveau Propriétaire',
            phone: ownerPhone || null,
            passwordHash,
            role: 'driver',
            isApproved: true,
            subscriptionStatus: 'free',
          },
        })
        console.log(`[ACTIVATE] ✅ Utilisateur créé: id=${user.id}`)
      } else {
        console.log(`[ACTIVATE] ✅ Utilisateur existant: id=${user.id}`)
      }

      // 4.2 : Parser les dates
      const insuranceStart = insuranceStartDate ? new Date(insuranceStartDate) : null
      const insuranceEnd = insuranceEndDate ? new Date(insuranceEndDate) : null
      const technicalCheckStart = technicalCheckStartDate ? new Date(technicalCheckStartDate) : null
      const technicalCheckEnd = technicalCheckEndDate ? new Date(technicalCheckEndDate) : null

      // 4.3 : Calculer les statuts
      const insuranceStatusResult = calculateInsuranceStatus(insuranceStart, insuranceEnd)
      const ctStatusResult = calculateTechnicalCheckStatus(technicalCheckStart, technicalCheckEnd)

      // 4.4 : Créer le véhicule
      console.log(`[ACTIVATE] 🚗 Création du véhicule: ${normalizedPlate}`)
      
      const vehicle = await tx.vehicle.create({
        data: {
          plateNumber: normalizedPlate,
          brand: brand.trim(),
          model: model.trim(),
          year: year ? parseInt(year) : null,
          color: color?.trim() || null,
          mileage: mileage ? parseInt(mileage) : 0,
          vin: vin?.trim() || null,
          photoUrl: photoUrl || null,
          ownerId: user.id,
          qrCodeId: qrCode.id, // ⭐ LIEN CRITIQUE
          garageId: qrCode.assignedGarageId,
          healthScore: 100,
          // Champs assurance
          insuranceStartDate: insuranceStart,
          insuranceEndDate: insuranceEnd,
          insuranceStatus: insuranceStatusResult.status,
          // Champs CT
          technicalCheckStartDate: technicalCheckStart,
          technicalCheckEndDate: technicalCheckEnd,
          technicalCheckStatus: ctStatusResult.status,
          // Compatibilité
          insuranceExpiryDate: insuranceEnd,
          technicalControlDate: technicalCheckEnd,
          technicalControlStatus: ctStatusResult.status,
        },
      })
      console.log(`[ACTIVATE] ✅ Véhicule créé: id=${vehicle.id}`)

      // 4.5 : ⭐ MISE À JOUR CRITIQUE DU QR CODE
      console.log(`[ACTIVATE] 🔄 Mise à jour du QR code: ${qrCode.id}`)
      
      const updatedQRCode = await tx.qRCode.update({
        where: { id: qrCode.id },
        data: {
          status: 'active', // ⭐ CHANGEMENT DE STATUT
          vehicleId: vehicle.id, // ⭐ LIEN VERS LE VÉHICULE
          activatedAt: new Date(),
          activatedByName: ownerName || 'Nouveau Propriétaire',
          activatedByEmail: normalizedEmail,
          activatedByPhone: ownerPhone || null,
        },
      })
      console.log(`[ACTIVATE] ✅ QR Code mis à jour: status=${updatedQRCode.status}, vehicleId=${updatedQRCode.vehicleId}`)

      // 4.6 : Créer les alertes si nécessaire
      if (insuranceStatusResult.status === 'expiring_soon' || insuranceStatusResult.status === 'expired') {
        await tx.vehicleAlert.create({
          data: {
            vehicleId: vehicle.id,
            type: 'insurance_expiry',
            message: insuranceStatusResult.status === 'expired'
              ? `Assurance expirée`
              : `Assurance expire dans ${insuranceStatusResult.daysRemaining} jours`,
            severity: insuranceStatusResult.status === 'expired' ? 'critical' : 'warning',
          },
        })
        console.log(`[ACTIVATE] ⚠️ Alerte assurance créée`)
      }

      if (ctStatusResult.status === 'expiring_soon' || ctStatusResult.status === 'expired') {
        await tx.vehicleAlert.create({
          data: {
            vehicleId: vehicle.id,
            type: 'ct_expiry',
            message: ctStatusResult.status === 'expired'
              ? `Contrôle technique expiré`
              : `Contrôle technique expire dans ${ctStatusResult.daysRemaining} jours`,
            severity: ctStatusResult.status === 'expired' ? 'critical' : 'warning',
          },
        })
        console.log(`[ACTIVATE] ⚠️ Alerte CT créée`)
      }

      // 4.7 : Log d'audit
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'QR_CODE_ACTIVATED',
          entityType: 'qrcode',
          entityId: qrCode.id,
          details: JSON.stringify({
            code: normalizedCode,
            vehiclePlate: normalizedPlate,
            vehicleId: vehicle.id,
            ownerEmail: normalizedEmail,
            ownerId: user.id,
            hasPhoto: !!photoUrl,
            hasInsuranceDates: !!(insuranceStart && insuranceEnd),
            hasCTDates: !!(technicalCheckStart && technicalCheckEnd),
          }),
        },
      })

      return { vehicle, user, qrCode: updatedQRCode }
    })

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 5 : VÉRIFICATION POST-TRANSACTION
    // ═════════════════════════════════════════════════════════
    
    console.log('[ACTIVATE] 🔍 Vérification post-transaction...')
    
    const verifyQR = await db.qRCode.findUnique({
      where: { id: result.qrCode.id },
      include: { vehicle: { select: { id: true, plateNumber: true } } }
    })
    
    if (!verifyQR || !verifyQR.vehicle) {
      console.error('[ACTIVATE] ❌ ERREUR CRITIQUE: Le lien QR-Véhicule n\'existe pas après la transaction!')
      return NextResponse.json(
        { 
          error: 'Erreur critique: Activation incomplète. Contactez le support.',
          code: 'ACTIVATION_INCOMPLETE',
          debug: { qrId: result.qrCode.id, vehicleId: result.vehicle.id }
        },
        { status: 500 }
      )
    }
    
    console.log(`[ACTIVATE] ✅ Vérification OK: QR=${verifyQR.code}, Vehicle=${verifyQR.vehicle?.plateNumber}`)

    const duration = Date.now() - startTime
    console.log(`[ACTIVATE] 🎉 SUCCÈS! Activation terminée en ${duration}ms`)
    console.log('═══════════════════════════════════════════════════════════\n')

    return NextResponse.json({
      success: true,
      vehicleId: result.vehicle.id,
      userId: result.user.id,
      qrCodeId: result.qrCode.id,
      message: 'Véhicule activé avec succès',
      documents: {
        insurance: {
          status: result.vehicle.insuranceStatus,
          daysRemaining: calculateInsuranceStatus(
            result.vehicle.insuranceStartDate,
            result.vehicle.insuranceEndDate
          ).daysRemaining,
        },
        technicalCheck: {
          status: result.vehicle.technicalCheckStatus,
          daysRemaining: calculateTechnicalCheckStatus(
            result.vehicle.technicalCheckStartDate,
            result.vehicle.technicalCheckEndDate
          ).daysRemaining,
        },
      },
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('═══════════════════════════════════════════════════════════')
    console.error('[ACTIVATE] ❌ ERREUR DURANT L\'ACTIVATION')
    console.error('[ACTIVATE] Durée avant échec:', duration, 'ms')
    console.error('[ACTIVATE] Erreur:', error)
    console.error('═══════════════════════════════════════════════════════════')
    
    // Identification du type d'erreur
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorCode = (error as any)?.code
    
    // Erreur de contrainte unique (plaque dupliquée en concurrence)
    if (errorCode === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Un véhicule avec cette plaque a été créé simultanément. Veuillez réessayer.',
          code: 'CONCURRENT_CREATION'
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'activation',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: 'ACTIVATION_ERROR'
      },
      { status: 500 }
    )
  }
}
