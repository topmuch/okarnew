/**
 * OKAR - API Migration: Add subscription fields to User
 * Ajoute les champs d'abonnement manquants au modèle User
 * 
 * GET - Exécute la migration (accessible via navigateur)
 * POST - Exécute la migration
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function runMigration() {
  const results: string[] = []

  // Vérifier si les colonnes existent déjà
  try {
    await db.$executeRaw`SELECT subscriptionPlan FROM User LIMIT 1`
    results.push('subscriptionPlan column already exists')
  } catch (e) {
    // Ajouter la colonne subscriptionPlan
    await db.$executeRaw`ALTER TABLE User ADD COLUMN subscriptionPlan TEXT DEFAULT 'free'`
    results.push('Added subscriptionPlan column')
  }

  try {
    await db.$executeRaw`SELECT subscriptionStartDate FROM User LIMIT 1`
    results.push('subscriptionStartDate column already exists')
  } catch (e) {
    // Ajouter la colonne subscriptionStartDate
    await db.$executeRaw`ALTER TABLE User ADD COLUMN subscriptionStartDate DATETIME`
    results.push('Added subscriptionStartDate column')
  }

  try {
    await db.$executeRaw`SELECT subscriptionEndDate FROM User LIMIT 1`
    results.push('subscriptionEndDate column already exists')
  } catch (e) {
    // Ajouter la colonne subscriptionEndDate
    await db.$executeRaw`ALTER TABLE User ADD COLUMN subscriptionEndDate DATETIME`
    results.push('Added subscriptionEndDate column')
  }

  // Mettre à jour les utilisateurs existants avec des valeurs par défaut
  await db.$executeRaw`UPDATE User SET subscriptionPlan = 'free' WHERE subscriptionPlan IS NULL`
  results.push('Updated existing users with default subscriptionPlan')

  return results
}

// GET - Exécute la migration (accessible via navigateur)
export async function GET(request: NextRequest) {
  try {
    const results = await runMigration()
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Exécute la migration
export async function POST(request: NextRequest) {
  try {
    const results = await runMigration()

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
