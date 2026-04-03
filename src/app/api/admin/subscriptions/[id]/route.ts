import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import db from '@/lib/db'
import { updateSubscriptionSchema } from '@/lib/admin/validation'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

type RouteContext = { params: Promise<{ id: string }> }

// PATCH /api/admin/subscriptions/[id] — Update subscription (plan, limits)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    const company = await db.company.findUnique({ where: { id } })
    if (!company) {
      return error('NOT_FOUND: Company not found', 404)
    }

    const body = await request.json()
    const parsed = updateSubscriptionSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
    }

    const data = parsed.data

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (data.tier !== undefined) updateData.subscriptionTier = data.tier
    if (data.maxAgents !== undefined) updateData.maxAgents = data.maxAgents
    if (data.maxInterventionsPerMonth !== undefined) {
      updateData.maxInterventionsPerMonth = data.maxInterventionsPerMonth
    }

    // Capture before state
    const before = {
      subscriptionTier: company.subscriptionTier,
      maxAgents: company.maxAgents,
      maxInterventionsPerMonth: company.maxInterventionsPerMonth,
    }

    const updated = await db.company.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      action: 'subscription.update',
      userId: admin.id,
      targetId: id,
      targetType: 'Company',
      details: { before, after: updateData, companyName: company.name },
      ipAddress: ip,
      userAgent,
    })

    return success({
      id: updated.id,
      company: { id: updated.id, name: updated.name, slug: updated.slug },
      tier: updated.subscriptionTier,
      maxAgents: updated.maxAgents,
      maxInterventionsPerMonth: updated.maxInterventionsPerMonth,
      updatedAt: updated.updatedAt,
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
