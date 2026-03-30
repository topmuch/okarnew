/**
 * OKAR API - Driver Report Generation
 * Génère un rapport PDF du véhicule (version gratuite ou payante)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

interface MileageEntry {
  date: Date;
  mileage: number;
  type: string;
}

interface Intervention {
  id: string;
  type: string;
  title: string;
  description: string | null;
  mileage: number;
  cost: number | null;
  createdAt: Date;
  garage: {
    businessName: string;
    address: string;
    city: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'preview' // 'preview' ou 'full'
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le véhicule et son historique
    const vehicle = await db.vehicle.findFirst({
      where: { ownerId: userId },
      include: {
        maintenanceHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            garage: {
              select: {
                businessName: true,
                address: true,
                city: true
              }
            }
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Aucun véhicule trouvé' },
        { status: 404 }
      )
    }

    // Version preview (teaser gratuit)
    if (type === 'preview') {
      return NextResponse.json({
        preview: {
          vehicle: {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            plateNumber: vehicle.plateNumber
          },
          healthScore: vehicle.healthScore,
          totalInterventions: vehicle.maintenanceHistory.length,
          mileage: vehicle.mileage
        },
        message: 'Achetez le rapport complet pour voir tout l\'historique'
      })
    }

    // Version complète - générer le PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Couleurs OKAR
    const okarOrange = '#f97316'
    const okarPink = '#ec4899'
    const gray900 = '#111827'
    const gray600 = '#4b5563'

    // Header
    doc.setFillColor(249, 115, 22) // Orange
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('OKAR', 20, 25)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Passeport Numérique Automobile', 50, 25)

    // Titre du rapport
    doc.setTextColor(17, 24, 39) // Gray 900
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Rapport d\'Historique Véhicule', 20, 55)

    // Informations du véhicule
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Informations du Véhicule', 20, 70)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99) // Gray 600

    const vehicleInfo = [
      `Plaque: ${vehicle.plateNumber}`,
      `Marque/Modèle: ${vehicle.brand} ${vehicle.model}`,
      `Année: ${vehicle.year || 'Non spécifiée'}`,
      `Couleur: ${vehicle.color || 'Non spécifiée'}`,
      `Kilométrage: ${vehicle.mileage.toLocaleString()} km`,
      `Score de Santé: ${vehicle.healthScore}/100`
    ]

    vehicleInfo.forEach((info, index) => {
      doc.text(info, 25, 80 + (index * 7))
    })

    // Score de confiance
    doc.setFillColor(249, 115, 22)
    doc.rect(20, 125, pageWidth - 40, 25, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Score de Confiance OKAR: ${vehicle.healthScore}/100`, 25, 140)

    // Historique des interventions
    doc.setTextColor(17, 24, 39)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Historique des Interventions', 20, 165)

    let yPos = 175
    doc.setFontSize(9)
    
    // En-tête du tableau
    doc.setFillColor(243, 244, 246) // Gray 100
    doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F')
    doc.setTextColor(75, 85, 99)
    doc.setFont('helvetica', 'bold')
    doc.text('Date', 25, yPos)
    doc.text('Type', 55, yPos)
    doc.text('Description', 85, yPos)
    doc.text('Km', 145, yPos)
    doc.text('Montant', 165, yPos)

    yPos += 10
    doc.setFont('helvetica', 'normal')

    // Limiter à 15 interventions pour le PDF
    const limitedHistory = vehicle.maintenanceHistory.slice(0, 15)
    
    limitedHistory.forEach((intervention: Intervention) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      const date = new Date(intervention.createdAt).toLocaleDateString('fr-FR')
      const typeLabels: Record<string, string> = {
        oil_change: 'Vidange',
        major_repair: 'Réparation',
        accident: 'Accident',
        tire_change: 'Pneus',
        battery: 'Batterie',
        inspection: 'Contrôle'
      }

      doc.setTextColor(17, 24, 39)
      doc.text(date, 25, yPos)
      doc.text(typeLabels[intervention.type] || intervention.type, 55, yPos)
      
      // Tronquer la description
      const desc = intervention.title.substring(0, 30)
      doc.text(desc, 85, yPos)
      doc.text(intervention.mileage.toLocaleString(), 145, yPos)
      doc.text(intervention.cost ? `${intervention.cost.toLocaleString()} FCFA` : '-', 165, yPos)

      yPos += 7
    })

    // Pied de page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text(
        `Rapport généré le ${new Date().toLocaleDateString('fr-FR')} | Page ${i}/${pageCount}`,
        pageWidth / 2 - 30,
        290
      )
      doc.text('OKAR - Passeport Numérique Automobile', pageWidth / 2 - 25, 295)
    }

    // Générer le PDF en base64
    const pdfBase64 = doc.output('datauristring')

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `OKAR_Rapport_${vehicle.plateNumber}.pdf`
    })
  } catch (error) {
    console.error('Erreur génération rapport:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
