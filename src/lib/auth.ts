/**
 * CleanCheck - Authentication Utilities
 *
 * Provides password hashing, JWT token management,
 * PIN code generation, and rate limiting.
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'cleancheck-dev-secret'
const JWT_EXPIRES_IN = '7d'
const BCRYPT_SALT_ROUNDS = 12

// ============================================================================
// PASSWORD
// ============================================================================

/**
 * Hash a password using bcrypt with 12 salt rounds.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS)
}

/**
 * Verify a password against its stored bcrypt hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

// ============================================================================
// JWT TOKENS
// ============================================================================

export interface TokenPayload {
  userId: string
  email: string
  role: string
  companyId?: string
}

/**
 * Generate a signed JWT token.
 */
export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or null if invalid/expired.
 */
export function verifyToken(token: string): object | null {
  try {
    return jwt.verify(token, JWT_SECRET) as object
  } catch {
    return null
  }
}

// ============================================================================
// SESSION (DB-backed)
// ============================================================================

import db from './db'

/**
 * Create a session in DB and return a JWT token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken({ userId })

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  return token
}

/**
 * Delete a session from DB by token.
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.deleteMany({ where: { token } })
  } catch {
    // Session might not exist, ignore error
  }
}

// ============================================================================
// PIN CODE
// ============================================================================

/**
 * Generate a random 6-digit PIN code as a string.
 */
export function generatePinCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ============================================================================
// RATE LIMITING (simple in-memory)
// ============================================================================

interface RateLimitEntry {
  attempts: number
  firstAttemptAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check if a request from the given IP is rate limited.
 * Returns true if the request should be blocked.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry) {
    rateLimitMap.set(ip, { attempts: 1, firstAttemptAt: now })
    return false
  }

  // If the window has expired, reset
  if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { attempts: 1, firstAttemptAt: now })
    return false
  }

  // Increment attempts
  entry.attempts++

  // Check if rate limit exceeded
  if (entry.attempts > RATE_LIMIT_MAX_ATTEMPTS) {
    return true
  }

  return false
}

/**
 * Get the remaining attempts for an IP address.
 */
export function getRemainingAttempts(ip: string): number {
  const entry = rateLimitMap.get(ip)
  if (!entry) return RATE_LIMIT_MAX_ATTEMPTS

  const now = Date.now()
  if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    return RATE_LIMIT_MAX_ATTEMPTS
  }

  return Math.max(0, RATE_LIMIT_MAX_ATTEMPTS - entry.attempts)
}

/**
 * Reset rate limit for an IP (e.g., after successful auth).
 */
export function resetRateLimit(ip: string): void {
  rateLimitMap.delete(ip)
}
