import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import db from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { updateUserRoleSchema, toggleUserStatusSchema, resetPasswordSchema } from '@/lib/admin/validation'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/admin/users/[id] — Get user details with company info
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireSuperAdmin(request)
    const { id } = await context.params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionTier: true,
            maxAgents: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            interventions: true,
            qualityScores: true,
            ratings: true,
            sessions: true,
          },
        },
      },
    })

    if (!user) {
      return error('NOT_FOUND: User not found', 404)
    }

    // Get quality score data
    const qualityScores = await db.qualityScore.findMany({
      where: { agentId: id },
      orderBy: { calculatedAt: 'desc' },
      take: 5,
    })

    // Get average rating
    const avgRating = await db.rating.aggregate({
      _avg: { score: true },
      where: { agentId: id },
    })

    return success({
      ...user,
      companyName: user.company?.name || null,
      qualityScores,
      averageRating: avgRating._avg.score ? Math.round(avgRating._avg.score * 10) / 10 : null,
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

// PATCH /api/admin/users/[id] — Update user role or toggle active status
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    const existing = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    })

    if (!existing) {
      return error('NOT_FOUND: User not found', 404)
    }

    // Prevent modifying super_admins
    if (existing.role === 'super_admin') {
      return error('FORBIDDEN: Cannot modify super admin users', 403)
    }

    const body = await request.json()

    // Try role update schema
    const roleParsed = updateUserRoleSchema.safeParse(body)
    if (roleParsed.success) {
      const updated = await db.user.update({
        where: { id },
        data: { role: roleParsed.data.role },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
      })

      await createAuditLog({
        action: 'user.update',
        userId: admin.id,
        targetId: id,
        targetType: 'User',
        details: { field: 'role', before: existing.role, after: roleParsed.data.role },
        ipAddress: ip,
        userAgent,
      })

      return success(updated)
    }

    // Try status toggle schema
    const statusParsed = toggleUserStatusSchema.safeParse(body)
    if (statusParsed.success) {
      const updated = await db.user.update({
        where: { id },
        data: { isActive: statusParsed.data.isActive },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
      })

      await createAuditLog({
        action: 'user.toggle_status',
        userId: admin.id,
        targetId: id,
        targetType: 'User',
        details: { before: existing.isActive, after: statusParsed.data.isActive },
        ipAddress: ip,
        userAgent,
      })

      return success(updated)
    }

    return error('Invalid input. Provide either { role } or { isActive } to update.')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    if (message.startsWith('NOT_FOUND')) return error(message, 404)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}

// POST /api/admin/users/[id] — Reset user password
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      return error('NOT_FOUND: User not found', 404)
    }

    if (user.role === 'super_admin') {
      return error('FORBIDDEN: Cannot reset super admin password', 403)
    }

    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
    }

    const passwordHash = hashPassword(parsed.data.newPassword)

    await db.user.update({
      where: { id },
      data: { passwordHash },
    })

    // Delete all active sessions for this user to force re-login
    await db.session.deleteMany({
      where: { userId: id, expiresAt: { gt: new Date() } },
    })

    await createAuditLog({
      action: 'user.reset_password',
      userId: admin.id,
      targetId: id,
      targetType: 'User',
      details: { targetEmail: user.email },
      ipAddress: ip,
      userAgent,
    })

    return success({ message: `Password reset for user ${user.email}. User must log in again.` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    if (message.startsWith('NOT_FOUND')) return error(message, 404)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}
