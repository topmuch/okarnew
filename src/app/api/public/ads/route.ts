/**
 * OKAR - Public Ads API
 * API for fetching active advertisements
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/public/ads - Get active ads for a position
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') || 'driver_dashboard_top'
    const limit = parseInt(searchParams.get('limit') || '5')

    const now = new Date()

    const ads = await db.advertisement.findMany({
      where: {
        isActive: true,
        position,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // If no ads in DB, return demo data
    if (ads.length === 0) {
      return NextResponse.json({
        success: true,
        data: getDemoAds(position)
      })
    }

    return NextResponse.json({
      success: true,
      data: ads.map(ad => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        linkUrl: ad.linkUrl,
        position: ad.position,
        priority: ad.priority,
        clickCount: ad.clickCount
      }))
    })
  } catch (error) {
    console.error('Erreur récupération publicités:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des publicités' },
      { status: 500 }
    )
  }
}

// POST /api/public/ads - Track click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adId } = body

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'ID de la publicité requis' },
        { status: 400 }
      )
    }

    // Increment click count
    await db.advertisement.update({
      where: { id: adId },
      data: { clickCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur tracking clic:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du tracking' },
      { status: 500 }
    )
  }
}

// Demo data
function getDemoAds(position: string) {
  const allAds = [
    {
      id: '1',
      title: 'Assurance Auto -15%',
      description: 'Profitez de -15% sur votre assurance auto avec notre partenaire',
      imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
      linkUrl: 'https://okar.sn/assurance',
      position: 'driver_dashboard_top',
      priority: 100,
      clickCount: 234
    },
    {
      id: '2',
      title: 'Vidange Premium',
      description: 'Huile moteur premium à prix réduit chez nos garages partenaires',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
      linkUrl: 'https://okar.sn/vidange',
      position: 'driver_dashboard_top',
      priority: 80,
      clickCount: 145
    },
    {
      id: '3',
      title: 'Contrôle Technique Gratuit',
      description: 'Réservez votre contrôle technique et obtenez un diagnostic gratuit',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      linkUrl: 'https://okar.sn/controle-technique',
      position: 'driver_dashboard_top',
      priority: 60,
      clickCount: 89
    }
  ]

  return allAds.filter(ad => ad.position === position)
}
