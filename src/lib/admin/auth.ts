/**
 * CleanCheck - SuperAdmin Authentication
 *
 * Verifies SuperAdmin role on protected routes.
 * Provides impersonation token management.
 */

import { cookies } from 'next/headers'
import db from '@/lib/db'
import { verifyToken, createSession, deleteSession } from '@/lib/auth'

interface TokenPayload {
  userId: string
  email: string
  role: string
  companyId?: string
}

interface SuperAdminContext {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isImpersonating: boolean
  impersonatedCompanyId?: string
}

/**
 * Extract and validate the current user as SuperAdmin.
 * Checks both Authorization header and cookies for the token.
 * Throws descriptive errors for middleware handling.
 */
export async function requireSuperAdmin(): Promise<SuperAdminContext> {
  const headersList = await headers()

  // Try Authorization header first, then cookie
  let token =
    headersList.get('authorization')?.replace('Bearer ', '') ||
    (await cookies()).get('cleancheck_token')?.value

  if (!token) {
    throw new Error('UNAUTHORIZED: Missing authorization token')
  }

  const payload = verifyToken(token) as TokenPayload | null

  if (!payload?.userId) {
    throw new Error('UNAUTHORIZED: Invalid or expired token')
  }

  // Validate session in DB
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) {
    throw new Error('UNAUTHORIZED: Session expired or invalid')
  }

  if (!session.user.isActive) {
    throw new Error('FORBIDDEN: Account is disabled')
  }

  if (session.user.role !== 'superadmin') {
    throw new Error('FORBIDDEN: SuperAdmin access required')
  }

  return {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    role: session.user.role,
    isImpersonating: false,
  }
}

/**
 * Get the client IP address from request headers.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    headersList.get('x-client-ip') ||
    'unknown'
  )
}

/**
 * Get the user agent from request headers.
 */
export async function getUserAgent(): Promise<string> {
  const headersList = await headers()
  return headersList.get('user-agent') || 'unknown'
}

/**
 * Generate an impersonation token for a company.
 * Creates a temporary session using a manager account from the target company.
 */
export async function startImpersonation(
  superAdminId: string,
  companyId: string,
  reason: string,
  ipAddress: string,
  userAgent: string,
): Promise<string> {
  // Verify company exists
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true },
  })

  if (!company) {
    throw new Error('NOT_FOUND: Company not found')
  }

  // Find a manager user in the company to impersonate
  const manager = await db.user.findFirst({
    where: { companyId, role: 'manager', isActive: true },
  })

  if (!manager) {
    throw new Error('NOT_FOUND: No active manager found in this company')
  }

  // Create impersonation session
  const token = await createSession(manager.id)

  return token
}

/**
 * End an impersonation session.
 */
export async function endImpersonation(token: string): Promise<void> {
  await deleteSession(token)
}
