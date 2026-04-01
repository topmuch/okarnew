/**
 * OKAR - API Activation QR Code
 * 
 * POST /api/public/qrcode/activate
 * 
 * Active un QR code en créant une demande d'activation en attente.
 * Le superadmin devra valider la demande avant que le compte utilisateur
 * et le véhicule soient créés.
 * 
 * Flux:
 * 1. Utilisateur scanne le QR code
 * 2. Remplit le formulaire d'activation
 * 3. Crée une demande PendingActivation
 * 4. Affiche message de succès: "Votre demande a été envoyée, en cours de traitement. 
 *    Vous recevrez vos identifiants par WhatsApp."
 * 5. Superadmin valide et crée le compte utilisateur
 * 6. Les identifiants sont envoyés par WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('[ACTIVATE] 🚀 DÉBUT DE LA DEMANDE D\'ACTIVATION')
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
    } = body

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 1 : VALIDATION DES DONNÉES
    // ═════════════════════════════════════════════════════════
    
    if (!code || !ownerEmail || !plateNumber || !brand || !model || !ownerName || !ownerPhone) {
      console.log('[ACTIVATE] ❌ ERREUR: Champs requis manquants')
      return NextResponse.json(
        { error: 'Informations manquantes. Code, nom, email, téléphone, plaque, marque et modèle sont requis.' },
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
      include: {
        pendingActivation: true,
        vehicle: true
      }
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

    // Vérifier s'il y a déjà une demande en attente pour ce QR code
    if (qrCode.pendingActivation && qrCode.pendingActivation.status === 'pending') {
      console.log(`[ACTIVATE] ⚠️ Demande déjà en attente pour ce QR code`)
      return NextResponse.json({
        success: true,
        pending: true,
        message: 'Votre demande est déjà en cours de traitement. Vous recevrez vos identifiants par WhatsApp.',
        pendingActivationId: qrCode.pendingActivation.id,
      })
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

    // Vérifier aussi les demandes en attente avec cette plaque
    const existingPendingPlate = await db.pendingActivation.findFirst({
      where: {
        plateNumber: normalizedPlate,
        status: 'pending'
      }
    })

    if (existingPendingPlate) {
      console.log(`[ACTIVATE] ❌ Demande déjà en attente pour cette plaque: ${normalizedPlate}`)
      return NextResponse.json(
        { error: 'Une demande d\'activation pour cette plaque est déjà en cours de traitement', code: 'PLATE_PENDING' },
        { status: 400 }
      )
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 4 : CRÉATION DE LA DEMANDE D'ACTIVATION
    // ═════════════════════════════════════════════════════════
    
    console.log('[ACTIVATE] 🔄 Création de la demande d\'activation en attente...')
    
    // Parser les dates
    const insuranceStart = insuranceStartDate ? new Date(insuranceStartDate) : null
    const insuranceEnd = insuranceEndDate ? new Date(insuranceEndDate) : null
    const technicalCheckStart = technicalCheckStartDate ? new Date(technicalCheckStartDate) : null
    const technicalCheckEnd = technicalCheckEndDate ? new Date(technicalCheckEndDate) : null

    const pendingActivation = await db.pendingActivation.create({
      data: {
        qrCodeId: qrCode.id,
        code: normalizedCode,
        ownerName: ownerName.trim(),
        ownerEmail: normalizedEmail,
        ownerPhone: ownerPhone?.trim() || null,
        plateNumber: normalizedPlate,
        brand: brand.trim(),
        model: model.trim(),
        year: year ? parseInt(year) : null,
        color: color?.trim() || null,
        mileage: mileage ? parseInt(mileage) : 0,
        vin: vin?.trim() || null,
        photoUrl: photoUrl || null,
        insuranceStartDate: insuranceStart,
        insuranceEndDate: insuranceEnd,
        technicalCheckStartDate: technicalCheckStart,
        technicalCheckEndDate: technicalCheckEnd,
        assignedGarageId: qrCode.assignedGarageId,
        status: 'pending',
      },
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        action: 'PENDING_ACTIVATION_CREATED',
        entityType: 'pending_activation',
        entityId: pendingActivation.id,
        details: JSON.stringify({
          code: normalizedCode,
          plateNumber: normalizedPlate,
          ownerEmail: normalizedEmail,
          ownerPhone: ownerPhone,
          hasPhoto: !!photoUrl,
          hasInsuranceDates: !!(insuranceStart && insuranceEnd),
          hasCTDates: !!(technicalCheckStart && technicalCheckEnd),
        }),
      },
    })

    const duration = Date.now() - startTime
    console.log(`[ACTIVATE] ✅ SUCCÈS! Demande créée en ${duration}ms`)
    console.log(`[ACTIVATE] 📋 ID: ${pendingActivation.id}`)
    console.log('═══════════════════════════════════════════════════════════\n')

    return NextResponse.json({
      success: true,
      pending: true,
      pendingActivationId: pendingActivation.id,
      message: 'Votre demande a été envoyée, en cours de traitement. Vous recevrez vos identifiants par WhatsApp.',
      data: {
        plateNumber: normalizedPlate,
        brand: brand.trim(),
        model: model.trim(),
        ownerEmail: normalizedEmail,
        ownerPhone: ownerPhone,
      },
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('═══════════════════════════════════════════════════════════')
    console.error('[ACTIVATE] ❌ ERREUR DURANT LA DEMANDE')
    console.error('[ACTIVATE] Durée avant échec:', duration, 'ms')
    console.error('[ACTIVATE] Erreur:', error)
    console.error('═══════════════════════════════════════════════════════════')
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorCode = (error as any)?.code
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la demande d\'activation',
        details: errorMessage,
        errorCode: errorCode,
        code: 'ACTIVATION_ERROR'
      },
      { status: 500 }
    )
  }
}
