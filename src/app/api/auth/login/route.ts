/**
 * OKAR - API de Connexion v2
 * 
 * POST /api/auth/login
 * 
 * Flux:
 * 1. Validation des credentials
 * 2. Vérification du mot de passe
 * 3. Création de la session
 * 4. Définition des cookies:
 *    - okar_session: HttpOnly, contient le token
 *    - okar_user_role: Non-HttpOnly, contient le rôle (pour middleware)
 * 5. Retour des infos utilisateur (pour redirection côté client)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation des entrées
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Recherche de l'utilisateur
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isApproved: true,
        subscriptionStatus: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Vérification du mot de passe
    const isValid = verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Vérification de l'approbation pour TOUS les utilisateurs
    // (pas seulement les garages)
    if (!user.isApproved) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Votre compte est en cours de validation par notre équipe. Veuillez réessayer plus tard.',
          code: 'ACCOUNT_PENDING',
          requiresApproval: true
        },
        { status: 403 }
      )
    }

    // Création de la session
    const sessionToken = await createSession(user.id)

    // Définition du cookie de session HttpOnly
    await setSessionCookie(sessionToken)

    // Définition du cookie de rôle (non-HttpOnly pour accès middleware)
    // Ce cookie est sécurisé car il ne contient pas de données sensibles
    // et est validé côté serveur à chaque requête API
    const cookieStore = await cookies()
    cookieStore.set('okar_user_role', user.role, {
      httpOnly: false, // Accessible par le middleware
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'session',
        entityId: sessionToken,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
      },
    })

    // Retour des infos utilisateur (sans le hash)
    const { passwordHash: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })

    return response
  } catch (error) {
    console.error('Erreur de login:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
