/**
 * OKAR - Public Advertisements API
 * Fetches active advertisements for display in dashboards
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/public/advertisements - Get active advertisements by position
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')

    // Build where clause
    const where: any = {
      isActive: true
    }

    // Filter by position if provided
    if (position) {
      where.position = position
    }

    // Filter by date range (only show ads within their date range)
    const now = new Date()
    where.OR = [
      { startDate: null, endDate: null },
      { startDate: { lte: now }, endDate: null },
      { startDate: null, endDate: { gte: now } },
      { startDate: { lte: now }, endDate: { gte: now } },
    ]

    const ads = await db.advertisement.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: position ? 5 : 10 // Limit results
    })

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
