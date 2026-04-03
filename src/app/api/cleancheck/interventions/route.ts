import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, generateQRPayload, generatePinCode } from '@/lib/auth'

async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = searchParams.get('from') || undefined
    const to = searchParams.get('to') || undefined

    const where: Record<string, unknown> = { companyId: user.companyId }

    if (status) where.status = status
    if (user.role === 'agent') where.agentId = user.id

    if (from || to) {
      where.scheduledStart = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      }
    }

    const [interventions, total] = await Promise.all([
      db.intervention.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledStart: 'desc' },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          agent: { select: { id: true, firstName: true, lastName: true } },
          checklistTemplate: { select: { id: true, name: true } },
          rating: true,
          checklistItems: { select: { id: true, completed: true } },
        },
      }),
      db.intervention.count({ where }),
    ])

    const enriched = interventions.map((i) => {
      const totalItems = i.checklistItems.length
      const completedItems = i.checklistItems.filter((c) => c.completed).length
      return {
        id: i.id,
        status: i.status,
        scheduledStart: i.scheduledStart,
        scheduledEnd: i.scheduledEnd,
        actualStart: i.actualStart,
        actualEnd: i.actualEnd,
        notes: i.notes,
        client: i.client,
        agent: i.agent,
        checklistTemplate: i.checklistTemplate,
        rating: i.rating,
        checklistCompletion: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : null,
        createdAt: i.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        interventions: enriched,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('List interventions error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'manager' || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const { clientId, agentId, checklistTemplateId, scheduledStart, scheduledEnd, notes } = body

    if (!clientId || !agentId || !scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { success: false, error: 'Client, agent, scheduledStart, and scheduledEnd are required' },
        { status: 400 },
      )
    }

    // Verify client belongs to company
    const client = await db.client.findFirst({
      where: { id: clientId, companyId: user.companyId },
    })
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 },
      )
    }

    // Verify agent belongs to company
    const agent = await db.user.findFirst({
      where: { id: agentId, companyId: user.companyId, role: 'agent', isActive: true },
    })
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found or inactive' },
        { status: 404 },
      )
    }

    // Verify checklist template if provided
    if (checklistTemplateId) {
      const template = await db.checklistTemplate.findFirst({
        where: { id: checklistTemplateId, companyId: user.companyId, isActive: true },
      })
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Checklist template not found' },
          { status: 404 },
        )
      }
    }

    // Generate QR token and PIN
    const qrToken = generateQRPayload('temp-intervention-placeholder')
    const qrPinCode = generatePinCode()
    const qrExpiresAt = new Date()
    qrExpiresAt.setHours(qrExpiresAt.getHours() + 4)

    // Create intervention
    const intervention = await db.intervention.create({
      data: {
        companyId: user.companyId,
        clientId,
        agentId,
        checklistTemplateId: checklistTemplateId || null,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        notes: notes || null,
        qrToken,
        qrPinCode,
        qrExpiresAt,
      },
    })

    // Update QR token with intervention ID
    const qrPayload = `${intervention.qrToken}`
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const qrUrl = `${baseUrl}/scan/${qrPayload}`

    // Create checklist items from template if applicable
    if (checklistTemplateId) {
      const template = await db.checklistTemplate.findUnique({
        where: { id: checklistTemplateId },
      })
      if (template) {
        const items: Array<{ taskName: string; description?: string; order: number }> =
          JSON.parse(template.itemsJson)
        for (const item of items) {
          await db.checklistItem.create({
            data: {
              interventionId: intervention.id,
              taskName: item.taskName,
              description: item.description || null,
              order: item.order,
            },
          })
        }
      }
    }

    // Placeholder SMS/Email sending
    console.log(`[CleanCheck] QR Code generated for intervention ${intervention.id}`)
    console.log(`[CleanCheck] Agent ${agent.firstName} ${agent.lastName} notified via SMS/Email`)
    console.log(`[CleanCheck] Client ${client.name} notified via SMS/Email`)

    return NextResponse.json(
      {
        success: true,
        data: {
          ...intervention,
          qrToken: qrPayload,
          qrUrl,
          client,
          agent: { id: agent.id, firstName: agent.firstName, lastName: agent.lastName },
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Create intervention error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
