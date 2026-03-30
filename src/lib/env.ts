/**
 * OKAR - Validation des Variables d'Environnement
 * 
 * Ce module valide toutes les variables d'environnement critiques
 * au démarrage de l'application.
 * 
 * Utilisation: Importer ce fichier dans instrumentation.ts ou layout.tsx
 */

// Variables requises
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
] as const

// Variables optionnelles avec valeurs par défaut
const OPTIONAL_ENV_VARS = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
} as const

// Variables sensibles (jamais exposées côté client)
const SERVER_ONLY_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'ORANGE_MONEY_API_KEY',
  'WAVE_API_KEY',
] as const

// Variables publiques (préfix NEXT_PUBLIC_)
const PUBLIC_VARS = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
] as const

interface EnvValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
  config: Record<string, string | undefined>
}

/**
 * Valide les variables d'environnement
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []
  const config: Record<string, string | undefined> = {}

  // Vérifier les variables requises
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName]
    if (!value) {
      missing.push(varName)
    } else {
      config[varName] = value
    }
  }

  // Vérifier les variables optionnelles
  for (const [varName, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[varName] || defaultValue
    config[varName] = value
  }

  // Avertissements de sécurité
  if (process.env.NODE_ENV === 'production') {
    // Vérifier que AUTH_SECRET est défini en prod
    if (!process.env.AUTH_SECRET) {
      warnings.push('AUTH_SECRET non défini - les sessions ne seront pas signées')
    }
    
    // Vérifier HTTPS
    if (process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://')) {
      warnings.push('NEXT_PUBLIC_APP_URL utilise HTTP en production')
    }
  }

  // Vérifier les fuites de variables sensibles
  if (typeof window !== 'undefined') {
    for (const varName of SERVER_ONLY_VARS) {
      if ((window as unknown as Record<string, unknown>)[varName]) {
        warnings.push(`Variable sensible ${varName} exposée côté client!`)
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    config,
  }
}

/**
 * Log le statut des variables d'environnement
 */
export function logEnvStatus(): void {
  const result = validateEnv()
  
  if (!result.valid) {
    console.error('❌ Variables d\'environnement manquantes:', result.missing.join(', '))
    console.error('Veuillez créer un fichier .env avec ces variables.')
  } else {
    console.log('✅ Variables d\'environnement validées')
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Avertissements:')
    result.warnings.forEach(w => console.warn(`   - ${w}`))
  }
}

// Export de la config validée (côté serveur uniquement)
export const env = {
  get DATABASE_URL() {
    return process.env.DATABASE_URL!
  },
  get APP_URL() {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  get NODE_ENV() {
    return process.env.NODE_ENV || 'development'
  },
  get AUTH_SECRET() {
    return process.env.AUTH_SECRET
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production'
  },
  get isDevelopment() {
    return process.env.NODE_ENV === 'development'
  },
}
