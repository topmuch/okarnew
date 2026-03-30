/**
 * OKAR - API Audit Logs Superadmin
 * 
 * GET /api/superadmin/audit - Logs d'audit avec filtres
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { db } from '@/lib/db'

// GET - Liste des logs d'audit
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'all'
    const entityType = searchParams.get('entityType') || 'all'
    const userId = searchParams.get('userId') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = {}

    if (action !== 'all') {
      where.action = action
    }

    if (entityType !== 'all') {
      where.entityType = entityType
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Récupérer les logs
    const logs = await db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await db.auditLog.count({ where })

    // Récupérer les types d'actions disponibles
    const actionTypes = await db.auditLog.groupBy({
      by: ['action'],
      _count: { id: true },
    })

    const entityTypes = await db.auditLog.groupBy({
      by: ['entityType'],
      _count: { id: true },
    })

    // Formater les logs
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details ? JSON.parse(log.details) : null,
      ipAddress: log.ipAddress,
      user: log.user ? {
        name: log.user.name || 'N/A',
        email: log.user.email,
        role: log.user.role,
      } : null,
      createdAt: log.createdAt.toISOString(),
    }))

    return NextResponse.json({
      logs: formattedLogs,
      filters: {
        actions: actionTypes.map((a) => ({ value: a.action, count: a._count.id })),
        entityTypes: entityTypes.map((e) => ({ value: e.entityType, count: e._count.id })),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
