import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(req)
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    const { id } = await params

    const intervention = await db.intervention.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        checklistItems: { orderBy: { order: 'asc' } },
      },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: intervention.checklistItems,
    })
  } catch (error) {
    console.error('Get checklist error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(req)
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    const { id } = await params
    const body = await req.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'items array is required' },
        { status: 400 },
      )
    }

    const intervention = await db.intervention.findFirst({
      where: { id, companyId: user.companyId },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    // Update each checklist item
    for (const item of items) {
      if (!item.id) continue

      await db.checklistItem.update({
        where: { id: item.id, interventionId: id },
        data: {
          ...(item.completed !== undefined && {
            completed: item.completed,
            completedAt: item.completed ? new Date() : null,
          }),
          ...(item.notes !== undefined && { notes: item.notes || null }),
          ...(item.photoUrl !== undefined && { photoUrl: item.photoUrl || null }),
        },
      })
    }

    // Check if all items are now completed
    const allItems = await db.checklistItem.findMany({
      where: { interventionId: id },
    })

    const allCompleted = allItems.length > 0 && allItems.every((i) => i.completed)

    // Auto-set intervention status to completed if all checklist items done
    if (allCompleted && intervention.status === 'in_progress') {
      console.log(`[CleanCheck] All checklist items completed for intervention ${id}`)
      // Don't auto-complete - let scan-end handle it for proper QR flow
    }

    const updatedItems = await db.checklistItem.findMany({
      where: { interventionId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        items: updatedItems,
        allCompleted,
      },
    })
  } catch (error) {
    console.error('Update checklist error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
