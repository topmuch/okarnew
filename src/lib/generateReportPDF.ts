/**
 * OKAR - Génération de Rapport PDF
 * 
 * Génère un rapport style Carfax avec:
 * - QR Code de vérification (URL publique)
 * - Historique complet
 * - Graphiques KM
 * - Score de confiance (avec état "Non Évalué")
 * - Preuves photos (placeholders)
 */

import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import type { ScoreResult } from './scoreCalculator'

// Types
interface VehicleData {
  plate: string
  brand: string
  model: string
  year: number
  color: string
  mileage: number
  healthScore: number | null  // Peut être null si non évalué
  scoreResult?: ScoreResult   // Nouveau: Score détaillé
  firstRegistration: string
  owners: number
  ctStatus: string
  ctExpiry: string
  lastInspection: string
  history: Array<{
    date: string
    type: string
    mileage: number
    garage: string
  }>
  issues: string[]
  qrCode?: string  // QR code OKAR du véhicule
}

// Couleurs OKAR
const COLORS = {
  orange: '#F97316',
  pink: '#EC4899',
  blue: '#3B82F6',
  green: '#22C55E',
  red: '#EF4444',
  gray: '#6B7280',
  dark: '#1F2937',
  light: '#F3F4F6',
}

/**
 * Génère l'URL publique du véhicule
 */
function getPublicUrl(plate: string, qrCode?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopqr.pro'
  if (qrCode) {
    return `${baseUrl}/q/${qrCode}`
  }
  return `${baseUrl}/search?plate=${encodeURIComponent(plate)}`
}

/**
 * Génère le QR Code en base64
 */
async function generateQRCodeBase64(url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
    return dataUrl
  } catch (error) {
    console.error('Erreur génération QR code:', error)
    return ''
  }
}

