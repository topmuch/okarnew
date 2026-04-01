/**
 * OKAR - API de Migration Base de Données
 *
 * GET /api/public/migrate-db - Ajoute les colonnes manquantes
 *
 * Cette API ajoute les colonnes manquantes détectées dans le schéma Prisma
 * mais absentes de la base de données SQLite de production.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const results: { column: string; status: string; error?: string }[] = []

  // Colonnes à ajouter à la table Vehicle
  const columnsToAdd = [
    { name: 'insuranceStartDate', type: 'DATETIME' },
    { name: 'insuranceEndDate', type: 'DATETIME' },
    { name: 'insuranceStatus', type: 'TEXT DEFAULT "valid"' },
    { name: 'technicalCheckStartDate', type: 'DATETIME' },
    { name: 'technicalCheckEndDate', type: 'DATETIME' },
    { name: 'technicalCheckStatus', type: 'TEXT DEFAULT "valid"' },
  ]

  for (const col of columnsToAdd) {
    try {
      // Vérifier si la colonne existe déjà
      const tableInfo: any = await db.$queryRaw`
        PRAGMA table_info(vehicle)
      `
      const exists = tableInfo.some((row: any) => row.name === col.name)

      if (exists) {
        results.push({ column: col.name, status: 'already_exists' })
        continue
      }

      // Ajouter la colonne
      await db.$executeRawUnsafe(
        `ALTER TABLE vehicle ADD COLUMN ${col.name} ${col.type}`
      )
      results.push({ column: col.name, status: 'added' })
    } catch (error: any) {
      results.push({
        column: col.name,
        status: 'error',
        error: error.message
      })
    }
  }

  // Vérifier le schéma final
  const finalSchema: any = await db.$queryRaw`PRAGMA table_info(vehicle)`
  const vehicleColumns = finalSchema.map((row: any) => row.name)

  return NextResponse.json({
    success: true,
    message: 'Migration terminée',
    results,
    vehicleColumns,
    columnsCount: vehicleColumns.length
  })
}
