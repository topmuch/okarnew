/**
 * OKAR - Script de Seed Data
 * Peuple la base de données avec des données de test réalistes
 * 
 * Exécution: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import { randomInt, randomBytes, scryptSync } from 'crypto'

const prisma = new PrismaClient()

// ============================================================================
// FONCTION DE HASHAGE (identique à auth.ts pour compatibilité)
// ============================================================================

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function generateQRCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'OKAR-'
  for (let i = 0; i < 3; i++) code += chars[randomInt(0, chars.length)]
  code += '-'
  for (let i = 0; i < 3; i++) code += chars[randomInt(0, chars.length)]
  return code
}

function generatePlateNumber(city: string): string {
  const prefix = city === 'Dakar' ? 'DK' : city === 'Thiès' ? 'TH' : 'SL'
  const num = randomInt(100, 999)
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const l1 = letters[randomInt(0, letters.length)]
  const l2 = letters[randomInt(0, letters.length)]
  return `${prefix}-${num}-${l1}${l2}`
}

function generatePhone(): string {
  const prefixes = ['77', '78', '70', '76', '33']
  const prefix = prefixes[randomInt(0, prefixes.length)]
  let num = prefix
  for (let i = 0; i < 7; i++) num += randomInt(0, 10).toString()
  return num
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length)]
}

// ============================================================================
// DONNÉES DE RÉFÉRENCE
// ============================================================================

const GARAGE_DATA = [
  {
    businessName: 'Auto Service Dakar',
    ownerName: 'Moussa Diop',
    address: 'Route de Ouakam, 15ème Rue',
    city: 'Dakar',
    email: 'moussa.diop@autodakar.sn',
    phone: '771234567',
    isActive: true,
    isApproved: true,
    role: 'garage_certified',
  },
  {
    businessName: 'Mécanique Express',
    ownerName: 'Fatou Sow',
    address: 'Centre Ville, Avenue Fadiga',
    city: 'Thiès',
    email: 'fatou.sow@mecanexpress.sn',
    phone: '782345678',
    isActive: true,
    isApproved: false, // En attente
    role: 'garage_pending',
  },
  {
    businessName: 'Garage du Port',
    ownerName: 'Jean Ndiaye',
    address: 'Zone Portuaire, Rue 10',
    city: 'Dakar',
    email: 'jean.ndiaye@garageport.sn',
    phone: '703456789',
    isActive: false, // Suspendu
    isApproved: true,
    role: 'garage_certified',
  },
]

const DRIVER_DATA = [
  { name: 'Ahmed Fall', email: 'ahmed.fall@email.sn', phone: '770123456' },
  { name: 'Marie Kane', email: 'marie.kane@email.sn', phone: '781234567' },
  { name: 'Ousmane Ba', email: 'ousmane.ba@email.sn', phone: '762345678' },
  { name: 'Aminata Diallo', email: 'aminata.diallo@email.sn', phone: '703456789' },
  { name: 'Cheikh Gueye', email: 'cheikh.gueye@email.sn', phone: '774567890' },
]

const VEHICLE_DATA = [
  { brand: 'Toyota', model: 'Corolla', year: 2019, color: 'Blanc' },
  { brand: 'Hyundai', model: 'Tucson', year: 2021, color: 'Noir' },
  { brand: 'Mercedes', model: 'C-Class', year: 2020, color: 'Gris' },
  { brand: 'Renault', model: 'Duster', year: 2018, color: 'Rouge' },
  { brand: 'Peugeot', model: '301', year: 2017, color: 'Bleu' },
  { brand: 'Kia', model: 'Sportage', year: 2022, color: 'Blanc' },
  { brand: 'Ford', model: 'Ranger', year: 2019, color: 'Noir' },
  { brand: 'Nissan', model: 'Qashqai', year: 2020, color: 'Gris' },
  { brand: 'Volkswagen', model: 'Golf 7', year: 2018, color: 'Blanc' },
  { brand: 'BMW', model: 'Série 3', year: 2021, color: 'Noir' },
]

const MAINTENANCE_TYPES = [
  { type: 'oil_change', title: 'Vidange moteur', descriptions: [
    'Vidange complète avec huile 5W40 synthèse',
    'Remplacement huile moteur + filtre à huile',
    'Vidange + filtre à air',
  ]},
  { type: 'major_repair', title: 'Réparation majeure', descriptions: [
    'Remplacement plaquettes de frein avant',
    'Réparation suspension arrière',
    'Changement courroie de distribution',
    'Remplacement embrayage complet',
    'Réparation boîte de vitesses',
  ]},
  { type: 'accident', title: 'Réparation accident', descriptions: [
    'Réparation pare-chocs arrière',
    'Remplacement pare-brise',
    'Carrosserie latérale gauche',
  ]},
  { type: 'inspection', title: 'Contrôle technique', descriptions: [
    'Contrôle technique annuel effectué',
    'Diagnostic électronique complet',
    'Révision des 60 000 km',
  ]},
]

// ============================================================================
// FONCTIONS DE SEED
// ============================================================================

async function seedSuperAdmin() {
  console.log('🔐 Création du Super Admin...')
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'superadmin@okar.sn' }
  })
  
  if (existingAdmin) {
    console.log('   ⏭️  Super Admin existe déjà')
    return existingAdmin
  }
  
  const passwordHash = hashPassword('admin123')
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@okar.sn',
      passwordHash,
      name: 'Super Admin',
      phone: '770000000',
      role: 'superadmin',
      isApproved: true,
      subscriptionStatus: 'premium',
    }
  })
  
  console.log('   ✅ Super Admin créé: superadmin@okar.sn / admin123')
  return superAdmin
}

async function seedGarages() {
  console.log('\n🏭 Création des Garages...')
  const garages: { id: string; businessName: string; userId: string }[] = []
  const passwordHash = hashPassword('password123')
  
  for (const data of GARAGE_DATA) {
    // Vérifier si existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: { garage: true }
    })
    
    if (existingUser?.garage) {
      console.log(`   ⏭️  ${data.businessName} existe déjà`)
      garages.push({ 
        id: existingUser.garage.id, 
        businessName: data.businessName,
        userId: existingUser.id 
      })
      continue
    }
    
    // Créer l'utilisateur garage
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.ownerName,
        phone: data.phone,
        role: data.role,
        isApproved: data.isApproved,
        subscriptionStatus: data.isApproved ? 'premium' : 'free',
      }
    })
    
    // Créer le garage
    const garage = await prisma.garage.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        address: data.address,
        city: data.city,
        phone: data.phone,
        isActive: data.isActive,
        rating: data.isApproved ? 4.2 + Math.random() * 0.7 : 0,
        totalClients: data.isApproved ? randomInt(50, 200) : 0,
        totalRevenue: data.isApproved ? randomInt(500000, 2000000) : 0,
        certificationDate: data.isApproved ? randomDate(new Date('2022-01-01'), new Date('2023-12-31')) : null,
      }
    })
    
    console.log(`   ✅ ${data.businessName} créé (${data.isApproved ? 'Approuvé' : data.role === 'garage_pending' ? 'En attente' : 'Suspendu'})`)
    garages.push({ id: garage.id, businessName: data.businessName, userId: user.id })
  }
  
  return garages
}

async function seedQRCodes(garages: { id: string; businessName: string; userId: string }[]) {
  console.log('\n📱 Création des QR Codes...')
  let totalCreated = 0
  
  // Vérifier s'il existe déjà des QR codes
  const existingCount = await prisma.qRCode.count()
  if (existingCount > 0) {
    console.log(`   ⏭️  ${existingCount} QR Codes existent déjà`)
    return existingCount
  }
  
  const garage1 = garages[0] // Auto Service Dakar (actif)
  const garage2 = garages[1] // Mécanique Express (en attente)
  
  // Lot 1: 100 codes pour garage 1 (stock)
  console.log('   📦 Lot 1: 100 codes pour Auto Service Dakar (stock)...')
  for (let i = 0; i < 100; i++) {
    await prisma.qRCode.create({
      data: {
        code: generateQRCode(),
        lotId: 'LOT-001',
        type: 'garage',
        status: 'stock',
        assignedGarageId: garage1.id,
      }
    })
    totalCreated++
  }
  
  // Lot 2: 100 codes pour garage 1 (stock)
  console.log('   📦 Lot 2: 100 codes pour Auto Service Dakar (stock)...')
  for (let i = 0; i < 100; i++) {
    await prisma.qRCode.create({
      data: {
        code: generateQRCode(),
        lotId: 'LOT-002',
        type: 'garage',
        status: 'stock',
        assignedGarageId: garage1.id,
      }
    })
    totalCreated++
  }
  
  // Lot 3: 100 codes pour garage 2 (stock)
  console.log('   📦 Lot 3: 100 codes pour Mécanique Express (stock)...')
  for (let i = 0; i < 100; i++) {
    await prisma.qRCode.create({
      data: {
        code: generateQRCode(),
        lotId: 'LOT-003',
        type: 'garage',
        status: 'stock',
        assignedGarageId: garage2.id,
      }
    })
    totalCreated++
  }
  
  // Lot 4: 100 codes (50 actifs pour véhicules, 50 stock)
  console.log('   📦 Lot 4: 100 codes mixtes (50 actifs, 50 stock)...')
  for (let i = 0; i < 100; i++) {
    await prisma.qRCode.create({
      data: {
        code: generateQRCode(),
        lotId: 'LOT-004',
        type: i < 50 ? 'particulier' : 'garage',
        status: i < 50 ? 'active' : 'stock',
        assignedGarageId: i >= 50 ? garage1.id : null,
        // Les codes actifs seront liés aux véhicules plus tard
      }
    })
    totalCreated++
  }
  
  // Lot 5: 100 codes (10 perdus/volés, 90 stock)
  console.log('   📦 Lot 5: 100 codes (10 perdus, 90 stock)...')
  for (let i = 0; i < 100; i++) {
    await prisma.qRCode.create({
      data: {
        code: generateQRCode(),
        lotId: 'LOT-005',
        type: 'particulier',
        status: i < 10 ? 'lost' : 'stock',
      }
    })
    totalCreated++
  }
  
  console.log(`   ✅ ${totalCreated} QR Codes créés au total`)
  return totalCreated
}

async function seedDrivers() {
  console.log('\n👥 Création des Drivers...')
  const drivers: { id: string; name: string; email: string }[] = []
  const passwordHash = hashPassword('password123')
  
  for (const data of DRIVER_DATA) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existing) {
      console.log(`   ⏭️  ${data.name} existe déjà`)
      drivers.push({ id: existing.id, name: data.name, email: data.email })
      continue
    }
    
    const driver = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: 'driver',
        isApproved: true,
      }
    })
    
    console.log(`   ✅ ${data.name} créé`)
    drivers.push({ id: driver.id, name: data.name, email: data.email })
  }
  
  return drivers
}

async function seedVehicles(
  drivers: { id: string; name: string; email: string }[],
  garages: { id: string; businessName: string; userId: string }[]
) {
  console.log('\n🚗 Création des Véhicules...')
  const vehicles: { id: string; plateNumber: string; brand: string; model: string }[] = []
  const activeGarage = garages[0] // Auto Service Dakar
  
  // Récupérer les QR codes actifs disponibles
  const activeQRCodes = await prisma.qRCode.findMany({
    where: { status: 'active', vehicleId: null },
    take: 10
  })
  
  // Health scores: 3 verts, 5 oranges, 2 rouges
  const healthScores = [95, 92, 88, 65, 60, 55, 50, 45, 25, 20]
  
  for (let i = 0; i < VEHICLE_DATA.length; i++) {
    const data = VEHICLE_DATA[i]
    const driver = drivers[i % drivers.length]
    const city = i < 7 ? 'Dakar' : 'Thiès'
    const plateNumber = generatePlateNumber(city)
    
    // Vérifier si existe
    const existing = await prisma.vehicle.findFirst({
      where: { ownerId: driver.id, brand: data.brand, model: data.model }
    })
    
    if (existing) {
      console.log(`   ⏭️  ${data.brand} ${data.model} de ${driver.name} existe déjà`)
      vehicles.push({ 
        id: existing.id, 
        plateNumber: existing.plateNumber, 
        brand: data.brand, 
        model: data.model 
      })
      continue
    }
    
    const qrCode = activeQRCodes[i]
    
    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        mileage: randomInt(20000, 150000),
        ownerId: driver.id,
        garageId: activeGarage.id,
        healthScore: healthScores[i],
        qrCodeId: qrCode?.id,
        technicalControlDate: randomDate(new Date(), new Date('2025-12-31')),
        technicalControlStatus: i < 5 ? 'valid' : i < 8 ? 'expiring_soon' : 'expired',
        insuranceExpiryDate: randomDate(new Date(), new Date('2025-12-31')),
        insuranceStatus: i < 4 ? 'valid' : i < 7 ? 'expiring_soon' : 'expired',
      }
    })
    
    // Lier le QR code au véhicule
    if (qrCode) {
      await prisma.qRCode.update({
        where: { id: qrCode.id },
        data: { 
          vehicleId: vehicle.id,
          activatedAt: randomDate(new Date('2023-01-01'), new Date()),
          activatedByName: driver.name,
          activatedByEmail: driver.email,
          activatedByPhone: generatePhone(),
        }
      })
    }
    
    // Déterminer la couleur de santé
    const healthColor = healthScores[i] >= 80 ? '🟢' : healthScores[i] >= 40 ? '🟠' : '🔴'
    console.log(`   ✅ ${plateNumber} - ${data.brand} ${data.model} (${healthColor} Santé: ${healthScores[i]}%)`)
    vehicles.push({ 
      id: vehicle.id, 
      plateNumber, 
      brand: data.brand, 
      model: data.model 
    })
  }
  
  return vehicles
}

async function seedMaintenanceRecords(
  vehicles: { id: string; plateNumber: string; brand: string; model: string }[],
  garages: { id: string; businessName: string; userId: string }[]
) {
  console.log('\n🔧 Création des Historiques de Maintenance...')
  let totalRecords = 0
  const activeGarage = garages[0]
  
  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i]
    const numRecords = randomInt(3, 6) // 3 à 5 interventions par véhicule
    
    for (let j = 0; j < numRecords; j++) {
      const maintType = randomChoice(MAINTENANCE_TYPES)
      const description = randomChoice(maintType.descriptions)
      const mileage = randomInt(20000, 120000)
      const cost = maintType.type === 'accident' ? randomInt(150000, 800000) : 
                   maintType.type === 'major_repair' ? randomInt(50000, 300000) :
                   randomInt(15000, 50000)
      
      await prisma.maintenanceRecord.create({
        data: {
          vehicleId: vehicle.id,
          garageId: activeGarage.id,
          createdByUserId: activeGarage.userId,
          type: maintType.type,
          title: maintType.title,
          description,
          mileage,
          cost,
          oilType: maintType.type === 'oil_change' ? randomChoice(['5W40', '10W40', '5W30']) : null,
          oilQuantity: maintType.type === 'oil_change' ? randomChoice(['4L', '5L', '6L']) : null,
          parts: maintType.type === 'major_repair' ? JSON.stringify([
            { name: 'Plaquettes frein', quantity: 2 },
            { name: 'Filtre à huile', quantity: 1 }
          ]) : null,
          createdAt: randomDate(new Date('2023-01-01'), new Date()),
        }
      })
      totalRecords++
    }
    
    console.log(`   ✅ ${vehicle.plateNumber}: ${numRecords} interventions ajoutées`)
  }
  
  console.log(`   📊 Total: ${totalRecords} enregistrements créés`)
  return totalRecords
}

async function seedAlerts(vehicles: { id: string; plateNumber: string }[]) {
  console.log('\n⚠️  Création des Alertes...')
  
  const alertTypes = [
    { type: 'ct_expiry', message: 'Contrôle technique expire dans 30 jours', severity: 'warning' },
    { type: 'insurance_expiry', message: 'Assurance expire bientôt', severity: 'warning' },
    { type: 'maintenance_due', message: 'Vidange recommandée', severity: 'info' },
    { type: 'ct_expiry', message: 'Contrôle technique EXPIRÉ', severity: 'critical' },
  ]
  
  let totalAlerts = 0
  
  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i]
    // Seulement quelques véhicules ont des alertes
    if (i % 3 === 0) {
      const alert = alertTypes[i % alertTypes.length]
      await prisma.vehicleAlert.create({
        data: {
          vehicleId: vehicle.id,
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
        }
      })
      totalAlerts++
      console.log(`   ✅ Alerte pour ${vehicle.plateNumber}: ${alert.message}`)
    }
  }
  
  return totalAlerts
}

async function seedAuditLogs(
  garages: { id: string; businessName: string; userId: string }[],
  drivers: { id: string; name: string; email: string }[]
) {
  console.log('\n📝 Création des Logs d\'Audit...')
  
  const actions = [
    { action: 'user_login', entity: 'User' },
    { action: 'qr_generated', entity: 'QRCode' },
    { action: 'vehicle_created', entity: 'Vehicle' },
    { action: 'maintenance_added', entity: 'MaintenanceRecord' },
    { action: 'garage_approved', entity: 'Garage' },
  ]
  
  let totalLogs = 0
  
  for (let i = 0; i < 20; i++) {
    const action = actions[i % actions.length]
    const user = randomChoice([...garages.map(g => g.userId), ...drivers.map(d => d.id)])
    
    await prisma.auditLog.create({
      data: {
        userId: user,
        action: action.action,
        entityType: action.entity,
        entityId: `entity_${randomInt(1, 100)}`,
        details: JSON.stringify({ timestamp: new Date().toISOString() }),
        createdAt: randomDate(new Date('2024-01-01'), new Date()),
      }
    })
    totalLogs++
  }
  
  console.log(`   ✅ ${totalLogs} logs d'audit créés`)
  return totalLogs
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       OKAR - Seed Data Script')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
  
  try {
    // 1. Super Admin
    await seedSuperAdmin()
    
    // 2. Garages
    const garages = await seedGarages()
    
    // 3. QR Codes
    await seedQRCodes(garages)
    
    // 4. Drivers
    const drivers = await seedDrivers()
    
    // 5. Véhicules
    const vehicles = await seedVehicles(drivers, garages)
    
    // 6. Historiques de maintenance
    await seedMaintenanceRecords(vehicles, garages)
    
    // 7. Alertes
    await seedAlerts(vehicles)
    
    // 8. Logs d'audit
    await seedAuditLogs(garages, drivers)
    
    // Résumé final
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('                    ✅ SEED TERMINÉ')
    console.log('═══════════════════════════════════════════════════════════')
    
    const stats = await Promise.all([
      prisma.user.count({ where: { role: 'superadmin' } }),
      prisma.user.count({ where: { role: { in: ['garage_certified', 'garage_pending'] } } }),
      prisma.qRCode.count(),
      prisma.vehicle.count(),
      prisma.user.count({ where: { role: 'driver' } }),
      prisma.maintenanceRecord.count(),
    ])
    
    console.log(`
   📊 RÉSUMÉ DES DONNÉES CRÉÉES:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   👤 Super Admins     : ${stats[0]}
   🏭 Garages          : ${stats[1]}
   📱 QR Codes         : ${stats[2]}
   🚗 Véhicules        : ${stats[3]}
   👥 Drivers          : ${stats[4]}
   🔧 Interventions    : ${stats[5]}
   
   🔑 IDENTIFIANTS DE TEST:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Super Admin: superadmin@okar.sn / admin123
   Garages: {email} / password123
   Drivers: {email} / password123
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
