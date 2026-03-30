/**
 * OKAR - API de Gestion des Demandes d'Inscription
 * 
 * GET /api/superadmin/requests - Liste les utilisateurs en attente de validation
 * POST /api/superadmin/requests - Valide ou rejette une demande
 * 
 * Actions disponibles:
 * - validate: Approuve l'utilisateur (isApproved: true)
 * - reject: Rejette et supprime l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/auth'

// GET - Liste les utilisateurs en attente de validation
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer tous les utilisateurs non approuvés
    const pendingUsers = await db.user.findMany({
      where: {
        isApproved: false,
        role: {
          not: 'superadmin' // Exclure les superadmins
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        garage: {
          select: {
            id: true,
            businessName: true,
            address: true,
            city: true,
            phone: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques
    const stats = {
      total: pendingUsers.length,
      drivers: pendingUsers.filter(u => u.role === 'driver').length,
      garages: pendingUsers.filter(u => u.role === 'garage_pending').length,
    }

    return NextResponse.json({
      success: true,
      requests: pendingUsers,
      stats
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Valider ou rejeter une demande
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, userId, reason } = body

    // Validation des entrées
    if (!action || !userId) {
      return NextResponse.json(
        { success: false, error: 'Action et userId requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe et est en attente
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { garage: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (user.isApproved) {
      return NextResponse.json(
        { success: false, error: 'Cet utilisateur est déjà approuvé' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'validate':
        // Valider l'utilisateur
        result = await db.$transaction(async (tx) => {
          // Mettre à jour l'utilisateur
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              isApproved: true,
              // Si c'est un garage en attente, le passer en garage_certified
              role: user.role === 'garage_pending' ? 'garage_certified' : user.role
            }
          })

          // Si c'est un garage, activer son garage
          if (user.garage) {
            await tx.garage.update({
              where: { id: user.garage.id },
              data: { 
                isActive: true,
                certificationDate: new Date()
              }
            })
          }

          // Log d'audit
          await tx.auditLog.create({
            data: {
              userId: currentUser.id,
              action: 'USER_VALIDATED',
              entityType: 'user',
              entityId: userId,
              details: JSON.stringify({
                validatedUserId: userId,
                validatedEmail: user.email,
                validatedRole: user.role
              }),
              ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
            }
          })

          return updatedUser
        })

        return NextResponse.json({
          success: true,
          message: 'Utilisateur validé avec succès',
          user: result
        })

      case 'reject':
        // Rejeter et supprimer l'utilisateur
        result = await db.$transaction(async (tx) => {
          // Log d'audit avant suppression
          await tx.auditLog.create({
            data: {
              userId: currentUser.id,
              action: 'USER_REJECTED',
              entityType: 'user',
              entityId: userId,
              details: JSON.stringify({
                rejectedEmail: user.email,
                rejectedRole: user.role,
                reason: reason || 'Non spécifié'
              }),
              ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
            }
          })

          // Supprimer le garage si existe
          if (user.garage) {
            await tx.garage.delete({
              where: { id: user.garage.id }
            })
          }

          // Supprimer l'utilisateur
          await tx.user.delete({
            where: { id: userId }
          })

          return { deleted: true }
        })

        return NextResponse.json({
          success: true,
          message: 'Demande rejetée et utilisateur supprimé'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
