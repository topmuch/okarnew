/**
 * OKAR - QR Code PDF Generator
 * 
 * Génère des PDFs pour les QR codes
 * Utilise jsPDF pour la génération côté client
 */

import { generateQRCodeDataUrl, getPublicQRUrl } from './qrcode'

export interface QRCodePDFItem {
  code: string
  type: 'garage' | 'particulier'
  status: 'stock' | 'active' | 'lost'
  createdAt: string
  activatedByName?: string
  vehiclePlateNumber?: string
}

/**
 * Génère un PDF pour un lot de QR codes
 */
export async function generateQRCodesPDF(
  items: QRCodePDFItem[],
  title: string = 'QR Codes OKAR'
): Promise<void> {
  // Import dynamique de jsPDF
  const { jsPDF } = await import('jspdf')
  
  // Créer le PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const qrSize = 40
  const spacing = 10

  // Titre
  doc.setFontSize(20)
  doc.setTextColor(139, 92, 246) // Violet OKAR
  doc.text(title, pageWidth / 2, 20, { align: 'center' })
  
  // Date
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' })

  // Ligne de séparation
  doc.setDrawColor(51, 65, 85)
  doc.line(margin, 35, pageWidth - margin, 35)

  let currentY = 45
  let currentX = margin
  let itemsPerRow = 0
  const maxItemsPerRow = 4

  for (const item of items) {
    // Générer le QR code
    const qrDataUrl = await generateQRCodeDataUrl(getPublicQRUrl(item.code), {
      width: 200,
      margin: 1,
      darkColor: item.type === 'garage' ? '#10B981' : '#8B5CF6',
    })

    // Vérifier si on doit passer à la ligne
    if (itemsPerRow >= maxItemsPerRow) {
      itemsPerRow = 0
      currentX = margin
      currentY += qrSize + spacing + 20
    }

    // Vérifier si on doit passer à une nouvelle page
    if (currentY + qrSize + 20 > pageHeight - margin) {
      doc.addPage()
      currentY = 20
      currentX = margin
    }

    // Fond blanc pour le QR
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(currentX - 2, currentY - 2, qrSize + 4, qrSize + 15, 2, 2, 'F')
    
    // Bordure
    doc.setDrawColor(51, 65, 85)
    doc.roundedRect(currentX - 2, currentY - 2, qrSize + 4, qrSize + 15, 2, 2, 'S')

    // Ajouter l'image QR
    doc.addImage(qrDataUrl, 'PNG', currentX, currentY, qrSize, qrSize)

    // Code sous le QR
    doc.setFontSize(6)
    doc.setTextColor(100, 116, 139)
    const shortCode = item.code.length > 16 ? item.code.substring(0, 16) + '...' : item.code
    doc.text(shortCode, currentX + qrSize / 2, currentY + qrSize + 3, { align: 'center' })

    // Type badge
    doc.setFontSize(5)
    doc.setTextColor(item.type === 'garage' ? 16 : 139, item.type === 'garage' ? 185 : 92, item.type === 'garage' ? 129 : 246)
    doc.text(item.type === 'garage' ? 'GARAGE' : 'PARTICULIER', currentX + qrSize / 2, currentY + qrSize + 8, { align: 'center' })

    currentX += qrSize + spacing
    itemsPerRow++
  }

  // Pied de page sur chaque page
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(
      `OKAR - Passeport Automobile | Page ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Télécharger
  const filename = `OKAR_QRCodes_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * Génère un PDF pour un seul QR code (format carte)
 */
export async function generateSingleQRPDF(
  code: string,
  type: 'garage' | 'particulier',
  ownerName?: string,
  plateNumber?: string
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [85, 55], // Format carte de visite
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const qrSize = 35

  // Générer le QR code
  const qrDataUrl = await generateQRCodeDataUrl(getPublicQRUrl(code), {
    width: 400,
    margin: 1,
    darkColor: type === 'garage' ? '#10B981' : '#8B5CF6',
  })

  // Fond
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Bordure colorée
  doc.setDrawColor(type === 'garage' ? 16 : 139, type === 'garage' ? 185 : 92, type === 'garage' ? 129 : 246)
  doc.setLineWidth(1)
  doc.rect(1, 1, pageWidth - 2, pageHeight - 2, 'S')

  // Logo OKAR
  doc.setFontSize(12)
  doc.setTextColor(139, 92, 246)
  doc.text('OKAR', pageWidth / 2, 8, { align: 'center' })

  // QR Code centré
  const qrX = (pageWidth - qrSize) / 2
  const qrY = 12
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

  // Code
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(code, pageWidth / 2, qrY + qrSize + 5, { align: 'center' })

  // Type
  doc.setFontSize(6)
  doc.setTextColor(type === 'garage' ? 52 : 167, type === 'garage' ? 211 : 139, type === 'garage' ? 153 : 250)
  doc.text(type === 'garage' ? 'GARAGE' : 'PARTICULIER', pageWidth / 2, qrY + qrSize + 9, { align: 'center' })

  // Info propriétaire si dispo
  if (ownerName || plateNumber) {
    doc.setFontSize(5)
    doc.setTextColor(148, 163, 184)
    let infoY = qrY + qrSize + 13
    if (ownerName) {
      doc.text(ownerName, pageWidth / 2, infoY, { align: 'center' })
      infoY += 4
    }
    if (plateNumber) {
      doc.text(plateNumber, pageWidth / 2, infoY, { align: 'center' })
    }
  }

  // URL
  doc.setFontSize(4)
  doc.setTextColor(100, 116, 139)
  doc.text('shopqr.pro', pageWidth / 2, pageHeight - 4, { align: 'center' })

  // Télécharger
  const filename = `OKAR_${code}.pdf`
  doc.save(filename)
}

export default generateQRCodesPDF
