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

    const recentInterventions = await db.intervention.findMany({
      where: { companyId: user.companyId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
      select: {
        id: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        actualStart: true,
        actualEnd: true,
        createdAt: true,
        client: { select: { id: true, name: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: recentInterventions,
    })
  } catch (error) {
    console.error('Recent interventions error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
