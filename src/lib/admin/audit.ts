/**
 * CleanCheck - Audit Logging Service
 *
 * Immutable, structured audit trail for all SuperAdmin actions.
 * No deletion permitted. Atomic writes only.
 */

import db from '@/lib/db'

interface CreateAuditLogParams {
  superAdminId: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'impersonate_start' | 'impersonate_end' | 'config_change' | 'flag_toggle' | 'support_action' | 'moderate' | 'export' | 'password_reset'
  targetType: string
  targetId?: string
  before?: unknown
  after?: unknown
  ipAddress?: string
  userAgent?: string
  companyId?: string
  metadata?: Record<string, unknown>
}

/**
 * Create an immutable audit log entry.
 * This function NEVER deletes or modifies existing logs.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  const { before, after, metadata, ...rest } = params

  await db.auditLog.create({
    data: {
      ...rest,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

/**
 * Query audit logs with filtering and pagination.
 */
export async function queryAuditLogs(params: {
  page?: number
  limit?: number
  action?: string
  targetType?: string
  superAdminId?: string
  startDate?: Date
  endDate?: Date
  companyId?: string
}) {
  const {
    page = 1,
    limit = 50,
    action,
    targetType,
    superAdminId,
    startDate,
    endDate,
    companyId,
  } = params

  const where: Record<string, unknown> = {}
  if (action) where.action = action
  if (targetType) where.targetType = targetType
  if (superAdminId) where.superAdminId = superAdminId
  if (companyId) where.companyId = companyId
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) (where.createdAt as Record<string, unknown>).gte = startDate
    if (endDate) (where.createdAt as Record<string, unknown>).lte = endDate
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        superAdmin: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.auditLog.count({ where }),
  ])

  return {
    data: logs.map(log => ({
      ...log,
      before: log.before ? JSON.parse(log.before) : null,
      after: log.after ? JSON.parse(log.after) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
