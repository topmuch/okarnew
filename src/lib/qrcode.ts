/**
 * OKAR - QR Code Generator Utility
 * Fonctions pour générer des QR codes réels
 */

import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  darkColor?: string
  lightColor?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 400,
  margin: 2,
  darkColor: '#0F172A', // OKAR dark blue
  lightColor: '#FFFFFF',
  errorCorrectionLevel: 'H',
}

/**
 * Génère un QR code en Data URL (base64)
 */
export async function generateQRCodeDataUrl(
  data: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  
  return QRCode.toDataURL(data, {
    width: mergedOptions.width,
    margin: mergedOptions.margin,
    color: {
      dark: mergedOptions.darkColor!,
      light: mergedOptions.lightColor!,
    },
    errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
  })
}

/**
 * Génère un QR code sur un canvas
 */
export async function generateQRCodeCanvas(
  canvas: HTMLCanvasElement,
  data: string,
  options: QRCodeOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  
  await QRCode.toCanvas(canvas, data, {
    width: mergedOptions.width,
    margin: mergedOptions.margin,
    color: {
      dark: mergedOptions.darkColor!,
      light: mergedOptions.lightColor!,
    },
    errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
  })
}

/**
 * Génère un QR code en SVG string
 */
export async function generateQRCodeSvg(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  
  return QRCode.toString(data, {
    type: 'svg',
    width: mergedOptions.width,
    margin: mergedOptions.margin,
    color: {
      dark: mergedOptions.darkColor!,
      light: mergedOptions.lightColor!,
    },
    errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
  })
}

/**
 * Télécharge un QR code en PNG
 */
export async function downloadQRCode(
  data: string,
  filename: string,
  options: QRCodeOptions = {}
): Promise<void> {
  const dataUrl = await generateQRCodeDataUrl(data, options)
  
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Génère l'URL publique OKAR pour un QR code
 */
export function getPublicQRUrl(code: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'https://shopqr.pro'
  return `${baseUrl}/q/${code}`
}

/**
 * Génère un QR code avec le logo OKAR au centre (optionnel)
 * Nécessite une image de logo
 */
export async function generateQRCodeWithLogo(
  data: string,
  logoUrl: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  
  // Générer le QR code de base
  const qrDataUrl = await generateQRCodeDataUrl(data, mergedOptions)
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }
    
    const qrImage = new Image()
    qrImage.crossOrigin = 'anonymous'
    
    qrImage.onload = () => {
      canvas.width = qrImage.width
      canvas.height = qrImage.height
      
      // Dessiner le QR code
      ctx.drawImage(qrImage, 0, 0)
      
      // Charger et dessiner le logo
      const logo = new Image()
      logo.crossOrigin = 'anonymous'
      
      logo.onload = () => {
        const logoSize = canvas.width * 0.2 // 20% de la taille
        const logoX = (canvas.width - logoSize) / 2
        const logoY = (canvas.height - logoSize) / 2
        
        // Fond blanc pour le logo
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10)
        
        // Dessiner le logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
        
        resolve(canvas.toDataURL('image/png'))
      }
      
      logo.onerror = () => resolve(qrDataUrl) // Retourner sans logo si erreur
      logo.src = logoUrl
    }
    
    qrImage.onerror = () => reject(new Error('Failed to load QR code'))
    qrImage.src = qrDataUrl
  })
}
