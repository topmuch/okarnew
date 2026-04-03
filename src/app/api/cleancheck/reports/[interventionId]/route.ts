import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ interventionId: string }> },
) {
  try {
    const { interventionId } = await params
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Report token is required' },
        { status: 400 },
      )
    }

    // Find intervention by ID
    const intervention = await db.intervention.findUnique({
      where: { id: interventionId },
      include: {
        client: true,
        agent: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        checklistItems: { orderBy: { order: 'asc' } },
        rating: true,
        checklistTemplate: { select: { id: true, name: true } },
      },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    // Verify token against clientReportUrl
    if (
      !intervention.clientReportUrl ||
      !intervention.clientReportUrl.includes(token)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired report token' },
        { status: 401 },
      )
    }

    // Only show reports for completed interventions
    if (intervention.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Report is not yet available. The intervention is not completed.' },
        { status: 400 },
      )
    }

    const completedItems = intervention.checklistItems.filter((i) => i.completed)
    const totalItems = intervention.checklistItems.length

    return NextResponse.json({
      success: true,
      data: {
        intervention: {
          id: intervention.id,
          status: intervention.status,
          scheduledStart: intervention.scheduledStart,
          scheduledEnd: intervention.scheduledEnd,
          actualStart: intervention.actualStart,
          actualEnd: intervention.actualEnd,
          notes: intervention.notes,
        },
        client: intervention.client,
        agent: intervention.agent,
        company: intervention.company,
        checklistTemplate: intervention.checklistTemplate,
        checklistItems: intervention.checklistItems.map((item) => ({
          id: item.id,
          taskName: item.taskName,
          description: item.description,
          completed: item.completed,
          notes: item.notes,
          photoUrl: item.photoUrl,
          completedAt: item.completedAt,
          order: item.order,
        })),
        checklistSummary: {
          total: totalItems,
          completed: completedItems.length,
          completionRate: totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : null,
        },
        rating: intervention.rating,
        duration: intervention.actualStart && intervention.actualEnd
          ? {
              minutes: Math.round(
                (intervention.actualEnd.getTime() - intervention.actualStart.getTime()) / (1000 * 60),
              ),
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
