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
        client: true,
        agent: { select: { id: true, firstName: true, lastName: true, phone: true } },
        checklistTemplate: true,
        checklistItems: { orderBy: { order: 'asc' } },
        rating: true,
      },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: intervention })
  } catch (error) {
    console.error('Get intervention error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(
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
    const { status, notes, actualStart, actualEnd } = body

    const intervention = await db.intervention.findFirst({
      where: { id, companyId: user.companyId },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    // Only managers can update interventions
    if (user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: 'Only managers can update interventions' },
        { status: 403 },
      )
    }

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 },
      )
    }

    const updated = await db.intervention.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(actualStart && { actualStart: new Date(actualStart) }),
        ...(actualEnd && { actualEnd: new Date(actualEnd) }),
      },
      include: {
        client: { select: { id: true, name: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update intervention error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
