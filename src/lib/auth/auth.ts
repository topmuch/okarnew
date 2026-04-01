/**
 * OKAR - Utilitaires d'Authentification
 * 
 * Ce module contient toutes les fonctions utilitaires pour:
 * - Hachage et vérification des mots de passe
 * - Génération et validation des tokens de session
 * - Gestion des cookies de session
 */

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

// Configuration
const SESSION_COOKIE_NAME = 'okar_session'
const SESSION_DURATION_DAYS = 7
const TOKEN_LENGTH = 32

// Type pour l'utilisateur
export interface CurrentUser {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  isApproved: boolean
  subscriptionStatus: string
}

/**
 * Hache un mot de passe avec scrypt (algorithme sécurisé)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Vérifie un mot de passe contre son hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':')
    const derivedKey = scryptSync(password, salt, 64)
    const storedKey = Buffer.from(hash, 'hex')
    return timingSafeEqual(derivedKey, storedKey)
  } catch {
    return false
  }
}

/**
 * Génère un token de session sécurisé
 */
export function generateSessionToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex')
}

/**
 * Calcule la date d'expiration de la session
 */
export function getSessionExpiry(): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + SESSION_DURATION_DAYS)
  return expiry
}

/**
 * Crée une session pour un utilisateur
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = getSessionExpiry()

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

/**
 * Valide une session et retourne l'utilisateur
 */
export async function validateSession(token: string): Promise<{
  user: CurrentUser
  session: { id: string; token: string; expiresAt: Date; userId: string; createdAt: Date }
} | null> {
  if (!token) return null

  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isApproved: true,
          subscriptionStatus: true,
        },
      },
    },
  })

  if (!session) return null

  // Vérifier l'expiration
  if (new Date() > session.expiresAt) {
    await db.session.delete({ where: { id: session.id } })
    return null
  }

  return {
    user: session.user as CurrentUser,
    session,
  }
}

/**
 * Supprime une session
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.delete({ where: { token } })
  } catch {
    // Session déjà supprimée ou inexistante
  }
}

/**
 * Récupère le token de session depuis les cookies
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

/**
 * Définit le cookie de session
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: '/',
  })
}

/**
 * Supprime le cookie de session
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getSessionToken()
  if (!token) return null

  const result = await validateSession(token)
  return result?.user || null
}

/**
 * Récupère la session complète (utilisateur + session)
 */
export async function getCurrentSession() {
  const token = await getSessionToken()
  if (!token) return null

  return validateSession(token)
}
