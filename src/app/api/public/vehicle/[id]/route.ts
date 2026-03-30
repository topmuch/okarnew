/**
 * OKAR - API Publique Passeport Véhicule
 * 
 * GET /api/public/vehicle/[id]
 * 
 * Retourne les informations publiques du passeport numérique d'un véhicule.
 * Accessible sans authentification pour les scans QR code.
 * 
 * Mis à jour : Utilise les nouveaux champs de dates pour Assurance et CT
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  calculateInsuranceStatus, 
  calculateTechnicalCheckStatus 
} from '@/lib/documentStatus'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID véhicule requis' },
        { status: 400 }
      )
    }

    // Récupérer le véhicule avec toutes les infos publiques
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        qrCode: {
          select: {
            code: true,
            activatedAt: true,
          }
        },
        garage: {
          select: {
            id: true,
            businessName: true,
            city: true,
            address: true,
            phone: true,
          }
        },
        maintenanceHistory: {
          where: {
            status: 'validated'
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            mileage: true,
            cost: true,
            createdAt: true,
            garage: {
              select: {
                businessName: true,
                city: true,
              }
            }
          }
        },
        alerts: {
          where: {
            isResolved: false
          },
          select: {
            id: true,
            type: true,
            message: true,
            severity: true,
          }
        },
        stats: true,
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: 'Véhicule non trouvé' },
        { status: 404 }
      )
    }

    // Calculer les statuts avec les nouveaux champs (avec fallback pour compatibilité)
    const insuranceStatusResult = calculateInsuranceStatus(
      vehicle.insuranceStartDate || null,
      vehicle.insuranceEndDate || vehicle.insuranceExpiryDate || null
    )

    const technicalCheckStatusResult = calculateTechnicalCheckStatus(
      vehicle.technicalCheckStartDate || null,
      vehicle.technicalCheckEndDate || vehicle.technicalControlDate || null
    )

    // Compter les accidents dans l'historique
    const accidentCount = vehicle.maintenanceHistory.filter(
      m => m.type === 'accident'
    ).length

    // Construire la réponse publique
    const passportData = {
      // Informations de base
      id: vehicle.id,
      plateNumber: vehicle.plateNumber,
      
      // Fiche technique
      vehicle: {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        mileage: vehicle.mileage,
        vin: vehicle.vin ? maskVin(vehicle.vin) : null,
        // Ces champs peuvent être ajoutés au schéma plus tard
        fuel: null as string | null,
        transmission: null as string | null,
        owners: 1, // Valeur par défaut
      },

      // Score de confiance OKAR
      trustScore: {
        score: vehicle.healthScore,
        label: getScoreLabel(vehicle.healthScore),
        color: getScoreColor(vehicle.healthScore),
      },

      // Alertes critiques avec données enrichies
      documents: {
        insurance: {
          status: insuranceStatusResult.status,
          startDate: vehicle.insuranceStartDate?.toISOString() || null,
          endDate: vehicle.insuranceEndDate?.toISOString() || vehicle.insuranceExpiryDate?.toISOString() || null,
          daysRemaining: insuranceStatusResult.daysRemaining,
          isValid: insuranceStatusResult.isValid,
          label: insuranceStatusResult.label,
          color: insuranceStatusResult.color,
          bgColor: insuranceStatusResult.bgColor,
        },
        technicalControl: {
          status: technicalCheckStatusResult.status,
          startDate: vehicle.technicalCheckStartDate?.toISOString() || null,
          endDate: vehicle.technicalCheckEndDate?.toISOString() || vehicle.technicalControlDate?.toISOString() || null,
          daysRemaining: technicalCheckStatusResult.daysRemaining,
          isValid: technicalCheckStatusResult.isValid,
          label: technicalCheckStatusResult.label,
          color: technicalCheckStatusResult.color,
          bgColor: technicalCheckStatusResult.bgColor,
        },
      },

      // Sinistres
      accidents: {
        count: accidentCount,
        hasAccidents: accidentCount > 0,
        lastAccidentDate: accidentCount > 0 
          ? vehicle.maintenanceHistory.find(m => m.type === 'accident')?.createdAt.toISOString() 
          : null,
      },

      // Historique récent (3 dernières interventions)
      recentHistory: vehicle.maintenanceHistory.slice(0, 3).map(m => ({
        id: m.id,
        type: m.type,
        title: m.title,
        date: m.createdAt.toISOString(),
        mileage: m.mileage,
        garageName: m.garage.businessName,
        garageCity: m.garage.city,
      })),

      // Garage de suivi
      garage: vehicle.garage ? {
        name: vehicle.garage.businessName,
        city: vehicle.garage.city,
        address: vehicle.garage.address,
      } : null,

      // QR Code info
      qrCode: vehicle.qrCode ? {
        code: vehicle.qrCode.code,
        activatedAt: vehicle.qrCode.activatedAt?.toISOString() || null,
      } : null,

      // Statistiques (si disponibles)
      stats: vehicle.stats ? {
        estimatedValue: vehicle.stats.estimatedValue,
        resaleScore: vehicle.stats.resaleScore,
      } : null,

      // Métadonnées
      generatedAt: new Date().toISOString(),
      pageUrl: `https://okar.sn/v/${vehicle.id}`,
    }

    return NextResponse.json({
      success: true,
      data: passportData
    })

  } catch (error) {
    console.error('Erreur récupération passeport véhicule:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

// Fonctions utilitaires

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Très bon'
  if (score >= 50) return 'Bon'
  if (score >= 30) return 'Moyen'
  return 'À surveiller'
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'emerald'  // Vert brillant
  if (score >= 70) return 'green'    // Vert
  if (score >= 50) return 'amber'    // Orange
  if (score >= 30) return 'orange'   // Orange foncé
  return 'red'                       // Rouge
}

function maskVin(vin: string): string {
  // Masquer le VIN pour la vue publique (garder les 4 premiers et 4 derniers caractères)
  if (vin.length <= 8) return vin
  return vin.slice(0, 4) + '****' + vin.slice(-4)
}
