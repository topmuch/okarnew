/**
 * OKAR - API d'initialisation des données de test
 * 
 * POST /api/superadmin/init-test-data
 * 
 * Crée les QR codes de test et un super admin si nécessaire.
 * Utile pour initialiser un environnement de production.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes, scryptSync } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const results = {
      superAdmin: { created: false, message: '' },
      qrCodes: { created: 0, existing: 0, total: 0 },
    }

    // 1. Créer le super admin s'il n'existe pas
    const existingAdmin = await db.user.findUnique({
      where: { email: 'superadmin@okar.sn' }
    })

    if (!existingAdmin) {
      const salt = randomBytes(16).toString('hex')
      const hash = scryptSync('admin123', salt, 64).toString('hex')
      const passwordHash = `${salt}:${hash}`

      await db.user.create({
        data: {
          email: 'superadmin@okar.sn',
          passwordHash,
          name: 'Super Admin',
          phone: '770000000',
          role: 'superadmin',
          isApproved: true,
          subscriptionStatus: 'premium',
        }
      })
      results.superAdmin = { created: true, message: 'superadmin@okar.sn / admin123' }
    } else {
      results.superAdmin = { created: false, message: 'Existe déjà' }
    }

    // 2. Créer les QR codes de test
    const testCodes = ['OKAR-TEST001', 'OKAR-TEST002', 'OKAR-TEST003']
    
    for (const code of testCodes) {
      const existing = await db.qRCode.findUnique({ where: { code } })
      if (existing) {
        results.qrCodes.existing++
      } else {
        await db.qRCode.create({
          data: {
            code,
            lotId: 'LOT-TEST',
            type: 'particulier',
            status: 'stock',
          }
        })
        results.qrCodes.created++
      }
      results.qrCodes.total++
    }

    // 3. Créer un garage de test si aucun garage n'existe
    const existingGarages = await db.garage.count()
    
    if (existingGarages === 0) {
      // Créer l'utilisateur garage
      const salt = randomBytes(16).toString('hex')
      const hash = scryptSync('garage123', salt, 64).toString('hex')
      const passwordHash = `${salt}:${hash}`

      const garageUser = await db.user.create({
        data: {
          email: 'garage@okar.sn',
          passwordHash,
          name: 'Garage Test',
          phone: '771234567',
          role: 'garage_certified',
          isApproved: true,
          subscriptionStatus: 'premium',
        }
      })

      // Créer le garage
      await db.garage.create({
        data: {
          userId: garageUser.id,
          businessName: 'Garage OKAR Test',
          address: 'Dakar, Sénégal',
          city: 'Dakar',
          phone: '771234567',
          isActive: true,
          rating: 4.5,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Données de test initialisées',
      results,
      testCredentials: {
        superAdmin: { email: 'superadmin@okar.sn', password: 'admin123' },
        garage: { email: 'garage@okar.sn', password: 'garage123' },
        testQRCodes: testCodes,
      }
    })

  } catch (error) {
    console.error('Erreur initialisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation', details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Vérifier l'état actuel
  const stats = await Promise.all([
    db.user.count({ where: { role: 'superadmin' } }),
    db.garage.count(),
    db.qRCode.count({ where: { status: 'stock' } }),
    db.qRCode.count({ where: { code: { in: ['OKAR-TEST001', 'OKAR-TEST002', 'OKAR-TEST003'] } } }),
  ])

  return NextResponse.json({
    status: 'OK',
    counts: {
      superAdmins: stats[0],
      garages: stats[1],
      qrCodesInStock: stats[2],
      testQRCodes: stats[3],
    },
    needsInit: stats[3] < 3, // Besoin d'initialisation si moins de 3 QR codes de test
  })
}
