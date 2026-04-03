import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { saveQualityScore } from '@/lib/scoring'

async function requireManager(req: NextRequest) {
  const token = req.cookies.get('token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const user = await verifyToken(token)
  if (!user || user.role !== 'manager' || !user.companyId) return null
  return user
}

export async function POST(
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
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 },
      )
    }

    // Trigger score recalculation
    const result = await saveQualityScore(agentId, user.companyId)

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        score: result.score,
        breakdown: result.breakdown,
        message: 'Quality score recalculated successfully',
      },
    })
  } catch (error) {
    console.error('Recalculate score error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
