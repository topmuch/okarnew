/**
 * OKAR - API Insurance Providers
 * Récupère la liste des assureurs actifs
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/insurance/providers - Liste des assureurs actifs
export async function GET(request: NextRequest) {
  try {
    // Essayer de récupérer depuis la base de données
    try {
      const providers = await db.insuranceProvider.findMany({
        where: { isActive: true },
        orderBy: [
          { priority: 'desc' },
          { name: 'asc' },
        ],
      })

      if (providers.length > 0) {
        return NextResponse.json({
          success: true,
          providers: providers.map(p => ({
            ...p,
            coverages: JSON.parse(p.coverages || '[]'),
            advantages: JSON.parse(p.advantages || '[]'),
            basePriceTiers: p.basePriceTiers ? JSON.parse(p.basePriceTiers) : null,
          })),
        })
      }
    } catch (dbError) {
      console.log('Database not available, using reference data')
    }

    // Fallback: données de référence
    const { INSURANCE_PROVIDERS_REFERENCE } = await import('@/lib/insuranceCalculator')
    
    return NextResponse.json({
      success: true,
      providers: INSURANCE_PROVIDERS_REFERENCE.map(p => ({
        id: p.slug,
        ...p,
        coverages: ['tiers', 'tiers_etendu', 'tous_risques'],
        isActive: true,
        clickCount: 0,
      })),
    })
  } catch (error) {
    console.error('Error fetching insurance providers:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des assureurs' },
      { status: 500 }
    )
  }
}
