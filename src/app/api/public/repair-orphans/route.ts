/**
 * OKAR - API Publique de Réparation des QR Codes Orphelins
 * 
 * GET /api/public/repair-orphans - Diagnostic
 * POST /api/public/repair-orphans - Réparation
 * 
 * Répare les QR codes qui ont un statut 'active' mais pas de vehicleId
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Identifier les orphelins
    const orphanQRs = await db.qRCode.findMany({
      where: {
        status: 'active',
        vehicleId: null,
      },
      select: {
        id: true,
        code: true,
        status: true,
        lotId: true,
        type: true,
        activatedAt: true,
        activatedByEmail: true,
      }
    })
    
    // Stats générales
    const totalQRCodes = await db.qRCode.count()
    const stockCount = await db.qRCode.count({ where: { status: 'stock' } })
    const activeCount = await db.qRCode.count({ where: { status: 'active' } })
    const vehicleCount = await db.vehicle.count()
    
    // Grouper par lot
    const byLot = orphanQRs.reduce((acc, qr) => {
      const lot = qr.lotId || 'UNKNOWN'
      if (!acc[lot]) acc[lot] = []
      acc[lot].push(qr)
      return acc
    }, {} as Record<string, typeof orphanQRs>)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      stats: {
        totalQRCodes,
        stock: stockCount,
        active: activeCount,
        vehicles: vehicleCount,
      },
      integrity: {
        orphanQRs: orphanQRs.length,
        expectedActive: vehicleCount, // Devrait être égal au nombre de véhicules
        difference: activeCount - vehicleCount,
        isHealthy: orphanQRs.length === 0,
      },
      orphanDetails: orphanQRs.slice(0, 20).map(qr => ({
        code: qr.code,
        lotId: qr.lotId,
        activatedAt: qr.activatedAt,
        activatedBy: qr.activatedByEmail,
      })),
      byLot: Object.entries(byLot).map(([lotId, qrs]) => ({
        lotId,
        count: qrs.length,
      })),
      recommendation: orphanQRs.length > 0 
        ? `⚠️ ${orphanQRs.length} QR codes orphelins détectés. Exécutez POST /api/public/repair-orphans avec {"dryRun": false} pour réparer.`
        : '✅ Base de données saine!',
    })
    
  } catch (error) {
    console.error('Erreur diagnostic orphelins:', error)
    return NextResponse.json({
      error: 'Erreur lors du diagnostic',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('[REPAIR] 🔧 DÉBUT DE LA RÉPARATION DES ORPHELINS')
  console.log('═══════════════════════════════════════════════════════════')
  
  try {
    const body = await request.json().catch(() => ({}))
    const dryRun = body.dryRun !== false // Par défaut, dryRun = true pour sécurité
    
    // 1. Identifier les orphelins
    console.log('[REPAIR] 🔍 Recherche des QR codes orphelins...')
    const orphanQRs = await db.qRCode.findMany({
      where: {
        status: 'active',
        vehicleId: null,
      },
      select: {
        id: true,
        code: true,
        lotId: true,
      }
    })
    
    console.log(`[REPAIR] 📊 Trouvé: ${orphanQRs.length} QR codes orphelins`)
    
    if (orphanQRs.length === 0) {
      return NextResponse.json({
        success: true,
        message: '✅ Aucun QR code orphelin trouvé. Base de données saine!',
        repaired: 0,
      })
    }
    
    // 2. Mode dry-run (simulation)
    if (dryRun) {
      console.log('[REPAIR] 🔄 Mode DRY-RUN - Aucune modification effectuée')
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `🔍 Simulation: ${orphanQRs.length} QR codes seraient réparés`,
        wouldRepair: orphanQRs.length,
        affectedCodes: orphanQRs.slice(0, 10).map(q => q.code),
        note: 'Exécutez avec { "dryRun": false } pour appliquer les réparations',
      })
    }
    
    // 3. Réparation réelle
    console.log('[REPAIR] 🔧 Réparation en cours...')
    
    const result = await db.$transaction(async (tx) => {
      // Remettre les orphelins en statut 'stock'
      const updateResult = await tx.qRCode.updateMany({
        where: {
          status: 'active',
          vehicleId: null,
        },
        data: {
          status: 'stock',
          activatedAt: null,
          activatedByName: null,
          activatedByEmail: null,
          activatedByPhone: null,
        }
      })
      
      // Log d'audit
      await tx.auditLog.create({
        data: {
          action: 'ORPHAN_QR_REPAIR',
          entityType: 'qrcode',
          entityId: 'batch',
          details: JSON.stringify({
            count: updateResult.count,
            repairedAt: new Date().toISOString(),
          }),
        }
      })
      
      return updateResult
    })
    
    console.log(`[REPAIR] ✅ ${result.count} QR codes réparés`)
    console.log('═══════════════════════════════════════════════════════════\n')
    
    return NextResponse.json({
      success: true,
      message: `✅ ${result.count} QR codes orphelins réparés avec succès!`,
      repaired: result.count,
      details: 'Les QR codes ont été remis en statut "stock" et peuvent maintenant être utilisés.',
      repairedCodes: orphanQRs.slice(0, 10).map(q => q.code),
    })
    
  } catch (error) {
    console.error('[REPAIR] ❌ Erreur:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la réparation',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}
