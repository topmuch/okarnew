import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function requireManager(req: NextRequest) {
  const token = req.cookies.get('token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const user = await verifyToken(token)
  if (!user || user.role !== 'manager' || !user.companyId) return null
  return user
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const { id } = await params

    const template = await db.checklistTemplate.findFirst({
      where: { id, companyId: user.companyId },
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        items: JSON.parse(template.itemsJson),
      },
    })
  } catch (error) {
    console.error('Get checklist template error:', error)
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
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const { id } = await params
    const body = await req.json()
    const { name, description, items, estimatedDurationMinutes, isActive } = body

    const template = await db.checklistTemplate.findFirst({
      where: { id, companyId: user.companyId },
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      )
    }

    const updated = await db.checklistTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(items && Array.isArray(items) && { itemsJson: JSON.stringify(items) }),
        ...(estimatedDurationMinutes !== undefined && { estimatedDurationMinutes }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update checklist template error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const { id } = await params

    const template = await db.checklistTemplate.findFirst({
      where: { id, companyId: user.companyId },
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      )
    }

    await db.checklistTemplate.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { message: 'Template deleted successfully' },
    })
  } catch (error) {
    console.error('Delete checklist template error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
