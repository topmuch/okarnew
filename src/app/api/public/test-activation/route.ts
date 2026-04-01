/**
 * OKAR - API Test Activation avec Debug Détaillé
 * 
 * GET /api/public/test-activation - Teste l'activation et retourne l'erreur exacte
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes, scryptSync } from 'crypto'
import { calculateInsuranceStatus, calculateTechnicalCheckStatus } from '@/lib/documentStatus'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export async function GET() {
  const debug: any = { steps: [], error: null }

  try {
    // Étape 1: Trouver un QR code en stock
    debug.steps.push({ step: 'Finding QR code in stock...' })
    const qrCode = await db.qRCode.findFirst({
      where: { status: 'stock' }
    })

    if (!qrCode) {
      debug.steps.push({ step: 'No QR code in stock', success: false })
      return NextResponse.json({ debug, message: 'No QR code available' })
    }
    debug.steps.push({ step: 'Found QR code', success: true, code: qrCode.code })

    // Étape 2: Créer un utilisateur test
    debug.steps.push({ step: 'Creating test user...' })
    const testEmail = `test-${Date.now()}@debug.okar`
    const passwordHash = hashPassword('test123')

    let user
    try {
      user = await db.user.create({
        data: {
          email: testEmail,
          name: 'Debug Test User',
          passwordHash,
          role: 'driver',
          isApproved: true,
          subscriptionStatus: 'free',
        }
      })
      debug.steps.push({ step: 'User created', success: true, userId: user.id })
    } catch (e: any) {
      debug.steps.push({ step: 'User creation failed', success: false, error: e.message, code: e.code })
      return NextResponse.json({ debug })
    }

    // Étape 3: Calculer les statuts
    debug.steps.push({ step: 'Calculating document statuses...' })
    const insuranceStatus = calculateInsuranceStatus(null, null)
    const ctStatus = calculateTechnicalCheckStatus(null, null)
    debug.steps.push({ step: 'Statuses calculated', success: true, insurance: insuranceStatus.status, ct: ctStatus.status })

    // Étape 4: Créer le véhicule
    debug.steps.push({ step: 'Creating vehicle...' })
    const testPlate = `TEST-${Date.now().toString().slice(-6)}`

    let vehicle
    try {
      vehicle = await db.vehicle.create({
        data: {
          plateNumber: testPlate,
          brand: 'Test Brand',
          model: 'Test Model',
          year: 2020,
          color: 'Blanc',
          mileage: 50000,
          ownerId: user.id,
          qrCodeId: qrCode.id,
          healthScore: 100,
          insuranceStatus: insuranceStatus.status,
          technicalCheckStatus: ctStatus.status,
        }
      })
      debug.steps.push({ step: 'Vehicle created', success: true, vehicleId: vehicle.id, plate: testPlate })
    } catch (e: any) {
      debug.steps.push({ step: 'Vehicle creation failed', success: false, error: e.message, code: e.code, meta: e.meta })
      return NextResponse.json({ debug })
    }

    // Étape 5: Mettre à jour le QR code
    debug.steps.push({ step: 'Updating QR code...' })
    try {
      const updatedQR = await db.qRCode.update({
        where: { id: qrCode.id },
        data: {
          status: 'active',
          vehicleId: vehicle.id,
          activatedAt: new Date(),
          activatedByName: 'Debug Test',
          activatedByEmail: testEmail,
        }
      })
      debug.steps.push({ step: 'QR code updated', success: true, status: updatedQR.status, vehicleId: updatedQR.vehicleId })
    } catch (e: any) {
      debug.steps.push({ step: 'QR code update failed', success: false, error: e.message, code: e.code })
      return NextResponse.json({ debug })
    }

    // Étape 6: Vérifier le lien
    debug.steps.push({ step: 'Verifying link...' })
    const verify = await db.qRCode.findUnique({
      where: { id: qrCode.id },
      include: { vehicle: true }
    })
    debug.steps.push({ step: 'Verification complete', success: true, linked: !!verify?.vehicle })

    // Nettoyer - supprimer les données de test
    debug.steps.push({ step: 'Cleaning up test data...' })
    try {
      await db.qRCode.update({
        where: { id: qrCode.id },
        data: {
          status: 'stock',
          vehicleId: null,
          activatedAt: null,
          activatedByName: null,
          activatedByEmail: null,
        }
      })
      await db.vehicle.delete({ where: { id: vehicle.id } })
      await db.user.delete({ where: { id: user.id } })
      debug.steps.push({ step: 'Cleanup done', success: true })
    } catch (e: any) {
      debug.steps.push({ step: 'Cleanup failed', success: false, error: e.message })
    }

    return NextResponse.json({
      success: true,
      debug,
      message: '✅ Toutes les étapes passent! Le problème vient des données envoyées par le frontend.'
    })

  } catch (error: any) {
    debug.error = {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 5)
    }
    return NextResponse.json({
      success: false,
      debug,
      message: '❌ Erreur détectée'
    }, { status: 500 })
  }
}
