/**
 * OKAR - API de Vérification de Session
 * 
 * GET /api/auth/session
 * 
 * Retourne les informations de l'utilisateur connecté si la session est valide.
 * Utilisé par l'AuthProvider côté client pour vérifier l'état d'authentification.
 */

import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth/auth'

export async function GET() {
  try {
    const result = await getCurrentSession()

    if (!result) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: result.user,
      authenticated: true,
      sessionExpiresAt: result.session.expiresAt,
    })
  } catch (error) {
    console.error('Erreur de vérification de session:', error)
    return NextResponse.json(
      { user: null, authenticated: false },
      { status: 401 }
    )
  }
}
