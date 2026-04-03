import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import { updateFeatureFlagSchema } from '@/lib/admin/validation'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

type RouteContext = { params: Promise<{ id: string }> }

// In-memory feature flag store (shared with feature-flags/route.ts)
// In production, use a shared module or DB
interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  createdAt: string
  updatedAt: string
}

// Access the same in-memory store via global to share between route files
const getFeatureFlags = (): Map<string, FeatureFlag> => {
  if (!(globalThis as Record<string, unknown>).__featureFlags) {
    (globalThis as Record<string, unknown>).__featureFlags = new Map<string, FeatureFlag>()
  }
  return (globalThis as Record<string, unknown>).__featureFlags as Map<string, FeatureFlag>
}

// PATCH /api/admin/feature-flags/[id] — Update feature flag
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    const flags = getFeatureFlags()
    let targetFlag: FeatureFlag | null = null
    let targetKey: string | null = null

    for (const [key, flag] of flags.entries()) {
      if (flag.id === id) {
        targetFlag = flag
        targetKey = key
        break
      }
    }

    if (!targetFlag || !targetKey) {
      return error('NOT_FOUND: Feature flag not found', 404)
    }

    const body = await request.json()
    const parsed = updateFeatureFlagSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
    }

    const before = { ...targetFlag }
    const data = parsed.data

    const updated: FeatureFlag = {
      ...targetFlag,
      name: data.name !== undefined ? data.name : targetFlag.name,
      description: data.description !== undefined ? data.description : targetFlag.description,
      enabled: data.enabled !== undefined ? data.enabled : targetFlag.enabled,
      rolloutPercentage: data.rolloutPercentage !== undefined ? data.rolloutPercentage : targetFlag.rolloutPercentage,
      updatedAt: new Date().toISOString(),
    }

    flags.set(targetKey, updated)

    await createAuditLog({
      action: 'feature_flag.update',
      userId: admin.id,
      targetId: id,
      targetType: 'FeatureFlag',
      details: { before, after: data },
      ipAddress: ip,
      userAgent,
    })

    return success(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    if (message.startsWith('NOT_FOUND')) return error(message, 404)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}

// DELETE /api/admin/feature-flags/[id] — Remove feature flag
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    const flags = getFeatureFlags()
    let targetKey: string | null = null
    let targetFlag: FeatureFlag | null = null

    for (const [key, flag] of flags.entries()) {
      if (flag.id === id) {
        targetFlag = flag
        targetKey = key
        break
      }
    }

    if (!targetFlag || !targetKey) {
      return error('NOT_FOUND: Feature flag not found', 404)
    }

    flags.delete(targetKey)

    await createAuditLog({
      action: 'feature_flag.delete',
      userId: admin.id,
      targetId: id,
      targetType: 'FeatureFlag',
      details: { key: targetFlag.key, name: targetFlag.name },
      ipAddress: ip,
      userAgent,
    })

    return success({ message: `Feature flag "${targetFlag.name}" deleted successfully` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    if (message.startsWith('NOT_FOUND')) return error(message, 404)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}
