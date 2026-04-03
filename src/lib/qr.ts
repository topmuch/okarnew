/**
 * CleanCheck - QR Code Utilities
 *
 * Provides QR code generation, JWT-based QR payload creation,
 * verification, and QR validity checks.
 */

import QRCode from 'qrcode'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'cleancheck-dev-secret'
const QR_JWT_EXPIRES_IN = '4h'
const QR_VALIDITY_HOURS = 4

// ============================================================================
// QR PAYLOAD (JWT)
// ============================================================================

export interface QRPayload {
  interventionId: string
  companyId: string
  token: string
}

/**
 * Generate a JWT payload for a QR code.
 * Contains interventionId and companyId, expires in 4 hours.
 */
export function generateQRPayload(
  interventionId: string,
  companyId: string,
  token: string
): string {
  const payload = {
    interventionId,
    companyId,
    token,
    type: 'cleancheck-qr',
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: QR_JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

/**
 * Verify and decode a QR JWT token.
 * Returns the decoded payload or null if invalid/expired.
 */
export function verifyQRPayload(token: string): object | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as object & { type?: string }

    // Ensure this is a CleanCheck QR token
    if ((decoded as { type?: string }).type !== 'cleancheck-qr') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

// ============================================================================
// QR CODE IMAGE GENERATION
// ============================================================================

export interface QRCodeImageOptions {
  width?: number
  margin?: number
  darkColor?: string
  lightColor?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

const DEFAULT_QR_OPTIONS: QRCodeImageOptions = {
  width: 400,
  margin: 2,
  darkColor: '#1e293b',
  lightColor: '#ffffff',
  errorCorrectionLevel: 'H',
}

/**
 * Generate a QR code image as a data URL (base64).
 */
export async function generateQRCodeImage(
  data: string,
  options: QRCodeImageOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options }

  return QRCode.toDataURL(data, {
    width: mergedOptions.width,
    margin: mergedOptions.margin,
    color: {
      dark: mergedOptions.darkColor!,
      light: mergedOptions.lightColor!,
    },
    errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
  })
}

// ============================================================================
// QR VALIDITY
// ============================================================================

/**
 * Check if a QR code is still valid (not expired and not used).
 * QR codes expire 4 hours after generation.
 */
export function isQRValid(qrGeneratedAt: Date, qrUsed: boolean): boolean {
  if (qrUsed) return false

  const now = new Date()
  const expiresAt = new Date(qrGeneratedAt.getTime() + QR_VALIDITY_HOURS * 60 * 60 * 1000)

  return now < expiresAt
}

/**
 * Get the remaining validity time for a QR code in minutes.
 * Returns 0 if expired.
 */
export function getQRRemainingMinutes(qrGeneratedAt: Date): number {
  const now = new Date()
  const expiresAt = new Date(qrGeneratedAt.getTime() + QR_VALIDITY_HOURS * 60 * 60 * 1000)
  const remainingMs = expiresAt.getTime() - now.getTime()

  return Math.max(0, Math.floor(remainingMs / (60 * 1000)))
}
