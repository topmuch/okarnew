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

export async function GET(req: NextRequest) {
  try {
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const templates = await db.checklistTemplate.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error('List checklist templates error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const { name, description, items, estimatedDurationMinutes } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 },
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one checklist item is required' },
        { status: 400 },
      )
    }

    const formattedItems = items.map((item: { taskName: string; description?: string; order?: number }, index: number) => ({
      taskName: item.taskName,
      description: item.description || null,
      order: item.order ?? index,
    }))

    const template = await db.checklistTemplate.create({
      data: {
        name,
        description: description || null,
        companyId: user.companyId,
        itemsJson: JSON.stringify(formattedItems),
        estimatedDurationMinutes: estimatedDurationMinutes || 30,
      },
    })

    return NextResponse.json({ success: true, data: template }, { status: 201 })
  } catch (error) {
    console.error('Create checklist template error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
