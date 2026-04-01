/**
 * OKAR - Configuration Base de Données
 * 
 * Singleton Prisma avec gestion intelligente du logging:
 * - En développement: log queries, errors, warnings
 * - En production: log errors uniquement
 * 
 * Utilise globalThis pour éviter les connexions multiples
 * pendant le hot-reload en développement.
 */

import { PrismaClient } from '@prisma/client'

// Type pour le global
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration du logging selon l'environnement
const logConfig = process.env.NODE_ENV === 'development'
  ? ['query', 'error', 'warn'] as const  // Dev: tout logger
  : ['error'] as const                    // Prod: erreurs uniquement

// Création du client Prisma
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: logConfig.map(level => ({
    emit: 'event',
    level,
  })),
  // Configuration de connexion
  // (pour SQLite, pas de pool, mais pour PostgreSQL/MySQL en prod)
})

// En développement, attacher les listeners de log
if (process.env.NODE_ENV === 'development' && globalForPrisma.prisma === undefined) {
  // Log des queries en dev
  db.$on('query' as never, (e: { query: string; duration: number }) => {
    console.log('🔍 Query:', e.query)
    console.log('⏱️ Duration:', e.duration + 'ms')
  })
  
  // Log des erreurs
  db.$on('error' as never, (e: { message: string }) => {
    console.error('❌ Prisma Error:', e.message)
  })
}

// Enregistrer dans global pour éviter les multiples connexions
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Export par défaut
export default db

// Types exportés
export type { PrismaClient }
