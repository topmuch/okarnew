/**
 * OKAR - API Publique QR Code
 * 
 * GET /api/public/qrcode?code=OKAR-XXXXXXXX
 * 
 * Vérifie un QR code et retourne ses informations (publiques)
 * 
 * CORRECTIONS APPORTÉES :
 * - Recherche le QR Code QUEL QUE SOIT son statut (stock, active, lost)
 * - Vérifie l'intégrité du lien QR-Véhicule
 * - Gère les cas d'erreur "orphelins" (QR actif sans véhicule)
 * - Logs détaillés pour debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('\n[QR-CHECK] ═════════════════════════════════════════════')
  console.log('[QR-CHECK] 🔍 DÉBUT DE LA VÉRIFICATION QR CODE')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    console.log(`[QR-CHECK] Code reçu: "${code}"`)

    if (!code) {
      console.log('[QR-CHECK] ❌ Erreur: Code QR requis')
      return NextResponse.json(
        { 
          found: false, 
          message: 'Code QR requis',
          code: 'MISSING_CODE'
        },
        { status: 400 }
      )
    }

    // Normaliser le code
    const normalizedCode = code.toUpperCase().trim()
    console.log(`[QR-CHECK] Code normalisé: "${normalizedCode}"`)

    // ═════════════════════════════════════════════════════════
    // RECHERCHE DU QR CODE - TOUS STATUTS CONFONDUS
    // ═════════════════════════════════════════════════════════
    
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
            photoUrl: true,
            owner: {
              select: {
                id: true,
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
            phone: true,
          }
        }
      }
    })

    // ═════════════════════════════════════════════════════════
    // CAS 1 : QR CODE NON TROUVÉ
    // ═════════════════════════════════════════════════════════
    
    if (!qrCode) {
      console.log(`[QR-CHECK] ❌ QR Code non trouvé: ${normalizedCode}`)
      
      // Debug: afficher les stats
      const stats = await Promise.all([
        db.qRCode.count(),
        db.qRCode.count({ where: { status: 'stock' } }),
        db.qRCode.count({ where: { status: 'active' } }),
      ])
      console.log(`[QR-CHECK] Stats DB: ${stats[0]} total, ${stats[1]} stock, ${stats[2]} active`)
      
      return NextResponse.json({
        found: false,
        message: 'Ce QR code n\'existe pas. Vérifiez le code ou contactez un garage partenaire OKAR.',
        hint: 'Codes de test disponibles: OKAR-TEST001, OKAR-TEST002, OKAR-TEST003',
        code: 'QR_NOT_FOUND',
        debug: process.env.NODE_ENV === 'development' ? {
          normalizedCode,
          stats: { total: stats[0], stock: stats[1], active: stats[2] }
        } : undefined
      })
    }

    console.log(`[QR-CHECK] ✅ QR Code trouvé: id=${qrCode.id}, status=${qrCode.status}`)

    // ═════════════════════════════════════════════════════════
    // CAS 2 : QR CODE PERDUE
    // ═════════════════════════════════════════════════════════
    
    if (qrCode.status === 'lost') {
      console.log(`[QR-CHECK] ⚠️ QR Code signalé perdu`)
      return NextResponse.json({
        found: true,
        code: qrCode.code,
        type: qrCode.type,
        status: 'lost',
        message: 'Ce QR code a été signalé comme perdu.',
      })
    }

    // ═════════════════════════════════════════════════════════
    // CAS 3 : QR CODE EN STOCK (Non activé)
    // ═════════════════════════════════════════════════════════
    
    if (qrCode.status === 'stock') {
      console.log(`[QR-CHECK] 📦 QR Code en stock - Formulaire d'activation requis`)
      
      const duration = Date.now() - startTime
      console.log(`[QR-CHECK] ✅ Retour stock en ${duration}ms`)
      
      return NextResponse.json({
        found: true,
        code: qrCode.code,
        type: qrCode.type,
        status: 'stock',
        vehicle: null,
        garage: qrCode.assignedGarage,
        message: 'QR Code disponible pour activation',
      })
    }

    // ═════════════════════════════════════════════════════════
    // CAS 4 : QR CODE ACTIF
    // ═════════════════════════════════════════════════════════
    
    if (qrCode.status === 'active') {
      // Vérifier l'intégrité du lien véhicule
      if (!qrCode.vehicle) {
        console.error(`[QR-CHECK] ❌ ERREUR: QR Code actif SANS véhicule lié (id=${qrCode.id})`)
        
        // Tenter de récupérer le véhicule via qrCodeId
        const orphanVehicle = await db.vehicle.findFirst({
          where: { qrCodeId: qrCode.id },
          select: { id: true, plateNumber: true }
        })
        
        if (orphanVehicle) {
          console.log(`[QR-CHECK] 🔧 RÉPARATION: Véhicule orphelin trouvé: ${orphanVehicle.plateNumber}`)
          // Réparer le lien
          await db.qRCode.update({
            where: { id: qrCode.id },
            data: { vehicleId: orphanVehicle.id }
          })
          // Recharger
          const fixedQR = await db.qRCode.findUnique({
            where: { id: qrCode.id },
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
                }
              }
            }
          })
          
          if (fixedQR?.vehicle) {
            return NextResponse.json({
              found: true,
              code: fixedQR.code,
              type: fixedQR.type,
              status: 'active',
              vehicle: {
                plateNumber: fixedQR.vehicle.plateNumber,
                brand: fixedQR.vehicle.brand,
                model: fixedQR.vehicle.model,
                year: fixedQR.vehicle.year,
                color: fixedQR.vehicle.color,
                mileage: fixedQR.vehicle.mileage,
                healthScore: fixedQR.vehicle.healthScore,
              },
              garage: qrCode.assignedGarage,
              activatedAt: fixedQR.activatedAt?.toISOString() || null,
              _repaired: true,
            })
          }
        }
        
        return NextResponse.json({
          found: true,
          code: qrCode.code,
          type: qrCode.type,
          status: 'active',
          vehicle: null,
          error: 'QR Code actif mais véhicule non lié. Contactez le support.',
          code: 'ORPHAN_QR',
          garage: qrCode.assignedGarage,
        })
      }

      console.log(`[QR-CHECK] ✅ Véhicule lié: ${qrCode.vehicle.plateNumber}`)
      
      const duration = Date.now() - startTime
      console.log(`[QR-CHECK] ✅ Retour actif en ${duration}ms`)
      
      return NextResponse.json({
        found: true,
        code: qrCode.code,
        type: qrCode.type,
        status: 'active',
        vehicle: {
          plateNumber: qrCode.vehicle.plateNumber,
          brand: qrCode.vehicle.brand,
          model: qrCode.vehicle.model,
          year: qrCode.vehicle.year,
          color: qrCode.vehicle.color,
          mileage: qrCode.vehicle.mileage,
          healthScore: qrCode.vehicle.healthScore,
          photoUrl: qrCode.vehicle.photoUrl,
        },
        garage: qrCode.assignedGarage,
        activatedAt: qrCode.activatedAt?.toISOString() || null,
        owner: qrCode.vehicle.owner ? {
          name: qrCode.vehicle.owner.name,
        } : null,
      })
    }

    // ═════════════════════════════════════════════════════════
    // CAS PAR DÉFAUT : Statut inconnu
    // ═════════════════════════════════════════════════════════
    
    console.log(`[QR-CHECK] ⚠️ Statut inconnu: ${qrCode.status}`)
    
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
    const duration = Date.now() - startTime
    console.error(`[QR-CHECK] ❌ Erreur après ${duration}ms:`, error)
    
    return NextResponse.json(
      { 
        found: false, 
        message: 'Erreur lors de la vérification',
        code: 'CHECK_ERROR',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Erreur inconnue')
          : undefined
      },
      { status: 500 }
    )
  }
}
