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

    const company = await db.company.findUnique({
      where: { id: user.companyId },
      include: {
        _count: {
          select: {
            users: { where: { role: 'agent', isActive: true } },
            clients: true,
            interventions: true,
            checklistTemplates: { where: { isActive: true } },
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 },
      )
    }

    // Intervention stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalInterventions,
      completedThisMonth,
      scheduledThisMonth,
      inProgress,
    ] = await Promise.all([
      db.intervention.count({ where: { companyId: company.id } }),
      db.intervention.count({
        where: { companyId: company.id, status: 'completed', actualEnd: { gte: startOfMonth } },
      }),
      db.intervention.count({
        where: { companyId: company.id, scheduledStart: { gte: startOfMonth } },
      }),
      db.intervention.count({
        where: { companyId: company.id, status: 'in_progress' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...company,
        stats: {
          totalInterventions,
          completedThisMonth,
          scheduledThisMonth,
          inProgress,
          agentCount: company._count.users,
          clientCount: company._count.clients,
          templateCount: company._count.checklistTemplates,
        },
      },
    })
  } catch (error) {
    console.error('Get company error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 },
      )
    }

    const company = await db.company.update({
      where: { id: user.companyId },
      data: { name },
    })

    return NextResponse.json({ success: true, data: company })
  } catch (error) {
    console.error('Update company error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
