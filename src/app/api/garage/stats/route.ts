/**
 * OKAR - Garage Stats API
 * Retourne les statistiques complètes du garage connecté
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/stats - Récupérer les statistiques du garage
export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID du garage depuis les headers (simulation pour l'instant)
    const garageId = request.headers.get('x-garage-id') || 'demo-garage-id'
    
    // Récupérer le garage
    const garage = await db.garage.findUnique({
      where: { id: garageId },
      include: {
        badges: true,
        _count: {
          select: {
            vehicles: true,
            interventions: true,
            clients: true,
            qrCodes: true,
          }
        }
      }
    })

    if (!garage) {
      // Retourner des données de démo si le garage n'existe pas
      return NextResponse.json({
        success: true,
        data: getDemoStats()
      })
    }

    // Calculer les statistiques du mois en cours
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Clients OKAR ce mois
    const clientsThisMonth = await db.vehicle.count({
      where: {
        garageId: garage.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Interventions ce mois
    const interventionsThisMonth = await db.maintenanceRecord.count({
      where: {
        garageId: garage.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // CA estimé ce mois
    const revenueThisMonth = await db.maintenanceRecord.aggregate({
      where: {
        garageId: garage.id,
        createdAt: {
          gte: startOfMonth
        },
        status: 'validated'
      },
      _sum: {
        cost: true
      }
    })

    // QR Codes disponibles
    const qrStock = await db.qRCode.count({
      where: {
        assignedGarageId: garage.id,
        status: 'stock'
      }
    })

    // QR Codes utilisés
    const qrUsed = await db.qRCode.count({
      where: {
        assignedGarageId: garage.id,
        status: 'active'
      }
    })

    // Classement local (simulation)
    const allGarages = await db.garage.findMany({
      where: {
        city: garage.city,
        isActive: true
      },
      orderBy: {
        rating: 'desc'
      }
    })
    
    const ranking = allGarages.findIndex(g => g.id === garage.id) + 1

    return NextResponse.json({
      success: true,
      data: {
        // Stats financières
        clientsOKAR: clientsThisMonth,
        caEstime: revenueThisMonth._sum.cost || 0,
        visites: interventionsThisMonth,
        
        // Gamification
        note: garage.rating,
        badges: garage.badges.map(b => ({
          type: b.badgeType,
          name: b.badgeName,
          earnedAt: b.earnedAt
        })),
        classement: {
          position: ranking,
          total: allGarages.length,
          ville: garage.city
        },
        
        // Stock QR
        qrStock: {
          total: qrStock + qrUsed,
          disponibles: qrStock,
          utilises: qrUsed
        },
        
        // Compteurs
        totalVehicles: garage._count.vehicles,
        totalInterventions: garage._count.interventions,
        totalClients: garage._count.clients,
        
        // Abonnement
        subscription: {
          plan: garage.subscriptionPlan,
          status: garage.subscriptionStatus,
          expiry: garage.subscriptionExpiry
        }
      }
    })
  } catch (error) {
    console.error('Erreur stats garage:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

// Données de démo pour le développement
function getDemoStats() {
  return {
    clientsOKAR: 156,
    caEstime: 2450000,
    visites: 234,
    note: 4.8,
    badges: [
      { type: 'top_garage', name: 'Top Garage', earnedAt: new Date('2024-01-15') },
      { type: 'reactive', name: 'Réactif', earnedAt: new Date('2024-02-01') },
      { type: 'certified_premium', name: 'Certifié Premium', earnedAt: new Date('2024-03-10') }
    ],
    classement: {
      position: 3,
      total: 45,
      ville: 'Dakar'
    },
    qrStock: {
      total: 200,
      disponibles: 153,
      utilises: 47
    },
    totalVehicles: 89,
    totalInterventions: 342,
    totalClients: 156,
    subscription: {
      plan: 'premium',
      status: 'active',
      expiry: new Date('2025-12-31')
    }
  }
}
