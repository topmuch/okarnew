/**
 * OKAR - API Statistiques Superadmin
 * 
 * GET /api/superadmin/stats
 * Retourne les KPIs pour le dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et le rôle
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer les statistiques
    const [
      totalVehicles,
      totalGarages,
      activeGarages,
      pendingGarages,
      suspendedGarages,
      totalUsers,
      totalDrivers,
      totalQRStock,
      totalQRActive,
      totalQRLost,
      totalQRGarage,
      totalQRParticulier,
      totalRevenue,
    ] = await Promise.all([
      // Total véhicules
      db.vehicle.count(),
      
      // Total garages
      db.garage.count(),
      
      // Garages actifs
      db.garage.count({
        where: { isActive: true },
      }),
      
      // Garages en attente (utilisateurs avec role garage_pending)
      db.user.count({
        where: { role: 'garage_pending' },
      }),
      
      // Garages suspendus
      db.garage.count({
        where: { isActive: false },
      }),
      
      // Total utilisateurs
      db.user.count(),
      
      // Total drivers
      db.user.count({
        where: { role: 'driver' },
      }),
      
      // QR codes en stock
      db.qRCode.count({
        where: { status: 'stock' },
      }),
      
      // QR codes actifs
      db.qRCode.count({
        where: { status: 'active' },
      }),
      
      // QR codes perdus
      db.qRCode.count({
        where: { status: 'lost' },
      }),
      
      // QR codes type garage
      db.qRCode.count({
        where: { type: 'garage' },
      }),
      
      // QR codes type particulier
      db.qRCode.count({
        where: { type: 'particulier' },
      }),
      
      // Revenus totaux (somme des paiements complétés)
      db.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
    ])

    // Calculer les tendances (comparaison avec le mois précédent)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [vehiclesThisMonth, vehiclesLastMonth] = await Promise.all([
      db.vehicle.count({
        where: {
          createdAt: { gte: thisMonth },
        },
      }),
      db.vehicle.count({
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
        },
      }),
    ])

    const vehicleGrowth = vehiclesLastMonth > 0 
      ? ((vehiclesThisMonth - vehiclesLastMonth) / vehiclesLastMonth) * 100 
      : 0

    // Construire la réponse
    const stats = {
      vehicles: {
        total: totalVehicles,
        thisMonth: vehiclesThisMonth,
        growth: Math.round(vehicleGrowth * 10) / 10,
      },
      garages: {
        total: totalGarages,
        active: activeGarages,
        pending: pendingGarages,
        suspended: suspendedGarages,
      },
      users: {
        total: totalUsers,
        drivers: totalDrivers,
      },
      qrCodes: {
        total: totalQRStock + totalQRActive + totalQRLost,
        stock: totalQRStock,
        active: totalQRActive,
        lost: totalQRLost,
        garage: totalQRGarage,
        particulier: totalQRParticulier,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        currency: 'XOF',
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
