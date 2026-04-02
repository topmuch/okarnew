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

  // Ajouter la colonne subscriptionPlan (ignorer si existe)
  try {
    await db.$executeRaw`ALTER TABLE User ADD COLUMN subscriptionPlan TEXT DEFAULT 'free'`
    results.push('Added subscriptionPlan column')
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) {
      results.push('subscriptionPlan column already exists')
    } else {
      results.push(`subscriptionPlan: ${e.message}`)
    }
  }

  // Ajouter la colonne subscriptionStartDate (ignorer si existe)
  try {
    await db.$executeRaw`ALTER TABLE User ADD COLUMN subscriptionStartDate DATETIME`
    results.push('Added subscriptionStartDate column')
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) {
      results.push('subscriptionStartDate column already exists')
    } else {
      results.push(`subscriptionStartDate: ${e.message}`)
    }
  }

  // Ajouter la colonne subscriptionEndDate (ignorer si existe)
  try {
    await db.$executeRaw`ALTER TABLE User ADD COLUMN subscriptionEndDate DATETIME`
    results.push('Added subscriptionEndDate column')
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) {
      results.push('subscriptionEndDate column already exists')
    } else {
      results.push(`subscriptionEndDate: ${e.message}`)
    }
  }

  // Mettre à jour les utilisateurs existants avec des valeurs par défaut
  try {
    await db.$executeRaw`UPDATE User SET subscriptionPlan = 'free' WHERE subscriptionPlan IS NULL`
    results.push('Updated existing users with default subscriptionPlan')
  } catch (e: any) {
    results.push(`Update users: ${e.message}`)
  }

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
