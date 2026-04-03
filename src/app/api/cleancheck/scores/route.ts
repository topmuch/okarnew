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

    // Get all agents for this company
    const agents = await db.user.findMany({
      where: { companyId: user.companyId, role: 'agent', isActive: true },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      orderBy: { firstName: 'asc' },
    })

    // Get latest quality score for each agent
    const scores = []
    for (const agent of agents) {
      const latestScore = await db.qualityScore.findFirst({
        where: { agentId: agent.id, companyId: user.companyId },
        orderBy: { calculatedAt: 'desc' },
      })

      // Get intervention count
      const interventionCount = await db.intervention.count({
        where: { agentId: agent.id, status: 'completed' },
      })

      // Get average rating
      const ratings = await db.rating.findMany({
        where: { intervention: { agentId: agent.id } },
        select: { score: true },
      })
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, r) => a + r.score, 0) / ratings.length
          : null

      scores.push({
        agent,
        score: latestScore,
        interventionCount,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      })
    }

    return NextResponse.json({ success: true, data: scores })
  } catch (error) {
    console.error('Get scores error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
