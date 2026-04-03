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
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    // 1. Overdue interventions (scheduledEnd < now && status != completed)
    const overdue = await db.intervention.findMany({
      where: {
        companyId: user.companyId,
        scheduledEnd: { lt: now },
        status: { not: 'completed' },
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledEnd: 'asc' },
      take: 20,
    })

    // 2. Agents with low quality scores (< 60)
    const lowScoreAgents = await db.qualityScore.findMany({
      where: {
        companyId: user.companyId,
        score: { lt: 60 },
      },
      distinct: ['agentId'],
      orderBy: { score: 'asc' },
      include: {
        agent: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      take: 10,
    })

    // 3. Interventions starting soon (within next 1 hour, status = scheduled)
    const startingSoon = await db.intervention.findMany({
      where: {
        companyId: user.companyId,
        status: 'scheduled',
        scheduledStart: { gte: now, lte: oneHourFromNow },
      },
      include: {
        client: { select: { id: true, name: true, address: true } },
        agent: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: { scheduledStart: 'asc' },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      data: {
        overdue: overdue.length > 0 ? overdue : [],
        lowScoreAgents: lowScoreAgents.length > 0 ? lowScoreAgents : [],
        startingSoon: startingSoon.length > 0 ? startingSoon : [],
        summary: {
          overdueCount: overdue.length,
          lowScoreAgentCount: lowScoreAgents.length,
          startingSoonCount: startingSoon.length,
        },
      },
    })
  } catch (error) {
    console.error('Dashboard alerts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
