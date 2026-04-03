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

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalInterventions,
      completedToday,
      inProgress,
      agentCount,
      clientCount,
      thisWeekInterventions,
      thisMonthInterventions,
      completedThisMonth,
      ratingsResult,
    ] = await Promise.all([
      db.intervention.count({ where: { companyId: user.companyId } }),
      db.intervention.count({
        where: {
          companyId: user.companyId,
          status: 'completed',
          actualEnd: { gte: startOfDay },
        },
      }),
      db.intervention.count({
        where: { companyId: user.companyId, status: 'in_progress' },
      }),
      db.user.count({
        where: { companyId: user.companyId, role: 'agent', isActive: true },
      }),
      db.client.count({ where: { companyId: user.companyId } }),
      db.intervention.count({
        where: {
          companyId: user.companyId,
          scheduledStart: { gte: startOfWeek },
        },
      }),
      db.intervention.count({
        where: {
          companyId: user.companyId,
          scheduledStart: { gte: startOfMonth },
        },
      }),
      db.intervention.count({
        where: {
          companyId: user.companyId,
          status: 'completed',
          actualEnd: { gte: startOfMonth },
        },
      }),
      db.rating.findMany({
        where: {
          intervention: { companyId: user.companyId },
        },
        select: { score: true },
      }),
    ])

    const avgScore =
      ratingsResult.length > 0
        ? Math.round(
            (ratingsResult.reduce((a, r) => a + r.score, 0) / ratingsResult.length) * 10,
          ) / 10
        : 0

    const completionRate =
      thisMonthInterventions > 0
        ? Math.round((completedThisMonth / thisMonthInterventions) * 100)
        : 0

    return NextResponse.json({
      success: true,
      data: {
        totalInterventions,
        completedToday,
        inProgress,
        avgScore,
        agentCount,
        clientCount,
        interventionsThisWeek: thisWeekInterventions,
        interventionsThisMonth: thisMonthInterventions,
        completedThisMonth,
        completionRate,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
