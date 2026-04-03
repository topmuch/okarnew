/**
 * CleanCheck - SuperAdmin & Platform Seed Script
 * Creates superadmin user, platform configs, feature flags, and sample audit logs
 *
 * Exécution: npx tsx prisma/seed-superadmin.ts
 */

import db from '../src/lib/db'
import bcrypt from 'bcryptjs'

const BCRYPT_SALT_ROUNDS = 12

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS)
}

// ============================================================================
// SEED SUPERADMIN USER
// ============================================================================

async function seedSuperAdmin() {
  console.log('🔐 Creating Super Admin user...')

  const existingAdmin = await db.user.findFirst({
    where: { role: 'superadmin' },
  })

  if (existingAdmin) {
    console.log('   ⏭️  Super Admin already exists:', existingAdmin.email)
    return existingAdmin
  }

  const superAdmin = await db.user.create({
    data: {
      email: 'superadmin@cleancheck.fr',
      passwordHash: hashPassword('SuperAdmin2025!'),
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+33100000000',
      role: 'superadmin',
      isActive: true,
    },
  })

  console.log('   ✅ Super Admin created successfully!')
  console.log('   📧 Email: superadmin@cleancheck.fr')
  console.log('   🔑 Password: SuperAdmin2025!')
  return superAdmin
}

// ============================================================================
// SEED PLATFORM CONFIGS
// ============================================================================

async function seedPlatformConfigs() {
  console.log('\n⚙️  Creating Platform Configs...')

  const configs = [
    {
      key: 'scoring_weights',
      value: JSON.stringify({
        punctuality: 0.2,
        completion: 0.2,
        clientRating: 0.3,
        regularity: 0.15,
        reactivity: 0.15,
      }),
      label: 'Quality Score Weights',
      category: 'scoring',
    },
    {
      key: 'qr_validity_hours',
      value: '24',
      label: 'QR Code Validity (hours)',
      category: 'qr',
    },
    {
      key: 'geo_tolerance_meters',
      value: '200',
      label: 'Geolocation Tolerance (meters)',
      category: 'qr',
    },
    {
      key: 'photo_storage_limit_mb',
      value: '500',
      label: 'Photo Storage Limit per Company (MB)',
      category: 'storage',
    },
    {
      key: 'email_templates',
      value: JSON.stringify({
        welcome: {
          subject: 'Bienvenue sur CleanCheck !',
          body: 'Bonjour {{firstName}}, votre compte CleanCheck a été créé avec succès. Connectez-vous pour commencer à gérer vos interventions.',
        },
        intervention_created: {
          subject: 'Nouvelle intervention planifiée - {{clientName}}',
          body: 'Bonjour {{agentName}}, une nouvelle intervention est planifiée chez {{clientName}} le {{date}} à {{time}}.',
        },
        rating_request: {
          subject: 'Comment s\'est passée votre intervention ?',
          body: 'Bonjour {{clientName}}, merci de noter la qualité de notre intervention chez vous du {{date}}.',
        },
      }),
      label: 'Email Templates',
      category: 'email',
    },
    {
      key: 'sms_templates',
      value: JSON.stringify({
        verification: {
          template: 'Votre code de vérification CleanCheck est : {{code}}. Valide 15 min.',
        },
        reminder: {
          template: 'Rappel : Intervention prévue le {{date}} à {{time}} chez {{clientName}}.',
        },
      }),
      label: 'SMS Templates',
      category: 'sms',
    },
    {
      key: 'data_retention_months',
      value: '13',
      label: 'Data Retention Period (months)',
      category: 'general',
    },
    {
      key: 'invoice_retention_months',
      value: '24',
      label: 'Invoice Retention Period (months)',
      category: 'general',
    },
  ]

  let createdCount = 0
  let skippedCount = 0

  for (const config of configs) {
    const existing = await db.platformConfig.findUnique({
      where: { key: config.key },
    })

    if (existing) {
      await db.platformConfig.update({
        where: { key: config.key },
        data: {
          value: config.value,
          label: config.label,
          category: config.category,
        },
      })
      console.log(`   ⏭️  Config updated: ${config.key}`)
      skippedCount++
      continue
    }

    await db.platformConfig.create({
      data: {
        key: config.key,
        value: config.value,
        label: config.label,
        category: config.category,
      },
    })
    console.log(`   ✅ Config created: ${config.key}`)
    createdCount++
  }

  console.log(`   📊 Platform Configs: ${createdCount} created, ${skippedCount} updated/skipped`)
}

// ============================================================================
// SEED FEATURE FLAGS
// ============================================================================