export async function generateReportPDF(data: VehicleData): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Générer l'URL publique et le QR code
  const publicUrl = getPublicUrl(data.plate, data.qrCode)
  const qrCodeBase64 = await generateQRCodeBase64(publicUrl)

  // Déterminer le statut du score
  const scoreStatus = data.scoreResult?.status ?? (data.healthScore !== null ? 'evaluated' : 'not_evaluated')
  const isNotEvaluated = scoreStatus === 'not_evaluated'
  const scoreValue = data.scoreResult?.score ?? data.healthScore

  // ===========================================
  // HEADER
  // ===========================================
  
  // Fond gradient header (simulé avec rectangle)
  doc.setFillColor(249, 115, 22) // Orange
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Logo texte OKAR
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('OKAR', 20, 25)
  
  // Sous-titre
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Rapport Véhicule Complet', 20, 35)
  
  // Date du rapport
  doc.setFontSize(10)
  const today = new Date().toLocaleDateString('fr-FR')
  doc.text(`Généré le ${today}`, pageWidth - 60, 25)
  
  yPosition = 55

  // ===========================================
  // INFO VÉHICULE
  // ===========================================
  
  // Titre section
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Informations du Véhicule', 20, yPosition)
  yPosition += 10
  
  // Ligne séparatrice
  doc.setDrawColor(249, 115, 22)
  doc.setLineWidth(0.5)
  doc.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 10

  // Cadre info véhicule
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(20, yPosition, pageWidth - 40, 45, 3, 3, 'F')
  
  // Plaque
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(data.plate, 30, yPosition + 15)
  
  // Marque/Modèle
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.brand} ${data.model}`, 30, yPosition + 28)
  
  // Année et couleur
  doc.setFontSize(11)
  doc.setTextColor(107, 114, 128)
  doc.text(`${data.year} • ${data.color} • ${data.mileage.toLocaleString()} km`, 30, yPosition + 38)
  
  // Score de santé
  if (isNotEvaluated) {
    // Score non évalué - Fond gris
    doc.setFillColor(156, 163, 175) // Gray
    doc.circle(pageWidth - 45, yPosition + 22, 15, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('NON', pageWidth - 45, yPosition + 19, { align: 'center' })
    doc.text('ÉVALUÉ', pageWidth - 45, yPosition + 27, { align: 'center' })
  } else if (scoreValue !== null) {
    // Score évalué
    const scoreColor = scoreValue >= 70 ? COLORS.green : 
                       scoreValue >= 40 ? COLORS.orange : COLORS.red
    
    doc.setFillColor(parseInt(scoreColor.slice(1, 3), 16), 
                    parseInt(scoreColor.slice(3, 5), 16), 
                    parseInt(scoreColor.slice(5, 7), 16))
    doc.circle(pageWidth - 45, yPosition + 22, 15, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${scoreValue}`, pageWidth - 45, yPosition + 25, { align: 'center' })
    
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.text('SCORE', pageWidth - 45, yPosition + 32, { align: 'center' })
  }
  
  yPosition += 60

  // ===========================================
  // DÉTAILS VÉHICULE
  // ===========================================
  
  const detailsLeft = [
    { label: 'Première immatriculation', value: data.firstRegistration },
    { label: 'Nombre de propriétaires', value: data.owners.toString() },
    { label: 'Statut CT', value: data.ctStatus === 'valid' ? 'Valide ✓' : 'Expiré' },
  ]
  
  const detailsRight = [
    { label: 'Expiration CT', value: data.ctExpiry },
    { label: 'Dernière inspection', value: data.lastInspection },
    { label: 'Problèmes détectés', value: data.issues.length > 0 ? `${data.issues.length}` : 'Aucun' },
  ]

  doc.setFontSize(10)
  detailsLeft.forEach((item, index) => {
    doc.setTextColor(107, 114, 128)
    doc.text(item.label, 20, yPosition + index * 8)
    doc.setTextColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    doc.text(item.value, 80, yPosition + index * 8)
    doc.setFont('helvetica', 'normal')
  })

  detailsRight.forEach((item, index) => {
    doc.setTextColor(107, 114, 128)
    doc.text(item.label, 110, yPosition + index * 8)
    doc.setTextColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    doc.text(item.value, 170, yPosition + index * 8)
    doc.setFont('helvetica', 'normal')
  })

  yPosition += 35

  // ===========================================
  // HISTORIQUE DES INTERVENTIONS
  // ===========================================
  
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Historique des Interventions', 20, yPosition)
  yPosition += 10
  
  doc.setDrawColor(236, 72, 153) // Pink
  doc.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 10

  if (data.history.length === 0) {
    // Aucun historique
    doc.setFillColor(243, 244, 246)
    doc.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F')
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Aucune intervention enregistrée pour ce véhicule', pageWidth / 2, yPosition + 15, { align: 'center' })
    yPosition += 35
  } else {
    // Tableau historique
    const headers = ['Date', 'Type', 'Kilométrage', 'Garage']
    const colWidths = [30, 40, 35, 65]
    let xPosition = 20

    // Header du tableau
    doc.setFillColor(249, 115, 22)
    doc.rect(20, yPosition - 5, pageWidth - 40, 8, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 2, yPosition)
      xPosition += colWidths[index]
    })
    
    yPosition += 8
    doc.setFont('helvetica', 'normal')

    // Lignes du tableau
    data.history.forEach((item, index) => {
      // Fond alterné
      if (index % 2 === 0) {
        doc.setFillColor(243, 244, 246)
        doc.rect(20, yPosition - 5, pageWidth - 40, 8, 'F')
      }
      
      doc.setTextColor(31, 41, 55)
      doc.setFontSize(9)
      
      xPosition = 20
      const row = [item.date, item.type, item.mileage.toLocaleString() + ' km', item.garage]
      
      row.forEach((cell, cellIndex) => {
        // Couleur selon le type
        if (cellIndex === 1) {
          if (cell === 'Vidange') {
            doc.setTextColor(34, 197, 94) // Green
          } else if (cell === 'Freins' || cell === 'Pneus') {
            doc.setTextColor(249, 115, 22) // Orange
          } else if (cell === 'Carrosserie') {
            doc.setTextColor(239, 68, 68) // Red
          } else {
            doc.setTextColor(31, 41, 55)
          }
          doc.setFont('helvetica', 'bold')
        } else {
          doc.setTextColor(31, 41, 55)
          doc.setFont('helvetica', 'normal')
        }
        
        doc.text(cell, xPosition + 2, yPosition)
        xPosition += colWidths[cellIndex]
      })
      
      yPosition += 8
    })
    yPosition += 15
  }

  // ===========================================
  // GRAPHIQUE KILOMÉTRAGE (si historique)
  // ===========================================
  
  if (data.history.length >= 2) {
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Évolution du Kilométrage', 20, yPosition)
    yPosition += 10
    
    doc.setDrawColor(59, 130, 246) // Blue
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 15

    // Axes du graphique
    const graphX = 30
    const graphY = yPosition
    const graphWidth = pageWidth - 60
    const graphHeight = 50

    // Axe Y
    doc.setDrawColor(156, 163, 175)
    doc.line(graphX, graphY, graphX, graphY + graphHeight)
    
    // Axe X
    doc.line(graphX, graphY + graphHeight, graphX + graphWidth, graphY + graphHeight)

    // Points de données
    const kmData = data.history.map(h => h.mileage).reverse()
    const minKm = Math.min(...kmData)
    const maxKm = Math.max(...kmData)
    const kmRange = maxKm - minKm || 1

    doc.setFillColor(59, 130, 246)
    kmData.forEach((km, index) => {
      const x = graphX + (index / (kmData.length - 1)) * graphWidth
      const y = graphY + graphHeight - ((km - minKm) / kmRange) * graphHeight
      
      // Point
      doc.circle(x, y, 2, 'F')
      
      // Ligne vers le point suivant
      if (index < kmData.length - 1) {
        const nextKm = kmData[index + 1]
        const nextX = graphX + ((index + 1) / (kmData.length - 1)) * graphWidth
        const nextY = graphY + graphHeight - ((nextKm - minKm) / kmRange) * graphHeight
        
        doc.setDrawColor(59, 130, 246)
        doc.line(x, y, nextX, nextY)
        doc.setFillColor(59, 130, 246)
      }
    })

    // Labels axe Y
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(`${maxKm.toLocaleString()} km`, graphX - 3, graphY + 2, { align: 'right' })
    doc.text(`${minKm.toLocaleString()} km`, graphX - 3, graphY + graphHeight, { align: 'right' })

    yPosition += graphHeight + 30
  }

  // ===========================================
  // SCORE DE CONFIANCE
  // ===========================================
  
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(20, yPosition, pageWidth - 40, 40, 3, 3, 'F')
  
  if (isNotEvaluated) {
    // Non évalué
    doc.setFillColor(156, 163, 175) // Gray
    doc.circle(40, yPosition + 20, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.text('?', 40, yPosition + 24, { align: 'center' })
    
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Score de Confiance OKAR', 60, yPosition + 15)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Historique en construction - Score non disponible', 60, yPosition + 28)
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(107, 114, 128)
    doc.text('NON ÉVALUÉ', pageWidth - 30, yPosition + 25, { align: 'right' })
  } else if (scoreValue !== null) {
    // Score évalué
    const scoreColor = scoreValue >= 70 ? COLORS.green : 
                       scoreValue >= 40 ? COLORS.orange : COLORS.red
    
    doc.setFillColor(34, 197, 94) // Green
    doc.circle(40, yPosition + 20, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.text('✓', 40, yPosition + 24, { align: 'center' })
    
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Score de Confiance OKAR', 60, yPosition + 15)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Historique vérifié et certifié par OKAR', 60, yPosition + 28)
    
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(parseInt(scoreColor.slice(1), 16))
    doc.text(`${scoreValue}/100`, pageWidth - 30, yPosition + 25, { align: 'right' })
  }

  yPosition += 55

  // ===========================================
  // RECOMMANDATIONS
  // ===========================================
  
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Recommandations', 20, yPosition)
  yPosition += 10

  let recommendations: string[]
  
  if (isNotEvaluated) {
    recommendations = [
      '✓ Effectuez votre première vidange chez un garage partenaire OKAR',
      '✓ Faites valider vos documents (CT, assurance)',
      '✓ Votre score sera calculé automatiquement après 3 interventions',
    ]
  } else {
    recommendations = [
      '✓ Prochain CT prévu pour le ' + data.ctExpiry,
      '✓ Vidange recommandée à ' + (data.mileage + 10000).toLocaleString() + ' km',
      '✓ Continuez à faire entretenir votre véhicule chez des garages OKAR',
    ]
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(34, 197, 94)
  
  recommendations.forEach(rec => {
    doc.text(rec, 20, yPosition)
    yPosition += 8
  })

  yPosition += 10

  // ===========================================
  // FOOTER AVEC QR CODE DE VÉRIFICATION
  // ===========================================
  
  const footerY = pageHeight - 35
  
  doc.setFillColor(31, 41, 55)
  doc.rect(0, footerY - 10, pageWidth, 45, 'F')
  
  // QR Code de vérification
  if (qrCodeBase64) {
    try {
      doc.addImage(qrCodeBase64, 'PNG', pageWidth - 50, footerY - 5, 30, 30)
      
      // Label sous le QR
      doc.setTextColor(156, 163, 175)
      doc.setFontSize(6)
      doc.text('Scanner pour', pageWidth - 35, footerY + 28, { align: 'center' })
      doc.text('vérifier', pageWidth - 35, footerY + 32, { align: 'center' })
    } catch (e) {
      console.error('Erreur ajout QR code au PDF:', e)
    }
  }
  
  // Texte footer
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('OKAR - Passeport Numérique Automobile', 20, footerY + 5)
  doc.text('www.okar.sn | contact@okar.sn | +221 78 485 82 26', 20, footerY + 15)
  
  // URL publique
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text(`Vérifier en ligne: ${publicUrl}`, 20, footerY + 25)
  
  // Référence rapport
  doc.setFontSize(7)
  doc.text(`Réf: OKAR-${data.plate}-${Date.now()} | Généré le ${today}`, 20, footerY + 32)

  // ===========================================
  // TÉLÉCHARGEMENT
  // ===========================================
  
  doc.save(`OKAR-Rapport-${data.plate}.pdf`)
}

export default generateReportPDF
