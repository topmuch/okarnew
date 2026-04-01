/**
 * OKAR - API de Debug pour QR Codes
 * 
 * GET /api/debug/qrcodes - Liste tous les QR codes
 * Utile pour diagnostiquer les problèmes d'activation
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    
    // Si un code spécifique est demandé
    if (code) {
      const qrCode = await db.qRCode.findUnique({
        where: { code: code.toUpperCase().trim() },
        include: {
          vehicle: {
            select: {
              id: true,
              plateNumber: true,
              brand: true,
              model: true,
            }
          },
          assignedGarage: {
            select: {
              id: true,
              businessName: true,
            }
          }
        }
      })
      
      return NextResponse.json({
        searchCode: code,
        normalizedCode: code.toUpperCase().trim(),
        found: !!qrCode,
        qrCode: qrCode ? {
          id: qrCode.id,
          code: qrCode.code,
          status: qrCode.status,
          type: qrCode.type,
          lotId: qrCode.lotId,
          vehicleId: qrCode.vehicleId,
          assignedGarageId: qrCode.assignedGarageId,
          createdAt: qrCode.createdAt,
          activatedAt: qrCode.activatedAt,
          vehicle: qrCode.vehicle,
          garage: qrCode.assignedGarage,
        } : null
      })
    }
    
    // Sinon, retourner des stats et les derniers QR codes
    const totalCount = await db.qRCode.count()
    const stockCount = await db.qRCode.count({ where: { status: 'stock' } })
    const activeCount = await db.qRCode.count({ where: { status: 'active' } })
    const lostCount = await db.qRCode.count({ where: { status: 'lost' } })
    
    // Les 10 derniers QR codes
    const recentQRCodes = await db.qRCode.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        status: true,
        type: true,
        lotId: true,
        createdAt: true,
      }
    })
    
    // QR codes de test
    const testCodes = await db.qRCode.findMany({
      where: {
        code: { in: ['OKAR-TEST001', 'OKAR-TEST002', 'OKAR-TEST003'] }
      },
      select: {
        id: true,
        code: true,
        status: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json({
      stats: {
        total: totalCount,
        stock: stockCount,
        active: activeCount,
        lost: lostCount,
      },
      testCodes: {
        expected: ['OKAR-TEST001', 'OKAR-TEST002', 'OKAR-TEST003'],
        found: testCodes,
        allExist: testCodes.length === 3,
      },
      recentQRCodes,
      databasePath: process.env.DATABASE_URL,
    })
    
  } catch (error) {
    console.error('Erreur debug QR codes:', error)
    return NextResponse.json({
      error: 'Erreur lors du debug',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      databasePath: process.env.DATABASE_URL,
    }, { status: 500 })
  }
}
