import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import db from '@/lib/db'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/admin/companies/[id]/suspend — Toggle company suspension
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    const company = await db.company.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })

    if (!company) {
      return error('NOT_FOUND: Company not found', 404)
    }

    const isCurrentlySuspended = company.subscriptionTier === 'suspended'

    // Toggle suspension state
    const newTier = isCurrentlySuspended ? 'free' : 'suspended'

    // Update company tier
    await db.company.update({
      where: { id },
      data: { subscriptionTier: newTier },
    })

    // Mark all company users as inactive when suspending, active when unsuspending
    await db.user.updateMany({
      where: { companyId: id },
      data: { isActive: isCurrentlySuspended },
    })

    const action = isCurrentlySuspended ? 'company.unsuspend' : 'company.suspend'

    await createAuditLog({
      action,
      userId: admin.id,
      targetId: id,
      targetType: 'Company',
      details: {
        companyName: company.name,
        previousTier: company.subscriptionTier,
        newTier,
        affectedUsers: company._count.users,
      },
      ipAddress: ip,
      userAgent,
    })

    return success({
      message: isCurrentlySuspended
        ? `Company "${company.name}" has been unsuspended. Users reactivated.`
        : `Company "${company.name}" has been suspended. All users deactivated.`,
      companyId: id,
      subscriptionTier: newTier,
      affectedUsers: company._count.users,
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
