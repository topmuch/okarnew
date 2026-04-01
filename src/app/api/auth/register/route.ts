/**
 * OKAR - API d'Inscription
 * 
 * POST /api/auth/register
 * 
 * Permet l'inscription de nouveaux utilisateurs:
 * - Drivers (inscription libre)
 * - Garages (inscription en attente de validation)
 * - Superadmin (création manuelle uniquement, pas via cette API)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/auth'

// Types de compte autorisés à l'auto-inscription
const ALLOWED_ROLES = ['driver', 'garage_pending']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, role = 'driver', garageInfo } = body

    // Validation des entrées
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Validation du rôle
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Type de compte non autorisé' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash du mot de passe
    const passwordHash = hashPassword(password)

    // Création de l'utilisateur
    // Tous les utilisateurs doivent être validés par le SuperAdmin
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        role,
        isApproved: false, // TOUS les comptes nécessitent une validation
        subscriptionStatus: 'free',
      },
    })

    // Si c'est un garage, créer les informations supplémentaires
    if (role === 'garage_pending' && garageInfo) {
      await db.garage.create({
        data: {
          userId: user.id,
          businessName: garageInfo.businessName || 'Mon Garage',
          address: garageInfo.address || '',
          city: garageInfo.city || '',
          phone: garageInfo.phone || phone || '',
          latitude: garageInfo.latitude,
          longitude: garageInfo.longitude,
          isActive: false, // Sera activé après validation
        },
      })
    }

    // NE PAS créer de session - l'utilisateur doit attendre la validation
    // const sessionToken = await createSession(user.id)
    // await setSessionCookie(sessionToken)

    // Log d'audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER_PENDING',
        entityType: 'user',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        details: JSON.stringify({ role, status: 'pending_approval' }),
      },
    })

    // Retour des infos utilisateur (sans connexion automatique)
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      requiresApproval: true,
      message: 'Inscription réussie ! Votre compte est en attente de validation par notre équipe. Vous recevrez une notification dès qu\'il sera approuvé.',
    })
  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
