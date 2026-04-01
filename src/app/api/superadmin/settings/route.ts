/**
 * OKAR - API Gestion des Paramètres Superadmin
 * 
 * GET  /api/superadmin/settings - Récupérer tous les paramètres
 * POST /api/superadmin/settings - Mettre à jour les paramètres
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { db } from '@/lib/db'

// Clés de paramètres par défaut
const DEFAULT_SETTINGS = {
  site_name: 'OKAR',
  site_address: 'Dakar, Sénégal',
  site_logo_url: '',
  email_host: '',
  email_port: '587',
  email_user: '',
  email_password: '',
}

// GET - Récupérer tous les paramètres
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Récupérer tous les paramètres
    const settings = await db.settings.findMany()
    
    // Convertir en objet key-value
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value
    })

    return NextResponse.json({ settings: settingsMap })
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Mettre à jour les paramètres
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      )
    }

    // Mettre à jour chaque paramètre
    const updatePromises = Object.entries(settings).map(([key, value]) =>
      db.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )

    await Promise.all(updatePromises)

    // Log d'audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'SETTINGS_UPDATED',
        entityType: 'settings',
        entityId: 'global',
        details: JSON.stringify({ keys: Object.keys(settings) }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
