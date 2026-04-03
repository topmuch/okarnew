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
  { params }: { params: Promise<{ agentId: string }> },
) {
  try {
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const { agentId } = await params

    // Verify agent belongs to company
    const agent = await db.user.findFirst({
      where: { id: agentId, companyId: user.companyId, role: 'agent' },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true },
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 },
      )
    }

    // Get score history
    const scoreHistory = await db.qualityScore.findMany({
      where: { agentId, companyId: user.companyId },
      orderBy: { calculatedAt: 'desc' },
      take: 30,
    })

    // Get latest score
    const latestScore = scoreHistory[0] || null

    // Get all ratings received
    const ratings = await db.rating.findMany({
      where: { intervention: { agentId } },
      include: {
        intervention: {
          select: {
            scheduledStart: true,
            client: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      data: {
        agent,
        latestScore,
        scoreHistory,
        ratings,
      },
    })
  } catch (error) {
    console.error('Get agent score error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
