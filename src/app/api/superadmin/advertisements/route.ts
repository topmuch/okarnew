/**
 * OKAR - Advertisements API
 * CRUD for managing advertisements in the superadmin dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/superadmin/advertisements - List all advertisements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}
    if (position) where.position = position
    if (activeOnly) where.isActive = true

    const ads = await db.advertisement.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // If no ads in DB, return demo data
    if (ads.length === 0 && !position) {
      return NextResponse.json({
        success: true,
        data: getDemoAds()
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
        isActive: ad.isActive,
        priority: ad.priority,
        startDate: ad.startDate,
        endDate: ad.endDate,
        clickCount: ad.clickCount,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt
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

// POST /api/superadmin/advertisements - Create new advertisement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, imageUrl, linkUrl, position, priority, startDate, endDate } = body

    if (!title || !imageUrl || !position) {
      return NextResponse.json(
        { success: false, error: 'Titre, image et position requis' },
        { status: 400 }
      )
    }

    const ad = await db.advertisement.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        position,
        priority: priority || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json({ success: true, data: ad })
  } catch (error) {
    console.error('Erreur création publicité:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la publicité' },
      { status: 500 }
    )
  }
}

// PUT /api/superadmin/advertisements - Update advertisement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, imageUrl, linkUrl, position, isActive, priority, startDate, endDate } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl
    if (position !== undefined) updateData.position = position
    if (isActive !== undefined) updateData.isActive = isActive
    if (priority !== undefined) updateData.priority = priority
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const ad = await db.advertisement.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: ad })
  } catch (error) {
    console.error('Erreur mise à jour publicité:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// DELETE /api/superadmin/advertisements - Delete advertisement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    await db.advertisement.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression publicité:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

// Demo data
function getDemoAds() {
  return [
    {
      id: '1',
      title: 'Formation Mécanique Auto',
      description: 'Apprenez les bases de la mécanique automobile avec nos experts certifiés',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
      linkUrl: 'https://okar.sn/formation',
      position: 'garage_dashboard_top',
      isActive: true,
      priority: 100,
      startDate: null,
      endDate: null,
      clickCount: 145,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Équipements Professionnels',
      description: 'Outillage professionnel pour garages -10% avec le code OKAR10',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      linkUrl: 'https://okar.sn/equipements',
      position: 'garage_dashboard_side',
      isActive: true,
      priority: 80,
      startDate: null,
      endDate: null,
      clickCount: 89,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Assurance Flotte Automobile',
      description: 'Protégez tous vos véhicules avec notre assurance flotte avantageuse',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
      linkUrl: 'https://okar.sn/assurance-flotte',
      position: 'garage_dashboard_top',
      isActive: false,
      priority: 50,
      startDate: null,
      endDate: null,
      clickCount: 234,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  ]
}
