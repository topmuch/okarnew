/**
 * OKAR - API Insurance Leads
 * Gestion des demandes de devis (tracking et création)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/auth'

// POST /api/insurance/leads - Créer un nouveau lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      providerId,
      vehicleInfo,
      coverageType,
      estimatedPrice,
      userName,
      userPhone,
      userEmail,
      source = 'comparator',
      utmSource,
    } = body

    // Validation
    if (!providerId || !vehicleInfo || !coverageType) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur connecté si disponible
    let userId: string | undefined
    try {
      const user = await getCurrentUser()
      if (user?.id) {
        userId = user.id
      }
    } catch (e) {
      // Session non disponible, continuer sans userId
    }

    // Créer le lead en base
    try {
      const lead = await db.insuranceLead.create({
        data: {
          providerId,
          userId,
          vehicleId: vehicleInfo.id,
          vehicleInfo: JSON.stringify(vehicleInfo),
          coverageType,
          estimatedPrice,
          userName: userName || null,
          userPhone: userPhone || null,
          userEmail: userEmail || null,
          source,
          utmSource: utmSource || null,
        },
      })

      // Incrémenter le compteur de leads du provider
      await db.insuranceProvider.update({
        where: { id: providerId },
        data: {
          leadCount: { increment: 1 },
          clickCount: { increment: 1 },
        },
      })

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        message: 'Lead enregistré avec succès',
      })
    } catch (dbError) {
      console.log('Database not available for lead tracking')
      
      // Retourner succès même sans DB (le lead sera toujours envoyé via WhatsApp)
      return NextResponse.json({
        success: true,
        leadId: `temp_${Date.now()}`,
        message: 'Lead créé (mode dégradé)',
      })
    }
  } catch (error) {
    console.error('Error creating insurance lead:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du lead' },
      { status: 500 }
    )
  }
}

// GET /api/insurance/leads - Liste des leads (admin seulement)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getCurrentUser()
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const providerId = searchParams.get('providerId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (providerId) where.providerId = providerId

    try {
      const [leads, total] = await Promise.all([
        db.insuranceLead.findMany({
          where,
          include: {
            provider: {
              select: { name: true, slug: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        db.insuranceLead.count({ where }),
      ])

      return NextResponse.json({
        success: true,
        leads: leads.map(l => ({
          ...l,
          vehicleInfo: JSON.parse(l.vehicleInfo || '{}'),
        })),
        total,
        limit,
        offset,
      })
    } catch (dbError) {
      return NextResponse.json({
        success: true,
        leads: [],
        total: 0,
        limit,
        offset,
      })
    }
  } catch (error) {
    console.error('Error fetching insurance leads:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des leads' },
      { status: 500 }
    )
  }
}
