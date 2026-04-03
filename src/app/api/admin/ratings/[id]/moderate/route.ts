import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import db from '@/lib/db'
import { moderateRatingSchema } from '@/lib/admin/validation'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

type RouteContext = { params: Promise<{ id: string }> }

// In-memory moderated ratings store (since Rating model doesn't have moderation fields)
// Maps rating ID -> moderation action
const moderatedRatings = new Map<string, {
  action: 'hide' | 'show' | 'flag'
  reason?: string
  moderatedAt: string
  moderatedBy: string
}>()

// POST /api/admin/ratings/[id]/moderate — Moderate a rating (hide/show/flag)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    // Find the rating
    const rating = await db.rating.findUnique({
      where: { id },
      include: {
        intervention: {
          select: { id: true, companyId: true },
        },
        agent: {
          select: { id: true, firstName: true, lastName: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    })

    if (!rating) {
      return error('NOT_FOUND: Rating not found', 404)
    }

    const body = await request.json()
    const parsed = moderateRatingSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
    }

    const data = parsed.data

    // Store moderation action
    const moderationRecord = {
      action: data.action,
      reason: data.reason || undefined,
      moderatedAt: new Date().toISOString(),
      moderatedBy: admin.id,
    }

    moderatedRatings.set(id, moderationRecord)

    await createAuditLog({
      action: 'rating.moderate',
      userId: admin.id,
      targetId: id,
      targetType: 'Rating',
      companyId: rating.intervention.companyId,
      details: {
        action: data.action,
        reason: data.reason,
        ratingScore: rating.score,
        agentName: `${rating.agent.firstName} ${rating.agent.lastName}`,
        clientName: rating.client.name,
        interventionId: rating.interventionId,
      },
      ipAddress: ip,
      userAgent,
    })

    return success({
      message: `Rating ${id} has been ${data.action}ed${data.reason ? `: ${data.reason}` : ''}`,
      ratingId: id,
      moderation: moderationRecord,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    if (message.startsWith('NOT_FOUND')) return error(message, 404)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}