async function seedFeatureFlags() {
  console.log('\n🚩 Creating Feature Flags...')

  const flags = [
    {
      name: 'qr_scanning',
      description: 'Enable QR code scanning for intervention validation',
      isEnabled: true,
      targetType: 'global',
      targetValue: null,
    },
    {
      name: 'client_rating',
      description: 'Enable client rating system for completed interventions',
      isEnabled: true,
      targetType: 'global',
      targetValue: null,
    },
    {
      name: 'quality_scoring',
      description: 'Enable agent quality scoring and performance tracking',
      isEnabled: true,
      targetType: 'global',
      targetValue: null,
    },
    {
      name: 'email_notifications',
      description: 'Enable email notification system',
      isEnabled: true,
      targetType: 'global',
      targetValue: null,
    },
    {
      name: 'sms_notifications',
      description: 'Enable SMS notification system',
      isEnabled: false,
      targetType: 'global',
      targetValue: null,
    },
    {
      name: 'advanced_analytics',
      description: 'Enable advanced analytics dashboard with charts and reports',
      isEnabled: true,
      targetType: 'plan',
      targetValue: 'pro,enterprise',
    },
    {
      name: 'api_access',
      description: 'Enable API access for external integrations',
      isEnabled: false,
      targetType: 'plan',
      targetValue: 'enterprise',
    },
    {
      name: 'impersonate_mode',
      description: 'Enable user impersonation for superadmin support',
      isEnabled: true,
      targetType: 'role',
      targetValue: 'superadmin',
    },
  ]

  let createdCount = 0
  let skippedCount = 0

  for (const flag of flags) {
    const existing = await db.featureFlag.findUnique({
      where: { name: flag.name },
    })

    if (existing) {
      await db.featureFlag.update({
        where: { name: flag.name },
        data: {
          description: flag.description,
          isEnabled: flag.isEnabled,
          targetType: flag.targetType,
          targetValue: flag.targetValue,
        },
      })
      console.log(`   ⏭️  Flag updated: ${flag.name} (${flag.isEnabled ? 'ON' : 'OFF'})`)
      skippedCount++
      continue
    }

    await db.featureFlag.create({
      data: {
        name: flag.name,
        description: flag.description,
        isEnabled: flag.isEnabled,
        targetType: flag.targetType,
        targetValue: flag.targetValue,
      },
    })
    console.log(`   ✅ Flag created: ${flag.name} (${flag.isEnabled ? 'ON' : 'OFF'})`)
    createdCount++
  }

  console.log(`   📊 Feature Flags: ${createdCount} created, ${skippedCount} updated/skipped`)
}

// ============================================================================
// SEED AUDIT LOGS
// ============================================================================

async function seedAuditLogs(superAdminId: string) {
  console.log('\n📝 Creating Sample Audit Logs...')

  const auditLogs = [
    {
      action: 'login',
      targetType: 'user',
      targetId: superAdminId,
      before: null,
      after: JSON.stringify({ email: 'superadmin@cleancheck.fr', role: 'superadmin' }),
      ipAddress: '127.0.0.1',
      userAgent: 'CleanCheck Seed Script',
      metadata: JSON.stringify({ source: 'seed_script' }),
    },
    {
      action: 'create',
      targetType: 'config',
      targetId: null,
      before: null,
      after: JSON.stringify({ action: 'bulk_create_platform_configs', count: 8 }),
      ipAddress: '127.0.0.1',
      userAgent: 'CleanCheck Seed Script',
      metadata: JSON.stringify({ source: 'seed_script' }),
    },
    {
      action: 'create',
      targetType: 'feature_flag',
      targetId: null,
      before: null,
      after: JSON.stringify({ action: 'bulk_create_feature_flags', count: 8 }),
      ipAddress: '127.0.0.1',
      userAgent: 'CleanCheck Seed Script',
      metadata: JSON.stringify({ source: 'seed_script' }),
    },
    {
      action: 'config_change',
      targetType: 'config',
      targetId: 'scoring_weights',
      before: null,
      after: JSON.stringify({ punctuality: 0.2, completion: 0.2, clientRating: 0.3, regularity: 0.15, reactivity: 0.15 }),
      ipAddress: '127.0.0.1',
      userAgent: 'CleanCheck Seed Script',
      metadata: JSON.stringify({ source: 'seed_script' }),
    },
    {
      action: 'flag_toggle',
      targetType: 'feature_flag',
      targetId: 'sms_notifications',
      before: JSON.stringify({ isEnabled: true }),
      after: JSON.stringify({ isEnabled: false }),
      ipAddress: '127.0.0.1',
      userAgent: 'CleanCheck Seed Script',
      metadata: JSON.stringify({ reason: 'SMS disabled by default to avoid unexpected costs' }),
    },
  ]

  let createdCount = 0

  for (const log of auditLogs) {
    await db.auditLog.create({
      data: {
        superAdminId,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        before: log.before,
        after: log.after,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata,
      },
    })
    createdCount++
    console.log(`   ✅ Audit log: ${log.action} (${log.targetType})`)
  }

  console.log(`   📊 Audit Logs: ${createdCount} created`)
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       CleanCheck - SuperAdmin & Platform Seed')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')

  try {
    // 1. Super Admin
    const superAdmin = await seedSuperAdmin()

    // 2. Platform Configs
    await seedPlatformConfigs()

    // 3. Feature Flags
    await seedFeatureFlags()

    // 4. Audit Logs
    await seedAuditLogs(superAdmin.id)

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('                    ✅ SEED COMPLETE')
    console.log('═══════════════════════════════════════════════════════════')

    const stats = await Promise.all([
      db.user.count({ where: { role: 'superadmin' } }),
      db.platformConfig.count(),
      db.featureFlag.count(),
      db.auditLog.count(),
    ])

    console.log(`
📊 SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Super Admins       : ${stats[0]}
⚙️  Platform Configs   : ${stats[1]}
🚩 Feature Flags      : ${stats[2]}
📝 Audit Logs         : ${stats[3]}

🔑 SUPER ADMIN CREDENTIALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email    : superadmin@cleancheck.fr
   Password : SuperAdmin2025!
`)
    console.log('═══════════════════════════════════════════════════════════')

  } catch (error) {
    console.error('❌ Error during seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
