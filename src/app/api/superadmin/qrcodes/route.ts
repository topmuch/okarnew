/**
 * OKAR - API Gestion QR Codes Superadmin
 * 
 * GET    /api/superadmin/qrcodes - Liste des QR codes et lots
 * POST   /api/superadmin/qrcodes - Générer un nouveau lot ou attribuer
 * DELETE /api/superadmin/qrcodes - Supprimer un QR code
 * 
 * Support des types: garage / particulier
 * Infos client après activation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

// Configuration
const QR_CODE_PREFIX = 'OKAR'
const QR_CODE_LENGTH = 8

// Génère un code QR unique
function generateQRCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = randomBytes(QR_CODE_LENGTH)
  
  for (let i = 0; i < QR_CODE_LENGTH; i++) {
    code += chars[bytes[i] % chars.length]
  }
  
  return `${QR_CODE_PREFIX}-${code}`
}

// GET - Liste des QR codes et lots
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'lots' // 'lots', 'all', ou 'codes'
    const status = searchParams.get('status') || 'all'
    const qrType = searchParams.get('qrType') || 'all' // 'garage', 'particulier', ou 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    if (type === 'lots') {
      // Récupérer les lots groupés par lotId et type
      const whereClause: any = {}
      if (status !== 'all') {
        whereClause.status = status
      }
      if (qrType !== 'all') {
        whereClause.type = qrType
      }

      const lots = await db.qRCode.groupBy({
        by: ['lotId', 'type'],
        _count: {
          id: true,
        },
        _min: {
          createdAt: true,
        },
        where: whereClause,
      })

      // Récupérer les infos d'attribution
      const lotsWithDetails = await Promise.all(
        lots.map(async (lot) => {
          const assignedGarage = await db.qRCode.findFirst({
            where: { lotId: lot.lotId, assignedGarageId: { not: null } },
            include: {
              assignedGarage: {
                select: { businessName: true },
              },
            },
          })

          const statusCounts = await db.qRCode.groupBy({
            by: ['status'],
            where: { lotId: lot.lotId },
            _count: { id: true },
          })

          const statusMap = statusCounts.reduce((acc, s) => {
            acc[s.status] = s._count.id
            return acc
          }, {} as Record<string, number>)

          // Déterminer le statut du lot
          let lotStatus: 'generating' | 'ready' | 'assigned' = 'ready'
          if (assignedGarage) {
            lotStatus = 'assigned'
          }

          return {
            id: lot.lotId, // Utiliser lotId comme id
            lotId: lot.lotId,
            count: lot._count.id,
            type: lot.type,
            status: lotStatus,
            createdAt: lot._min.createdAt?.toISOString() || new Date().toISOString(),
            assignedTo: assignedGarage?.assignedGarage?.businessName || null,
            statusCounts: statusMap,
            codes: [], // Ne pas inclure tous les codes pour les lots
          }
        })
      )

      return NextResponse.json({ lots: lotsWithDetails })
    } else if (type === 'all') {
      // Récupérer tous les QR codes individuels pour "Mes QR Codes"
      const whereClause: any = {}
      if (status !== 'all') {
        whereClause.status = status
      }
      if (qrType !== 'all') {
        whereClause.type = qrType
      }

      const codes = await db.qRCode.findMany({
        where: whereClause,
        include: {
          assignedGarage: {
            select: { id: true, businessName: true, city: true },
          },
          vehicle: {
            select: { 
              id: true,
              plateNumber: true, 
              brand: true, 
              model: true,
              owner: {
                select: { name: true, email: true, phone: true }
              }
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })

      const total = await db.qRCode.count({ where: whereClause })

      // Formater les données
      const formattedCodes = codes.map((code) => ({
        id: code.id,
        code: code.code,
        lotId: code.lotId,
        type: code.type,
        status: code.status,
        assignedGarageId: code.assignedGarageId,
        assignedGarageName: code.assignedGarage?.businessName,
        // Infos client après activation
        activatedByName: code.activatedByName,
        activatedByEmail: code.activatedByEmail,
        activatedByPhone: code.activatedByPhone,
        vehicleId: code.vehicleId,
        vehiclePlateNumber: code.vehicle?.plateNumber,
        createdAt: code.createdAt.toISOString(),
        activatedAt: code.activatedAt?.toISOString(),
      }))

      return NextResponse.json({
        qrcodes: formattedCodes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } else {
      // Récupérer les codes individuels (ancien comportement)
      const whereClause: any = {}
      if (status !== 'all') {
        whereClause.status = status
      }

      const codes = await db.qRCode.findMany({
        where: whereClause,
        include: {
          assignedGarage: {
            select: { businessName: true, city: true },
          },
          vehicle: {
            select: { plateNumber: true, brand: true, model: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })

      const total = await db.qRCode.count({ where: whereClause })

      return NextResponse.json({
        codes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des QR codes:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Générer un lot ou attribuer
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { action, count, lotId, garageId, type: qrType } = body

    if (action === 'generate') {
      // Générer un nouveau lot
      if (!count || count < 1 || count > 10000) {
        return NextResponse.json(
          { error: 'Le nombre doit être entre 1 et 10000' },
          { status: 400 }
        )
      }

      // Valider le type
      const codeType = qrType === 'garage' ? 'garage' : 'particulier'

      const newLotId = `LOT-${Date.now()}`
      const codes: string[] = []
      const qrData: {
        code: string
        lotId: string
        type: string
        status: string
        assignedGarageId?: string
      }[] = []

      // Générer les codes
      for (let i = 0; i < count; i++) {
        let code = generateQRCode()
        
        // Vérifier l'unicité
        let exists = await db.qRCode.findUnique({ where: { code } })
        let attempts = 0
        while (exists && attempts < 10) {
          code = generateQRCode()
          exists = await db.qRCode.findUnique({ where: { code } })
          attempts++
        }

        if (attempts >= 10) {
          return NextResponse.json(
            { error: 'Erreur de génération de code unique' },
            { status: 500 }
          )
        }

        codes.push(code)
        const qrItem: {
          code: string
          lotId: string
          type: string
          status: string
          assignedGarageId?: string
        } = {
          code,
          lotId: newLotId,
          type: codeType,
          status: 'stock',
        }
        
        // Si c'est un QR garage et qu'un garageId est fourni, l'assigner directement
        if (codeType === 'garage' && garageId) {
          qrItem.assignedGarageId = garageId
        }
        
        qrData.push(qrItem)
      }

      // Insérer en base
      await db.qRCode.createMany({
        data: qrData,
      })

      // Récupérer le nom du garage si assigné
      let garageName: string | null = null
      if (codeType === 'garage' && garageId) {
        const garage = await db.garage.findUnique({
          where: { id: garageId },
          select: { businessName: true },
        })
        garageName = garage?.businessName || null
      }

      // Log d'audit
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'QR_LOT_GENERATED',
          entityType: 'qrcode',
          entityId: newLotId,
          details: JSON.stringify({ 
            count, 
            lotId: newLotId, 
            type: codeType,
            assignedToGarage: garageName,
          }),
        },
      })

      return NextResponse.json({
        success: true,
        lot: {
          id: newLotId,
          lotId: newLotId,
          count,
          type: codeType,
          status: 'ready',
          createdAt: new Date().toISOString(),
          assignedTo: garageName,
          codes: codes.slice(0, 10), // Retourner les 10 premiers pour preview
        },
      })
    }

    if (action === 'assign') {
      // Attribuer un lot à un garage
      if (!lotId || !garageId) {
        return NextResponse.json(
          { error: 'lotId et garageId requis' },
          { status: 400 }
        )
      }

      // Vérifier que le garage existe
      const garage = await db.garage.findUnique({
        where: { id: garageId },
      })

      if (!garage) {
        return NextResponse.json(
          { error: 'Garage non trouvé' },
          { status: 404 }
        )
      }

      // Mettre à jour les QR codes du lot
      const result = await db.qRCode.updateMany({
        where: {
          lotId,
          status: 'stock',
          assignedGarageId: null,
        },
        data: {
          assignedGarageId: garageId,
        },
      })

      // Log d'audit
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'QR_LOT_ASSIGNED',
          entityType: 'qrcode',
          entityId: lotId,
          details: JSON.stringify({
            lotId,
            garageId,
            garageName: garage.businessName,
            codesCount: result.count,
          }),
        },
      })

      return NextResponse.json({
        success: true,
        assigned: result.count,
      })
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'action sur les QR codes:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un QR code
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const qrId = searchParams.get('id')

    if (!qrId) {
      return NextResponse.json(
        { error: 'ID du QR code requis' },
        { status: 400 }
      )
    }

    // Vérifier que le QR code existe
    const qrCode = await db.qRCode.findUnique({
      where: { id: qrId },
      include: {
        vehicle: {
          select: { plateNumber: true }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si le QR code est actif avec un véhicule associé
    if (qrCode.status === 'active' && qrCode.vehicleId) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un QR code actif lié à un véhicule. Veuillez d\'abord désactiver le véhicule.' },
        { status: 400 }
      )
    }

    // Supprimer le QR code
    await db.qRCode.delete({
      where: { id: qrId }
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'QR_CODE_DELETED',
        entityType: 'qrcode',
        entityId: qrId,
        details: JSON.stringify({
          code: qrCode.code,
          lotId: qrCode.lotId,
          type: qrCode.type,
          status: qrCode.status,
        }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du QR code:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
