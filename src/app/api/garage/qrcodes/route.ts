/**
 * OKAR - Garage QR Codes API
 * Gestion du stock QR du garage
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/qrcodes - Stock QR du garage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const garageId = searchParams.get('garageId') || 'demo-garage-id'
    const status = searchParams.get('status') || 'all' // all, stock, active

    const garage = await db.garage.findUnique({ 
      where: { id: garageId }
    })
    
    if (!garage) {
      return NextResponse.json({
        success: true,
        data: getDemoQRCodes()
      })
    }

    const whereClause: any = { assignedGarageId: garageId }
    if (status !== 'all') {
      whereClause.status = status
    }

    const qrCodes = await db.qRCode.findMany({
      where: whereClause,
      include: {
        vehicle: {
          select: {
            plateNumber: true,
            brand: true,
            model: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const formatted = qrCodes.map(qr => ({
      id: qr.id,
      code: qr.code,
      lotId: qr.lotId,
      status: qr.status,
      activatedByName: qr.activatedByName,
      activatedByPhone: qr.activatedByPhone,
      activatedAt: qr.activatedAt,
      vehicle: qr.vehicle ? {
        plateNumber: qr.vehicle.plateNumber,
        brand: qr.vehicle.brand,
        model: qr.vehicle.model
      } : null,
      createdAt: qr.createdAt
    }))

    // Statistiques
    const total = await db.qRCode.count({ where: { assignedGarageId: garageId } })
    const stock = await db.qRCode.count({ 
      where: { assignedGarageId: garageId, status: 'stock' } 
    })
    const active = await db.qRCode.count({ 
      where: { assignedGarageId: garageId, status: 'active' } 
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        qrCodes: formatted,
        stats: {
          total,
          stock,
          active,
          percentage: total > 0 ? Math.round((active / total) * 100) : 0
        }
      }
    })
  } catch (error) {
    console.error('Erreur récupération QR codes:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des QR codes' },
      { status: 500 }
    )
  }
}

// POST /api/garage/qrcodes - Commander un nouveau lot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { garageId, quantity } = body

    if (!garageId || !quantity || quantity < 10) {
      return NextResponse.json(
        { success: false, error: 'Quantité minimum: 10 QR codes' },
        { status: 400 }
      )
    }

    // Générer un lot ID unique
    const lotId = `LOT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Créer les QR codes (simulation - en production, cela serait généré par le superadmin)
    const qrCodes = []
    for (let i = 0; i < quantity; i++) {
      const code = `OKAR-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      qrCodes.push({
        code,
        lotId,
        type: 'garage',
        status: 'stock',
        assignedGarageId: garageId
      })
    }

    // Insérer en base
    await db.qRCode.createMany({
      data: qrCodes
    })

    // Log de l'action
    await db.auditLog.create({
      data: {
        action: 'QR_ORDER',
        entityType: 'qrcode',
        entityId: lotId,
        details: JSON.stringify({ garageId, quantity })
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        lotId,
        quantity,
        message: `${quantity} QR codes commandés avec succès`
      }
    })
  } catch (error) {
    console.error('Erreur commande QR:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la commande' },
      { status: 500 }
    )
  }
}

// Données de démo
function getDemoQRCodes() {
  return {
    qrCodes: [
      {
        id: 'qr1',
        code: 'OKAR-ABC-123',
        lotId: 'LOT-2024-001',
        status: 'active',
        activatedByName: 'Ahmed Fall',
        activatedByPhone: '77 123 45 67',
        activatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        vehicle: {
          plateNumber: 'DK-409-HN',
          brand: 'Toyota',
          model: 'Corolla'
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'qr2',
        code: 'OKAR-DEF-456',
        lotId: 'LOT-2024-001',
        status: 'active',
        activatedByName: 'Fatou Diop',
        activatedByPhone: '78 234 56 78',
        activatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        vehicle: {
          plateNumber: 'DK-123-AB',
          brand: 'Renault',
          model: 'Logan'
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'qr3',
        code: 'OKAR-GHI-789',
        lotId: 'LOT-2024-002',
        status: 'stock',
        activatedByName: null,
        activatedByPhone: null,
        activatedAt: null,
        vehicle: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'qr4',
        code: 'OKAR-JKL-012',
        lotId: 'LOT-2024-002',
        status: 'stock',
        activatedByName: null,
        activatedByPhone: null,
        activatedAt: null,
        vehicle: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ],
    stats: {
      total: 200,
      stock: 153,
      active: 47,
      percentage: 23.5
    }
  }
}
