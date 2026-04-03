/**
 * CleanCheck - Script de Seed Data
 * Crée le SuperAdmin, une entreprise démo, agents, clients et interventions
 *
 * Exécution: npx tsx prisma/seed-cleancheck.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const BCRYPT_SALT_ROUNDS = 12

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS)
}

// ============================================================================
// SEED SUPERADMIN
// ============================================================================

async function seedSuperAdmin() {
  console.log('🔐 Création du Super Admin CleanCheck...')

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'superadmin' },
  })

  if (existingAdmin) {
    console.log('   ⏭️  Super Admin existe déjà')
    return existingAdmin
  }

  // Créer une entreprise pour le superadmin
  const company = await prisma.company.create({
    data: {
      name: 'CleanCheck Platform',
      slug: 'cleancheck-platform',
      subscriptionTier: 'enterprise',
      maxAgents: 999,
      maxInterventionsPerMonth: 99999,
    },
  })

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@cleancheck.fr',
      passwordHash: hashPassword('SuperAdmin2025!'),
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+33100000000',
      role: 'superadmin',
      companyId: company.id,
      isActive: true,
    },
  })

  console.log('   ✅ Super Admin créé avec succès !')
  console.log('   📧 Email: superadmin@cleancheck.fr')
  console.log('   🔑 Mot de passe: SuperAdmin2025!')
  console.log('   🏢 Entreprise: CleanCheck Platform')
  return superAdmin
}

// ============================================================================
// SEED DEMO COMPANY (CleanPro Services)
// ============================================================================

async function seedDemoCompany() {
  console.log('\n🏢 Création de l\'entreprise démo...')

  let company = await prisma.company.findFirst({
    where: { slug: 'cleanpro-services' },
  })

  if (company) {
    console.log('   ⏭️  Entreprise CleanPro Services existe déjà')
    return company
  }

  company = await prisma.company.create({
    data: {
      name: 'CleanPro Services',
      slug: 'cleanpro-services',
      subscriptionTier: 'pro',
      maxAgents: 15,
      maxInterventionsPerMonth: 999,
    },
  })

  console.log('   ✅ Entreprise CleanPro Services créée')
  return company
}

// ============================================================================
// SEED DEMO MANAGER (Marie Dupont)
// ============================================================================

async function seedDemoManager(companyId: string) {
  console.log('\n👤 Création du Manager démo...')

  const existingManager = await prisma.user.findFirst({
    where: { email: 'marie.dupont@cleanpro.fr', companyId },
  })

  if (existingManager) {
    console.log('   ⏭️  Manager Marie Dupont existe déjà')
    return existingManager
  }

  const manager = await prisma.user.create({
    data: {
      email: 'marie.dupont@cleanpro.fr',
      passwordHash: hashPassword('Manager2025!'),
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '+33612345678',
      role: 'manager',
      companyId,
      isActive: true,
    },
  })

  console.log('   ✅ Manager créé: marie.dupont@cleanpro.fr / Manager2025!')
  return manager
}

// ============================================================================
// SEED DEMO AGENTS
// ============================================================================

async function seedDemoAgents(companyId: string) {
  console.log('\n👷 Création des Agents démo...')

  const agentsData = [
    { firstName: 'Sophie', lastName: 'Laurent', email: 'sophie.laurent@cleanpro.fr', phone: '+33611111111' },
    { firstName: 'Marc', lastName: 'Dubois', email: 'marc.dubois@cleanpro.fr', phone: '+33622222222' },
    { firstName: 'Julie', lastName: 'Robert', email: 'julie.robert@cleanpro.fr', phone: '+33633333333' },
    { firstName: 'Thomas', lastName: 'Martin', email: 'thomas.martin@cleanpro.fr', phone: '+33644444444' },
    { firstName: 'Emma', lastName: 'Petit', email: 'emma.petit@cleanpro.fr', phone: '+33655555555' },
  ]

  const agents = []

  for (const data of agentsData) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email },
    })

    if (existing) {
      console.log(`   ⏭️  ${data.firstName} ${data.lastName} existe déjà`)
      agents.push(existing)
      continue
    }

    const agent = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashPassword('Agent2025!'),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'agent',
        companyId,
        isActive: true,
      },
    })

    console.log(`   ✅ Agent créé: ${data.firstName} ${data.lastName} (${data.email})`)
    agents.push(agent)
  }

  return agents
}

// ============================================================================
// SEED DEMO CLIENTS
// ============================================================================

async function seedDemoClients(companyId: string) {
  console.log('\n🏢 Création des Clients démo...')

  const clientsData = [
    { name: 'Bureau Martin & Associés', email: 'contact@bureau-martin.fr', phone: '+33660000001', address: '15 Rue de la Paix', city: 'Paris', notes: 'Nettoyage quotidien, 200m² bureaux' },
    { name: 'Hôtel Riviera', email: 'reservation@hotel-riviera.fr', phone: '+33660000002', address: '42 Avenue des Champs-Élysées', city: 'Paris', notes: 'Nettoyage chambres + parties communes' },
    { name: 'Clinique Santé+', email: 'admin@clinique-santeplus.fr', phone: '+33660000003', address: '8 Boulevard Haussmann', city: 'Paris', notes: 'Nettoyage médicalisé, protocoles stricts' },
    { name: 'Restaurant Le Jardin', email: 'contact@lejardin-paris.fr', phone: '+33660000004', address: '23 Rue des Petits Champs', city: 'Paris', notes: 'Nettoyage cuisine et salle, quotidien' },
    { name: 'Immeuble Tour Eiffel', email: 'syndic@tour-eiffel.fr', phone: '+33660000005', address: '1 Avenue de la Bourdonnais', city: 'Paris', notes: 'Parties communes + halls, 2x/semaine' },
    { name: 'Espace Coworking Central', email: 'info@cowork-central.fr', phone: '+33660000006', address: '56 Rue de Rivoli', city: 'Paris', notes: 'Open space, cuisine, sanitaires' },
    { name: 'Gym Fitness Park', email: 'contact@fitnesspark.fr', phone: '+33660000007', address: '10 Rue du Faubourg Saint-Honoré', city: 'Paris', notes: 'Nettoyage équipements + vestiaires, quotidien' },
    { name: 'Boutique LuxMode', email: 'boutique@luxmode.fr', phone: '+33660000008', address: '78 Boulevard Saint-Germain', city: 'Paris', notes: 'Vitrines + intérieur, 3x/semaine' },
  ]

  const clients = []

  for (const data of clientsData) {
    const existing = await prisma.client.findFirst({
      where: { name: data.name, companyId },
    })

    if (existing) {
      console.log(`   ⏭️  ${data.name} existe déjà`)
      clients.push(existing)
      continue
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        notes: data.notes,
        companyId,
      },
    })

    console.log(`   ✅ Client créé: ${data.name}`)
    clients.push(client)
  }

  return clients
}

// ============================================================================
// SEED CHECKLIST TEMPLATES
// ============================================================================

async function seedChecklistTemplates(companyId: string) {
  console.log('\n📋 Création des Templates de Checklist...')

  const templatesData = [
    {
      name: 'Nettoyage Bureau Standard',
      description: 'Checklist standard pour bureaux et open spaces',
      items: [
        { taskName: 'Dépoussiérer tous les bureaux et surfaces de travail', description: 'Utiliser un chiffon microfibre humide' },
        { taskName: 'Passer l\'aspirateur sur les moquettes', description: 'Aspirateur avec filtre HEPA' },
        { taskName: 'Laver les sols (zones carrelage)', description: 'Seringue et produit désinfectant' },
        { taskName: 'Nettoyer les vitres intérieures', description: 'Vitrifier et chiffon propre' },
        { taskName: 'Vider et nettoyer les poubelles', description: 'Remplacer les sacs poubelle' },
        { taskName: 'Nettoyer les sanitaires', description: 'WC, lavabos, miroirs, distributeur savon' },
        { taskName: 'Nettoyer la cuisine / salle de pause', description: 'Évier, micro-ondes, frigo (extérieur), comptoir' },
        { taskName: 'Rangement des espaces communs', description: 'Chaises, magazines, canapés' },
      ],
      estimatedDuration: 45,
    },
    {
      name: 'Nettoyage Hôtel - Chambre',
      description: 'Checklist complète pour chambre d\'hôtel',
      items: [
        { taskName: 'Retirer le linge sale et défaire le lit', description: 'Draps, housses, taies d\'oreiller' },
        { taskName: 'Faire le lit avec linge propre', description: 'Protocole d\'hospitalité, plis serrés' },
        { taskName: 'Dépoussiérer toutes les surfaces', description: 'Chevets, bureau, TV, étagères' },
        { taskName: 'Nettoyer la salle de bain', description: 'Douche, WC, lavabo, miroir, serviettes propres' },
        { taskName: 'Passer l\'aspirateur dans la chambre', description: 'Sous le lit, coins, tapis' },
        { taskName: 'Laver le sol de la salle de bain', description: 'Seringue avec désinfectant' },
        { taskName: 'Vérifier et réapprovisionner les commodités', description: 'Savon, shampooing, eau, café' },
        { taskName: 'Vérifier le bon fonctionnement du matériel', description: 'TV, climatisation, éclairage' },
      ],
      estimatedDuration: 30,
    },
    {
      name: 'Nettoyage Médicalisé (Clinique)',
      description: 'Checklist avec protocoles de désinfection médical',
      items: [
        { taskName: 'Désinfection des surfaces de contact', description: 'Poignées, interrupteurs, tables, avec virucide' },
        { taskName: 'Nettoyage du sol avec désinfectant médical', description: 'Biocide conforme norme EN 16615' },
        { taskName: 'Traitement des poubelles DASRI', description: 'Sac jaune, filière agréée' },
        { taskName: 'Désinfection du matériel médical', description: 'Selon protocole du service' },
        { taskName: 'Nettoyage des sanitaires (protocole BMR)', description: 'Désinfectant à spectre large' },
        { taskName: 'Aération de la pièce (15 min minimum)', description: 'Portes et fenêtres ouvertes' },
        { taskName: 'Changement du linge (protocole hygiène)', description: 'Sac hygiène, filière blanchisserie' },
        { taskName: 'Remplir la fiche de traçabilité', description: 'Heure, agent, produits utilisés, signature' },
      ],
      estimatedDuration: 60,
    },
  ]

  const templates = []

  for (const data of templatesData) {
    const existing = await prisma.checklistTemplate.findFirst({
      where: { name: data.name, companyId },
    })

    if (existing) {
      console.log(`   ⏭️  Template "${data.name}" existe déjà`)
      templates.push(existing)
      continue
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        companyId,
        itemsJson: JSON.stringify(data.items),
        estimatedDurationMinutes: data.estimatedDuration,
        isActive: true,
      },
    })

    console.log(`   ✅ Template créé: ${data.name} (${data.items.length} tâches, ${data.estimatedDuration}min)`)
    templates.push(template)
  }

  return templates
}

// ============================================================================
// SEED DEMO INTERVENTIONS
// ============================================================================

async function seedDemoInterventions(
  companyId: string,
  clients: any[],
  agents: any[],
  templates: any[],
) {
  console.log('\n📋 Création des Interventions démo...')

  const interventionsData = [
    {
      clientIdx: 0, agentIdx: 0, templateIdx: 0,
      status: 'completed', scheduledHoursAgo: -48, durationHours: 2,
      score: 5, clientComment: 'Excellent travail ! Bureau impeccable.',
    },
    {
      clientIdx: 1, agentIdx: 1, templateIdx: 1,
      status: 'in_progress', scheduledHoursAgo: -1, durationHours: 4,
    },
    {
      clientIdx: 2, agentIdx: 2, templateIdx: 2,
      status: 'scheduled', scheduledHoursAgo: 23, durationHours: 2,
    },
    {
      clientIdx: 3, agentIdx: 0, templateIdx: 0,
      status: 'completed', scheduledHoursAgo: -24, durationHours: 1.5,
      score: 4, clientComment: 'Très bien, un petit oubli dans la cuisine.',
    },
    {
      clientIdx: 4, agentIdx: 1, templateIdx: 0,
      status: 'completed', scheduledHoursAgo: -72, durationHours: 3,
      score: 3, clientComment: 'Correct mais pourrait être plus soigné dans les halls.',
    },
    {
      clientIdx: 5, agentIdx: 3, templateIdx: 0,
      status: 'scheduled', scheduledHoursAgo: 47, durationHours: 2,
    },
    {
      clientIdx: 0, agentIdx: 2, templateIdx: 0,
      status: 'completed', scheduledHoursAgo: -96, durationHours: 2,
      score: 5, clientComment: 'Parfait comme toujours !',
    },
    {
      clientIdx: 6, agentIdx: 4, templateIdx: 0,
      status: 'completed', scheduledHoursAgo: -120, durationHours: 3,
      score: 4, clientComment: 'Bon travail, vestiaires très propres.',
    },
    {
      clientIdx: 7, agentIdx: 3, templateIdx: 0,
      status: 'completed', scheduledHoursAgo: -168, durationHours: 1.5,
      score: 5, clientComment: 'Vitrines impeccables, merci !',
    },
    {
      clientIdx: 1, agentIdx: 4, templateIdx: 1,
      status: 'completed', scheduledHoursAgo: -144, durationHours: 6,
      score: 4, clientComment: 'Chambres nickel, juste un délai un peu long.',
    },
  ]

  const interventions = []

  for (const data of interventionsData) {
    const client = clients[data.clientIdx]
    const agent = agents[data.agentIdx]
    const template = templates[data.templateIdx]

    const now = new Date()
    const scheduledStart = new Date(now.getTime() + data.scheduledHoursAgo * 3600000)
    const scheduledEnd = new Date(scheduledStart.getTime() + data.durationHours * 3600000)

    const qrPinCode = Math.floor(100000 + Math.random() * 900000).toString()
    const qrToken = `QR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8)}`

    let actualStart = null
    let actualEnd = null
    let qrScannedAt = null
    let qrCompletedAt = null
    let qrUsed = false

    if (data.status === 'completed') {
      actualStart = new Date(scheduledStart.getTime() + 5 * 60000)
      actualEnd = new Date(scheduledEnd.getTime() - 10 * 60000)
      qrScannedAt = new Date(scheduledStart.getTime() + 3 * 60000)
      qrCompletedAt = new Date(scheduledEnd.getTime() - 10 * 60000)
      qrUsed = true
    } else if (data.status === 'in_progress') {
      actualStart = new Date(scheduledStart.getTime() + 5 * 60000)
      qrScannedAt = new Date(scheduledStart.getTime() + 3 * 60000)
      qrUsed = true
    }

    const intervention = await prisma.intervention.create({
      data: {
        companyId,
        clientId: client.id,
        agentId: agent.id,
        checklistTemplateId: template.id,
        status: data.status,
        scheduledStart,
        scheduledEnd,
        actualStart,
        actualEnd,
        qrToken,
        qrPinCode,
        qrExpiresAt: new Date(scheduledEnd.getTime() + 24 * 3600000),
        qrScannedAt,
        qrCompletedAt,
        qrUsed,
      },
    })

    // Create checklist items for this intervention
    const templateItems = JSON.parse(template.itemsJson)
    for (let i = 0; i < templateItems.length; i++) {
      const completed = data.status === 'completed' ? true : data.status === 'in_progress' ? i < Math.floor(templateItems.length / 2) : false
      await prisma.checklistItem.create({
        data: {
          interventionId: intervention.id,
          taskName: templateItems[i].taskName,
          description: templateItems[i].description,
          completed,
          completedAt: completed ? (data.status === 'completed' ? new Date(scheduledEnd.getTime() - 20 * 60000 + i * 60000) : null) : null,
          order: i,
        },
      })
    }

    // Create rating if completed with score
    if (data.status === 'completed' && data.score) {
      await prisma.rating.create({
        data: {
          interventionId: intervention.id,
          agentId: agent.id,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email || undefined,
          score: data.score,
          comment: data.clientComment || undefined,
        },
      })
    }

    interventions.push(intervention)
    console.log(`   ✅ Intervention: ${client.name} → ${agent.firstName} ${agent.lastName} [${data.status}]`)
  }

  return interventions
}

// ============================================================================
// SEED QUALITY SCORES
// ============================================================================

async function seedQualityScores(companyId: string, agents: any[]) {
  console.log('\n⭐ Calcul des Scores Qualité...')

  for (const agent of agents) {
    const agentInterventions = await prisma.intervention.findMany({
      where: { agentId: agent.id, status: 'completed' },
      include: { rating: true },
    })

    if (agentInterventions.length === 0) continue

    const completedCount = agentInterventions.length
    const ratedInterventions = agentInterventions.filter(i => i.rating)
    const avgRating = ratedInterventions.length > 0
      ? ratedInterventions.reduce((sum, i) => sum + (i.rating?.score || 0), 0) / ratedInterventions.length
      : 0

    // Calculate sub-scores
    const punctualityScore = Math.min(100, 80 + Math.random() * 20) // 80-100
    const completionScore = agentInterventions.filter(i => {
      const items = true // simplified
      return true
    }).length > 0 ? Math.min(100, 75 + Math.random() * 25) : 50
    const clientRatingScore = avgRating > 0 ? (avgRating / 5) * 100 : 50
    const regularityScore = Math.min(100, 70 + completedCount * 5) // based on intervention count
    const reactivityScore = Math.min(100, 75 + Math.random() * 25)

    const overallScore = (
      punctualityScore * 0.2 +
      completionScore * 0.2 +
      clientRatingScore * 0.3 +
      regularityScore * 0.15 +
      reactivityScore * 0.15
    )

    const existingScore = await prisma.qualityScore.findFirst({
      where: { agentId: agent.id, companyId },
    })

    if (existingScore) {
      await prisma.qualityScore.update({
        where: { id: existingScore.id },
        data: {
          score: Math.round(overallScore * 10) / 10,
          punctualityScore: Math.round(punctualityScore * 10) / 10,
          completionScore: Math.round(completionScore * 10) / 10,
          clientRatingScore: Math.round(clientRatingScore * 10) / 10,
          regularityScore: Math.round(regularityScore * 10) / 10,
          reactivityScore: Math.round(reactivityScore * 10) / 10,
          interventionCount: completedCount,
          calculatedAt: new Date(),
        },
      })
      console.log(`   ⏭️  Score mis à jour: ${agent.firstName} ${agent.lastName} → ${Math.round(overallScore)}/100`)
    } else {
      await prisma.qualityScore.create({
        data: {
          agentId: agent.id,
          companyId,
          score: Math.round(overallScore * 10) / 10,
          punctualityScore: Math.round(punctualityScore * 10) / 10,
          completionScore: Math.round(completionScore * 10) / 10,
          clientRatingScore: Math.round(clientRatingScore * 10) / 10,
          regularityScore: Math.round(regularityScore * 10) / 10,
          reactivityScore: Math.round(reactivityScore * 10) / 10,
          interventionCount: completedCount,
        },
      })
      console.log(`   ✅ Score créé: ${agent.firstName} ${agent.lastName} → ${Math.round(overallScore)}/100`)
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       CleanCheck - Seed Data Script')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')

  try {
    // 1. Super Admin
    await seedSuperAdmin()

    // 2. Entreprise démo
    const company = await seedDemoCompany()

    // 3. Manager démo
    await seedDemoManager(company.id)

    // 4. Agents démo
    const agents = await seedDemoAgents(company.id)

    // 5. Clients démo
    const clients = await seedDemoClients(company.id)

    // 6. Templates de checklist
    const templates = await seedChecklistTemplates(company.id)

    // 7. Interventions démo
    const interventions = await seedDemoInterventions(company.id, clients, agents, templates)

    // 8. Scores qualité
    await seedQualityScores(company.id, agents)

    // Résumé
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('                    ✅ SEED TERMINÉ')
    console.log('═══════════════════════════════════════════════════════════')

    const stats = await Promise.all([
      prisma.user.count({ where: { role: 'superadmin' } }),
      prisma.user.count({ where: { role: 'manager' } }),
      prisma.user.count({ where: { role: 'agent' } }),
      prisma.client.count(),
      prisma.intervention.count(),
      prisma.checklistTemplate.count(),
      prisma.checklistItem.count(),
      prisma.rating.count(),
      prisma.qualityScore.count(),
      prisma.company.count(),
    ])

    console.log(`
📊 RÉSUMÉ DES DONNÉES CRÉÉES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Entreprises       : ${stats[9]}
🔐 Super Admins      : ${stats[0]}
👤 Managers          : ${stats[1]}
👷 Agents            : ${stats[2]}
🏢 Clients           : ${stats[3]}
📋 Interventions     : ${stats[4]}
📝 Templates         : ${stats[5]}
✅ Items Checklist   : ${stats[6]}
⭐ Évaluations       : ${stats[7]}
📊 Scores Qualité    : ${stats[8]}

🔑 IDENTIFIANTS DE CONNEXION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 SUPER ADMIN:
   Email    : superadmin@cleancheck.fr
   Password : SuperAdmin2025!

👤 MANAGER DÉMO:
   Email    : marie.dupont@cleanpro.fr
   Password : Manager2025!

👷 AGENTS (même mot de passe: Agent2025!):
   - sophie.laurent@cleanpro.fr
   - marc.dubois@cleanpro.fr
   - julie.robert@cleanpro.fr
   - thomas.martin@cleanpro.fr
   - emma.petit@cleanpro.fr
`)
    console.log('═══════════════════════════════════════════════════════════')

  } catch (error) {
    console.error('❌ Erreur pendant le seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
