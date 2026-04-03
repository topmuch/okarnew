import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import db from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { startImpersonateSchema } from '@/lib/admin/validation'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// In-memory active impersonations store
interface ImpersonationSession {
  id: string
  adminUserId: string
  companyId: string
  token: string
  startedAt: string
  expiresAt: string
}

const activeImpersonations = new Map<string, ImpersonationSession>()

// POST /api/admin/impersonate — Start impersonating a company
export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)

    const body = await request.json()
    const parsed = startImpersonateSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
    }

    const { companyId } = parsed.data

    // Verify company exists
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true, subscriptionTier: true },
    })

    if (!company) {
      return error('NOT_FOUND: Company not found', 404)
    }

    // Find the first active manager for this company
    const manager = await db.user.findFirst({
      where: { companyId, role: 'manager', isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true },
    })

    // Generate impersonation token (short-lived, 1 hour)
    const impersonationToken = generateToken({
      userId: manager?.id || admin.id,
      email: manager?.email || admin.email,
      role: manager?.email ? 'manager' : 'super_admin',
      companyId,
      impersonatedBy: admin.id,
      isImpersonation: true,
    })

    const impersonationId = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour

    const session: ImpersonationSession = {
      id: impersonationId,
      adminUserId: admin.id,
      companyId,
      token: impersonationToken,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    activeImpersonations.set(impersonationToken, session)

    await createAuditLog({
      action: 'impersonate.start',
      userId: admin.id,
      targetId: companyId,
      targetType: 'Company',
      details: {
        companyName: company.name,
        impersonatedAs: manager ? `${manager.firstName} ${manager.lastName} (${manager.email})` : 'no active manager',
        expiresAt: expiresAt.toISOString(),
      },
      ipAddress: ip,
      userAgent,
    })

    return success({
      impersonationId,
      companyId,
      companyName: company.name,
      token: impersonationToken,
      impersonatedUser: manager || null,
      expiresAt: expiresAt.toISOString(),
      warning: 'You are now impersonating this company. All actions will be attributed to your admin account.',
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

// DELETE /api/admin/impersonate — End impersonation
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)

    // Try to find active impersonation by token in header
    const token = request.headers.get('x-impersonation-token') ||
      request.cookies.get('impersonation_token')?.value

    let endedSession: ImpersonationSession | null = null

    if (token && activeImpersonations.has(token)) {
      endedSession = activeImpersonations.get(token)!
      activeImpersonations.delete(token)
    }

    if (!endedSession) {
      return error('No active impersonation session found', 404)
    }

    // Get company name for audit
    const company = await db.company.findUnique({
      where: { id: endedSession.companyId },
      select: { name: true },
    })

    await createAuditLog({
      action: 'impersonate.end',
      userId: admin.id,
      targetId: endedSession.companyId,
      targetType: 'Company',
      details: {
        companyName: company?.name,
        duration: Math.round((Date.now() - new Date(endedSession.startedAt).getTime()) / 1000),
      },
      ipAddress: ip,
      userAgent,
    })

    return success({
      message: `Impersonation of "${company?.name}" ended successfully.`,
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
