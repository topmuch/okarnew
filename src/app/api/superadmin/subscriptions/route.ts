/**
 * OKAR - API Superadmin Subscriptions
 * Gestion des abonnements des garages et conducteurs
 * 
 * GET - Liste tous les abonnements
 * POST - Crée ou met à jour un abonnement
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Liste tous les abonnements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, expired, all
    const type = searchParams.get('type') // garage, driver, all

    // Récupérer les utilisateurs avec leurs infos d'abonnement
    const users = await db.user.findMany({
      where: {
        role: type === 'garage' ? 'garage_certified' : type === 'driver' ? 'driver' : undefined,
        OR: [
          { role: 'driver' },
          { role: 'garage_certified' }
        ]
      },
      include: {
        garage: {
          select: {
            id: true,
            businessName: true,
            city: true,
          }
        },
        _count: {
          select: {
            vehicles: true,
            maintenanceRecords: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Filtrer par statut d'abonnement
    const filteredUsers = users.filter(user => {
      if (status === 'active') {
        return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'premium'
      }
      if (status === 'expired') {
        return user.subscriptionStatus === 'expired' || user.subscriptionStatus === 'cancelled'
      }
      return true
    })

    // Formater les données
    const subscriptions = filteredUsers.map(user => ({
      id: user.id,
      userId: user.id,
      userName: user.name || 'N/A',
      userEmail: user.email,
      userPhone: user.phone,
      userRole: user.role,
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      subscriptionPlan: (user as any).subscriptionPlan || 'free',
      subscriptionStartDate: (user as any).subscriptionStartDate,
      subscriptionEndDate: (user as any).subscriptionEndDate,
      garage: user.garage ? {
        id: user.garage.id,
        name: user.garage.businessName,
        city: user.garage.city,
      } : null,
      stats: {
        vehicles: user._count.vehicles,
        maintenanceRecords: user._count.maintenanceRecords,
      },
      createdAt: user.createdAt,
    }))

    // Calculer les stats globales
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.subscriptionStatus === 'active' || s.subscriptionStatus === 'premium').length,
      expired: subscriptions.filter(s => s.subscriptionStatus === 'expired' || s.subscriptionStatus === 'cancelled').length,
      free: subscriptions.filter(s => s.subscriptionStatus === 'inactive' || !s.subscriptionStatus).length,
      premium: subscriptions.filter(s => s.subscriptionPlan === 'premium').length,
      byType: {
        garage: subscriptions.filter(s => s.userRole === 'garage_certified').length,
        driver: subscriptions.filter(s => s.userRole === 'driver').length,
      }
    }

    return NextResponse.json({
      success: true,
      subscriptions,
      stats
    })
  } catch (error) {
    console.error('Erreur récupération abonnements:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des abonnements' },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour un abonnement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, status, startDate, endDate } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (plan) updateData.subscriptionPlan = plan
    if (status) updateData.subscriptionStatus = status
    if (startDate) updateData.subscriptionStartDate = new Date(startDate)
    if (endDate) updateData.subscriptionEndDate = new Date(endDate)

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        action: 'SUBSCRIPTION_UPDATED',
        entityType: 'subscription',
        entityId: userId,
        details: JSON.stringify({
          plan,
          status,
          startDate,
          endDate,
        }),
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: (user as any).subscriptionPlan,
      }
    })
  } catch (error) {
    console.error('Erreur mise à jour abonnement:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'abonnement' },
      { status: 500 }
    )
  }
}
