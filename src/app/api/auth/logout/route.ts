/**
 * OKAR - API de Déconnexion
 * 
 * POST /api/auth/logout
 * 
 * Flux:
 * 1. Récupération du token de session
 * 2. Suppression de la session en BDD
 * 3. Suppression du cookie
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken, deleteSession, clearSessionCookie } from '@/lib/auth/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken()

    if (token) {
      // Log d'audit avant suppression
      const session = await db.session.findUnique({
        where: { token },
        select: { userId: true },
      })

      if (session) {
        await db.auditLog.create({
          data: {
            userId: session.userId,
            action: 'LOGOUT',
            entityType: 'session',
            entityId: token,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          },
        })
      }

      // Suppression de la session
      await deleteSession(token)
    }

    // Suppression du cookie
    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur de logout:', error)
    // Même en cas d'erreur, on supprime le cookie
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  }
}
