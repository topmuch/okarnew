/**
 * OKAR - Script de Génération de QR Codes
 * 
 * Ce script génère des lots de QR codes uniques pour les véhicules.
 * Usage: bun run src/scripts/generateQR.ts <nombre> [lotId]
 * 
 * Exemple: bun run src/scripts/generateQR.ts 100
 */

import { db } from '../lib/db'
import { randomBytes } from 'crypto'

// Configuration
const QR_CODE_PREFIX = 'OKAR'
const QR_CODE_LENGTH = 8

/**
 * Génère un code QR unique
 */
function generateQRCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sans I, O, 0, 1 pour éviter la confusion
  let code = ''
  const bytes = randomBytes(QR_CODE_LENGTH)
  
  for (let i = 0; i < QR_CODE_LENGTH; i++) {
    code += chars[bytes[i] % chars.length]
  }
  
  return `${QR_CODE_PREFIX}-${code}`
}

/**
 * Vérifie si un code existe déjà
 */
async function codeExists(code: string): Promise<boolean> {
  const existing = await db.qRCode.findUnique({
    where: { code },
  })
  return !!existing
}

/**
 * Génère un code unique (vérifie l'unicité)
 */
async function generateUniqueCode(): Promise<string> {
  let code = generateQRCode()
  let attempts = 0
  const maxAttempts = 10

  while (await codeExists(code) && attempts < maxAttempts) {
    code = generateQRCode()
    attempts++
  }

  if (attempts >= maxAttempts) {
    throw new Error('Impossible de générer un code unique après plusieurs tentatives')
  }

  return code
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2)
  const count = parseInt(args[0]) || 10
  const lotId = args[1] || `LOT-${Date.now()}`

  console.log(`\n🚗 OKAR - Génération de QR Codes`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Nombre: ${count}`)
  console.log(`Lot ID: ${lotId}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const codes: string[] = []
  const startTime = Date.now()

  try {
    for (let i = 0; i < count; i++) {
      const code = await generateUniqueCode()
      
      await db.qRCode.create({
        data: {
          code,
          lotId,
          status: 'stock',
        },
      })
      
      codes.push(code)
      process.stdout.write(`\r✅ Généré: ${i + 1}/${count} - ${code}`)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✨ Génération terminée!`)
    console.log(`⏱️  Durée: ${duration}s`)
    console.log(`📦 Lot ID: ${lotId}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Afficher les codes générés
    console.log('Codes générés:')
    codes.forEach((code, index) => {
      console.log(`  ${(index + 1).toString().padStart(4, ' ')}. ${code}`)
    })

    // Statistiques
    const totalInLot = await db.qRCode.count({
      where: { lotId },
    })
    
    const totalInStock = await db.qRCode.count({
      where: { status: 'stock' },
    })

    console.log(`\n📊 Statistiques:`)
    console.log(`   Codes dans ce lot: ${totalInLot}`)
    console.log(`   Total en stock: ${totalInStock}`)

  } catch (error) {
    console.error('\n❌ Erreur lors de la génération:', error)
    process.exit(1)
  }
}

// Exécuter le script
main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
