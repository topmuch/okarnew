/**
 * OKAR - API de Diagnostic et Réparation QR Code
 * 
 * GET /api/debug/qr-activate-test - Test complet du flux d'activation
 * POST /api/debug/qr-activate-test - Créer un QR de test et l'activer
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes, scryptSync } from 'crypto'

function generateTestCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'OKAR-DEBUG-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const testActivation = searchParams.get('test') === 'true'
  
  try {
    // Statistiques globales
    const stats = await Promise.all([
      db.qRCode.count(),
      db.qRCode.count({ where: { status: 'stock' } }),
      db.qRCode.count({ where: { status: 'active' } }),
      db.qRCode.count({ where: { status: 'lost' } }),
      db.vehicle.count(),
      db.user.count(),
    ])
    
    // QR codes orphelins (actif sans véhicule)
    const orphanQRs = await db.qRCode.findMany({
      where: {
        status: 'active',
        vehicleId: null,
      },
      select: {
        id: true,
        code: true,
        status: true,
        activatedAt: true,
      }
    })
    
    // Véhicules orphelins (sans QR code)
    const orphanVehicles = await db.vehicle.findMany({
      where: {
        qrCodeId: null,
      },
      select: {
        id: true,
        plateNumber: true,
        brand: true,
        model: true,
      }
    })
    
    // Derniers QR codes
    const recentQRs = await db.qRCode.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        status: true,
        type: true,
        vehicleId: true,
        createdAt: true,
        activatedAt: true,
      }
    })
    
    // QR codes de test
    const testQRs = await db.qRCode.findMany({
      where: {
        code: { contains: 'TEST' }
      },
      select: {
        id: true,
        code: true,
        status: true,
        vehicleId: true,
      }
    })
    
    // Si test d'activation demandé
    let testResult = null
    if (testActivation) {
      testResult = await runActivationTest()
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL,
      stats: {
        totalQRCodes: stats[0],
        stock: stats[1],
        active: stats[2],
        lost: stats[3],
        vehicles: stats[4],
        users: stats[5],
      },
      integrity: {
        orphanQRs: orphanQRs.length,
        orphanVehicles: orphanVehicles.length,
        orphanQRDetails: orphanQRs,
        orphanVehicleDetails: orphanVehicles,
      },
      testQRCodes: testQRs,
      recentQRCodes: recentQRs,
      testActivation: testResult,
    })
    
  } catch (error) {
    console.error('Erreur diagnostic:', error)
    return NextResponse.json({
      error: 'Erreur lors du diagnostic',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] Création et activation test QR Code')
    
    // 1. Créer un QR code de test
    const testCode = generateTestCode()
    console.log(`[DEBUG] Code de test: ${testCode}`)
    
    const qrCode = await db.qRCode.create({
      data: {
        code: testCode,
        lotId: 'LOT-DEBUG',
        type: 'particulier',
        status: 'stock',
      }
    })
    console.log(`[DEBUG] QR créé: ${qrCode.id}`)
    
    // 2. Simuler l'activation
    const testPlate = `TEST-${Date.now().toString(36).toUpperCase()}`
    const testEmail = `test-${Date.now()}@debug.okar`
    
    // Créer utilisateur
    const user = await db.user.create({
      data: {
        email: testEmail,
        name: 'Test Debug',
        phone: '770000000',
        passwordHash: hashPassword('test123'),
        role: 'driver',
        isApproved: true,
      }
    })
    console.log(`[DEBUG] Utilisateur créé: ${user.id}`)
    
    // Créer véhicule
    const vehicle = await db.vehicle.create({
      data: {
        plateNumber: testPlate,
        brand: 'TestBrand',
        model: 'TestModel',
        year: 2024,
        mileage: 1000,
        ownerId: user.id,
        qrCodeId: qrCode.id,
        healthScore: 100,
      }
    })
    console.log(`[DEBUG] Véhicule créé: ${vehicle.id}`)
    
    // Mettre à jour le QR
    const updatedQR = await db.qRCode.update({
      where: { id: qrCode.id },
      data: {
        status: 'active',
        vehicleId: vehicle.id,
        activatedAt: new Date(),
        activatedByName: 'Test Debug',
        activatedByEmail: testEmail,
      }
    })
    console.log(`[DEBUG] QR mis à jour: status=${updatedQR.status}, vehicleId=${updatedQR.vehicleId}`)
    
    // 3. Vérifier l'intégrité
    const verifyQR = await db.qRCode.findUnique({
      where: { code: testCode },
      include: {
        vehicle: { select: { id: true, plateNumber: true } }
      }
    })
    
    const success = verifyQR?.status === 'active' && verifyQR?.vehicleId === vehicle.id && verifyQR?.vehicle?.id === vehicle.id
    
    return NextResponse.json({
      success,
      testCode,
      testPlate,
      testEmail,
      qrCode: {
        id: qrCode.id,
        code: qrCode.code,
        status: updatedQR.status,
        vehicleId: updatedQR.vehicleId,
      },
      vehicle: {
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        qrCodeId: vehicle.qrCodeId,
      },
      verification: {
        qrFound: !!verifyQR,
        statusCorrect: verifyQR?.status === 'active',
        vehicleLinked: verifyQR?.vehicleId === vehicle.id,
        vehicleData: verifyQR?.vehicle,
      },
      message: success 
        ? '✅ Test réussi! Le QR est correctement lié au véhicule.'
        : '❌ Échec du test. Vérifiez les données.',
    })
    
  } catch (error) {
    console.error('Erreur test activation:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

async function runActivationTest() {
  try {
    // Trouver un QR en stock
    const stockQR = await db.qRCode.findFirst({
      where: { status: 'stock' },
      select: { id: true, code: true }
    })
    
    if (!stockQR) {
      return { success: false, message: 'Aucun QR en stock pour le test' }
    }
    
    // Simuler une activation rapide
    const testPlate = `TEST-${Date.now().toString(36).toUpperCase()}`
    
    // Trouver un utilisateur existant ou en créer un
    let user = await db.user.findFirst({
      where: { role: 'driver' },
      select: { id: true }
    })
    
    if (!user) {
      user = await db.user.create({
        data: {
          email: `test-${Date.now()}@okar.test`,
          name: 'Test User',
          passwordHash: hashPassword('test123'),
          role: 'driver',
          isApproved: true,
        }
      })
    }
    
    // Transaction atomique
    const result = await db.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.create({
        data: {
          plateNumber: testPlate,
          brand: 'Test',
          model: 'Activation',
          ownerId: user!.id,
          qrCodeId: stockQR.id,
          healthScore: 100,
        }
      })
      
      const updatedQR = await tx.qRCode.update({
        where: { id: stockQR.id },
        data: {
          status: 'active',
          vehicleId: vehicle.id,
          activatedAt: new Date(),
          activatedByName: 'Test',
          activatedByEmail: 'test@okar.test',
        }
      })
      
      return { vehicle, updatedQR }
    })
    
    // Vérification
    const verify = await db.qRCode.findUnique({
      where: { code: stockQR.code },
      include: { vehicle: true }
    })
    
    return {
      success: true,
      testedQR: stockQR.code,
      createdVehicle: testPlate,
      verification: {
        qrExists: !!verify,
        statusActive: verify?.status === 'active',
        vehicleLinked: verify?.vehicleId === result.vehicle.id,
        vehicleExists: !!verify?.vehicle,
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}
