/**
 * OKAR - API de Migration Base de Données
 *
 * GET /api/public/migrate-db - Ajoute les colonnes et tables manquantes
 *
 * Cette API ajoute les éléments manquants détectés dans le schéma Prisma
 * mais absents de la base de données SQLite de production.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const results: { item: string; type: string; status: string; error?: string }[] = []

  // ═════════════════════════════════════════════════════════
  // 1. COLONNES VEHICULE
  // ═════════════════════════════════════════════════════════
  const vehicleColumns = [
    { name: 'insuranceStartDate', type: 'DATETIME' },
    { name: 'insuranceEndDate', type: 'DATETIME' },
    { name: 'insuranceStatus', type: 'TEXT DEFAULT "valid"' },
    { name: 'technicalCheckStartDate', type: 'DATETIME' },
    { name: 'technicalCheckEndDate', type: 'DATETIME' },
    { name: 'technicalCheckStatus', type: 'TEXT DEFAULT "valid"' },
    { name: 'photoUrl', type: 'TEXT' },
  ]

  for (const col of vehicleColumns) {
    try {
      const tableInfo: any = await db.$queryRaw`PRAGMA table_info(vehicle)`
      const exists = tableInfo.some((row: any) => row.name === col.name)

      if (exists) {
        results.push({ item: col.name, type: 'column', status: 'already_exists' })
        continue
      }

      await db.$executeRawUnsafe(
        `ALTER TABLE vehicle ADD COLUMN ${col.name} ${col.type}`
      )
      results.push({ item: col.name, type: 'column', status: 'added' })
    } catch (error: any) {
      results.push({ item: col.name, type: 'column', status: 'error', error: error.message })
    }
  }

  // ═════════════════════════════════════════════════════════
  // 2. TABLE SUPPORTTICKET
  // ═════════════════════════════════════════════════════════
  try {
    const tables: any = await db.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='SupportTicket'
    `
    
    if (tables.length === 0) {
      await db.$executeRawUnsafe(`
        CREATE TABLE "SupportTicket" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "garageId" TEXT NOT NULL,
          "userId" TEXT,
          "subject" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "status" TEXT DEFAULT 'open',
          "priority" TEXT DEFAULT 'normal',
          "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
          "resolvedAt" DATETIME,
          FOREIGN KEY ("garageId") REFERENCES "Garage"("id")
        )
      `)
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_garageId_idx" ON "SupportTicket"("garageId")`)
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status")`)
      results.push({ item: 'SupportTicket', type: 'table', status: 'created' })
    } else {
      results.push({ item: 'SupportTicket', type: 'table', status: 'already_exists' })
    }
  } catch (error: any) {
    results.push({ item: 'SupportTicket', type: 'table', status: 'error', error: error.message })
  }

  // ═════════════════════════════════════════════════════════
  // 3. TABLE SUPPORTTICKETREPLY
  // ═════════════════════════════════════════════════════════
  try {
    const tables: any = await db.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='SupportTicketReply'
    `
    
    if (tables.length === 0) {
      await db.$executeRawUnsafe(`
        CREATE TABLE "SupportTicketReply" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "ticketId" TEXT NOT NULL,
          "userId" TEXT,
          "userRole" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE
        )
      `)
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicketReply_ticketId_idx" ON "SupportTicketReply"("ticketId")`)
      results.push({ item: 'SupportTicketReply', type: 'table', status: 'created' })
    } else {
      results.push({ item: 'SupportTicketReply', type: 'table', status: 'already_exists' })
    }
  } catch (error: any) {
    results.push({ item: 'SupportTicketReply', type: 'table', status: 'error', error: error.message })
  }

  // ═════════════════════════════════════════════════════════
  // 4. TABLE ADVERTISEMENT
  // ═════════════════════════════════════════════════════════
  try {
    const tables: any = await db.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='Advertisement'
    `
    
    if (tables.length === 0) {
      await db.$executeRawUnsafe(`
        CREATE TABLE "Advertisement" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "imageUrl" TEXT NOT NULL,
          "linkUrl" TEXT,
          "position" TEXT NOT NULL,
          "isActive" BOOLEAN DEFAULT 1,
          "priority" INTEGER DEFAULT 0,
          "startDate" DATETIME,
          "endDate" DATETIME,
          "clickCount" INTEGER DEFAULT 0,
          "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Advertisement_position_idx" ON "Advertisement"("position")`)
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Advertisement_isActive_idx" ON "Advertisement"("isActive")`)
      results.push({ item: 'Advertisement', type: 'table', status: 'created' })
    } else {
      results.push({ item: 'Advertisement', type: 'table', status: 'already_exists' })
    }
  } catch (error: any) {
    results.push({ item: 'Advertisement', type: 'table', status: 'error', error: error.message })
  }

  // ═════════════════════════════════════════════════════════
  // 5. TABLE PENDINGACTIVATION (si pas encore créée)
  // ═════════════════════════════════════════════════════════
  try {
    const tables: any = await db.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='PendingActivation'
    `
    
    if (tables.length === 0) {
      await db.$executeRawUnsafe(`
        CREATE TABLE "PendingActivation" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "qrCodeId" TEXT NOT NULL,
          "ownerName" TEXT NOT NULL,
          "ownerEmail" TEXT NOT NULL,
          "ownerPhone" TEXT,
          "plateNumber" TEXT NOT NULL,
          "brand" TEXT NOT NULL,
          "model" TEXT NOT NULL,
          "year" INTEGER,
          "color" TEXT,
          "mileage" INTEGER DEFAULT 0,
          "vin" TEXT,
          "photoUrl" TEXT,
          "insuranceStartDate" DATETIME,
          "insuranceEndDate" DATETIME,
          "technicalCheckStartDate" DATETIME,
          "technicalCheckEndDate" DATETIME,
          "status" TEXT DEFAULT 'pending',
          "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id")
        )
      `)
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PendingActivation_status_idx" ON "PendingActivation"("status")`)
      results.push({ item: 'PendingActivation', type: 'table', status: 'created' })
    } else {
      results.push({ item: 'PendingActivation', type: 'table', status: 'already_exists' })
    }
  } catch (error: any) {
    results.push({ item: 'PendingActivation', type: 'table', status: 'error', error: error.message })
  }

  // ═════════════════════════════════════════════════════════
  // RÉSUMÉ
  // ═════════════════════════════════════════════════════════
  const allTables: any = await db.$queryRaw`
    SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
  `
  
  const summary = {
    columns: results.filter(r => r.type === 'column'),
    tables: results.filter(r => r.type === 'table'),
  }
  
  const hasErrors = results.some(r => r.status === 'error')

  return NextResponse.json({
    success: !hasErrors,
    message: hasErrors 
      ? 'Migration terminée avec quelques erreurs' 
      : 'Migration terminée avec succès',
    results,
    summary,
    existingTables: allTables.map((t: any) => t.name),
  })
}
