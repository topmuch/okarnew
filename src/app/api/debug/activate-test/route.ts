/**
 * OKAR - API Debug pour Test d'Activation
 * 
 * GET /api/debug/activate-test - Teste chaque étape de l'activation
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const logs: string[] = []
  const steps: { step: string; success: boolean; error?: string; data?: any }[] = []
  
  try {
    // Étape 1: Vérifier la connexion DB
    logs.push('Étape 1: Test connexion DB...')
    try {
      const userCount = await db.user.count()
      steps.push({ step: 'DB Connection', success: true, data: { userCount } })
      logs.push(`✅ DB connectée - ${userCount} utilisateurs`)
    } catch (e) {
      steps.push({ step: 'DB Connection', success: false, error: String(e) })
      logs.push(`❌ Erreur DB: ${e}`)
      return NextResponse.json({ logs, steps, error: 'DB connection failed' }, { status: 500 })
    }
    
    // Étape 2: Chercher un QR code en stock
    logs.push('Étape 2: Recherche QR code en stock...')
    try {
      const qrCode = await db.qRCode.findFirst({
        where: { status: 'stock' }
      })
      if (qrCode) {
        steps.push({ step: 'Find QR Code', success: true, data: { code: qrCode.code, id: qrCode.id } })
        logs.push(`✅ QR Code trouvé: ${qrCode.code}`)
      } else {
        steps.push({ step: 'Find QR Code', success: false, error: 'No QR code in stock' })
        logs.push('❌ Aucun QR code en stock')
      }
    } catch (e) {
      steps.push({ step: 'Find QR Code', success: false, error: String(e) })
      logs.push(`❌ Erreur recherche QR: ${e}`)
    }
    
    // Étape 3: Lister les tables disponibles
    logs.push('Étape 3: Vérification structure DB...')
    try {
      const tables = await db.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`
      steps.push({ step: 'Check Tables', success: true, data: tables })
      logs.push(`✅ Tables: ${(tables as any[]).map(t => t.name).join(', ')}`)
    } catch (e) {
      steps.push({ step: 'Check Tables', success: false, error: String(e) })
      logs.push(`❌ Erreur tables: ${e}`)
    }
    
    // Étape 4: Vérifier le schéma Vehicle
    logs.push('Étape 4: Vérification schéma Vehicle...')
    try {
      const vehicleInfo = await db.$queryRaw`PRAGMA table_info(vehicle)`
      steps.push({ step: 'Vehicle Schema', success: true, data: vehicleInfo })
      logs.push(`✅ Vehicle columns: ${(vehicleInfo as any[]).map(c => c.name).join(', ')}`)
    } catch (e) {
      steps.push({ step: 'Vehicle Schema', success: false, error: String(e) })
      logs.push(`❌ Erreur schéma vehicle: ${e}`)
    }
    
    // Étape 5: Tester la création d'un utilisateur (sans commit)
    logs.push('Étape 5: Test création utilisateur...')
    try {
      const testEmail = `test-${Date.now()}@debug.okar`
      // Juste vérifier qu'on peut accéder au model
      const existingUsers = await db.user.findMany({ where: { email: testEmail } })
      steps.push({ step: 'User Model Access', success: true, data: { testEmail, existingCount: existingUsers.length } })
      logs.push(`✅ Model User accessible`)
    } catch (e) {
      steps.push({ step: 'User Model Access', success: false, error: String(e) })
      logs.push(`❌ Erreur model User: ${e}`)
    }
    
    // Étape 6: Vérifier le model QRCode
    logs.push('Étape 6: Vérification QRCode model...')
    try {
      const qrInfo = await db.$queryRaw`PRAGMA table_info(qrcode)`
      steps.push({ step: 'QRCode Schema', success: true, data: qrInfo })
      logs.push(`✅ QRCode columns: ${(qrInfo as any[]).map(c => c.name).join(', ')}`)
    } catch (e) {
      steps.push({ step: 'QRCode Schema', success: false, error: String(e) })
      logs.push(`❌ Erreur schéma QRCode: ${e}`)
    }
    
    // Étape 7: Tester une transaction simple
    logs.push('Étape 7: Test transaction...')
    try {
      const result = await db.$transaction(async (tx) => {
        const count = await tx.qRCode.count()
        return { count }
      })
      steps.push({ step: 'Transaction Test', success: true, data: result })
      logs.push(`✅ Transaction fonctionne: ${result.count} QR codes`)
    } catch (e) {
      steps.push({ step: 'Transaction Test', success: false, error: String(e) })
      logs.push(`❌ Erreur transaction: ${e}`)
    }
    
    // Résumé
    const allSuccess = steps.every(s => s.success)
    
    return NextResponse.json({
      success: allSuccess,
      logs,
      steps,
      summary: allSuccess 
        ? '✅ Tous les tests passent - Le problème vient des données envoyées'
        : '❌ Certains tests échouent - Voir les étapes ci-dessus'
    })
    
  } catch (error) {
    logs.push(`❌ Erreur générale: ${error}`)
    return NextResponse.json({
      success: false,
      logs,
      steps,
      error: String(error)
    }, { status: 500 })
  }
}
