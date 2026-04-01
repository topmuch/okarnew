/**
 * OKAR - Script de Seed de la Base de Données
 * 
 * Initialise la base de données avec:
 * - Un compte superadmin par défaut
 * - Quelques données de test
 * 
 * Usage: bun run src/scripts/seed.ts
 */

import { db } from '../lib/db'
import { hashPassword } from '../lib/auth/auth'

async function main() {
  console.log('\n🌱 OKAR - Seed de la Base de Données')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Créer le superadmin
  console.log('👤 Création du compte superadmin...')
  const adminPasswordHash = hashPassword('admin123')
  
  const admin = await db.user.upsert({
    where: { email: 'admin@okar.com' },
    update: {},
    create: {
      email: 'admin@okar.com',
      passwordHash: adminPasswordHash,
      name: 'Admin OKAR',
      phone: '+221 77 000 00 00',
      role: 'superadmin',
      isApproved: true,
      subscriptionStatus: 'premium',
    },
  })
  console.log(`   ✅ Admin créé: ${admin.email}`)

  // 2. Créer un garage de test
  console.log('\n🔧 Création du garage de test...')
  const garagePasswordHash = hashPassword('garage123')
  
  const garageUser = await db.user.upsert({
    where: { email: 'garage@okar.com' },
    update: {},
    create: {
      email: 'garage@okar.com',
      passwordHash: garagePasswordHash,
      name: 'Auto Service Express',
      phone: '+221 77 123 45 67',
      role: 'garage_certified',
      isApproved: true,
      subscriptionStatus: 'premium',
    },
  })

  const garage = await db.garage.upsert({
    where: { userId: garageUser.id },
    update: {},
    create: {
      userId: garageUser.id,
      businessName: 'Auto Service Express',
      address: '123 Avenue Cheikh Anta Diop',
      city: 'Dakar',
      phone: '+221 77 123 45 67',
      latitude: 14.6928,
      longitude: -17.4467,
      isActive: true,
      certificationDate: new Date(),
      rating: 4.8,
      totalClients: 156,
      totalRevenue: 2450000,
    },
  })
  console.log(`   ✅ Garage créé: ${garage.businessName}`)

  // 3. Créer un driver de test
  console.log('\n🚗 Création du compte driver de test...')
  const driverPasswordHash = hashPassword('driver123')
  
  const driver = await db.user.upsert({
    where: { email: 'driver@okar.com' },
    update: {},
    create: {
      email: 'driver@okar.com',
      passwordHash: driverPasswordHash,
      name: 'Jean Dupont',
      phone: '+221 77 987 65 43',
      role: 'driver',
      isApproved: true,
      subscriptionStatus: 'free',
    },
  })
  console.log(`   ✅ Driver créé: ${driver.email}`)

  // 4. Créer quelques QR codes
  console.log('\n📱 Création de QR codes de test...')
  const qrCodes: { id: string; code: string; type: string; status: string }[] = []
  for (let i = 0; i < 10; i++) {
    const code = `OKAR-TEST${i.toString().padStart(4, '0')}`
    const qr = await db.qRCode.upsert({
      where: { code },
      update: {},
      create: {
        code,
        lotId: 'LOT-TEST',
        type: i < 5 ? 'garage' : 'particulier',
        status: 'stock',
        assignedGarageId: i < 5 ? garage.id : null,
      },
    })
    qrCodes.push(qr)
  }
  console.log(`   ✅ ${qrCodes.length} QR codes créés`)

  // 5. Créer un véhicule de test
  console.log('\n🚙 Création du véhicule de test...')
  const vehicle = await db.vehicle.upsert({
    where: { plateNumber: 'AA-1234-AA' },
    update: {},
    create: {
      plateNumber: 'AA-1234-AA',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2019,
      color: 'Blanc',
      mileage: 125000,
      ownerId: driver.id,
      garageId: garage.id,
      qrCodeId: qrCodes[0].id,
      technicalControlDate: new Date('2024-06-15'),
      technicalControlStatus: 'valid',
      insuranceExpiryDate: new Date('2024-12-31'),
      insuranceStatus: 'valid',
      healthScore: 78,
    },
  })
  console.log(`   ✅ Véhicule créé: ${vehicle.plateNumber}`)

  // Marquer le QR code comme actif
  await db.qRCode.update({
    where: { id: qrCodes[0].id },
    data: {
      status: 'active',
      vehicleId: vehicle.id,
      activatedAt: new Date(),
      activatedByName: driver.name,
      activatedByEmail: driver.email || undefined,
      activatedByPhone: driver.phone || undefined,
    },
  })

  // 6. Créer quelques interventions
  console.log('\n📋 Création des interventions de test...')
  const interventions = [
    {
      type: 'oil_change',
      title: 'Vidange huile moteur',
      description: 'Vidange complète avec filtre à huile',
      mileage: 120000,
      cost: 25000,
      oilType: '5W-30',
      oilQuantity: '4.5L',
    },
    {
      type: 'major_repair',
      title: 'Remplacement freins',
      description: 'Plaquettes et disques avant',
      mileage: 115000,
      cost: 85000,
      parts: JSON.stringify(['Plaquettes avant', 'Disques avant']),
    },
    {
      type: 'oil_change',
      title: 'Vidange huile moteur',
      description: 'Vidange standard',
      mileage: 105000,
      cost: 22000,
      oilType: '5W-30',
      oilQuantity: '4.5L',
    },
  ]

  for (const intervention of interventions) {
    await db.maintenanceRecord.create({
      data: {
        vehicleId: vehicle.id,
        garageId: garage.id,
        createdByUserId: garageUser.id,
        ...intervention,
        isOwnerValidated: true,
        ownerValidationDate: new Date(),
      },
    })
  }
  console.log(`   ✅ ${interventions.length} interventions créées`)

  // 7. Créer les assureurs partenaires
  console.log('\n🛡️ Création des assureurs partenaires...')
  const insuranceProviders = [
    {
      name: 'Sanlam Sénégal',
      slug: 'sanlam',
      logoUrl: '/images/insurance/sanlam.png',
      primaryColor: '#0033A0',
      coverages: JSON.stringify(['tiers', 'tiers_etendu', 'tous_risques']),
      basePriceTier: 75000,
      basePriceTiers: JSON.stringify({ '<5ans': 75000, '5-10ans': 95000, '>10ans': 120000 }),
      advantages: JSON.stringify(['Assistance 0 km', 'Paiement en 3x sans frais', 'Réseau de réparateurs agréés', 'Application mobile']),
      whatsappNumber: '+221781234567',
      websiteUrl: 'https://www.sanlam.sn',
      isRecommended: true,
      priority: 100,
    },
    {
      name: 'NSIA Assurances',
      slug: 'nsia',
      logoUrl: '/images/insurance/nsia.png',
      primaryColor: '#E31837',
      coverages: JSON.stringify(['tiers', 'tiers_etendu', 'tous_risques']),
      basePriceTier: 80000,
      basePriceTiers: JSON.stringify({ '<5ans': 80000, '5-10ans': 100000, '>10ans': 130000 }),
      advantages: JSON.stringify(['Dépannage 7j/7', 'Remorqueuse gratuite', 'Bonus fidélité', 'Prise en charge rapide']),
      whatsappNumber: '+221782345678',
      websiteUrl: 'https://www.nsia.sn',
      isRecommended: true,
      priority: 90,
    },
    {
      name: 'AXA Sénégal',
      slug: 'axa',
      logoUrl: '/images/insurance/axa.png',
      primaryColor: '#00008F',
      coverages: JSON.stringify(['tiers', 'tiers_etendu', 'tous_risques']),
      basePriceTier: 85000,
      basePriceTiers: JSON.stringify({ '<5ans': 85000, '5-10ans': 110000, '>10ans': 140000 }),
      advantages: JSON.stringify(['Réseau international', 'Assistance voyage', 'Garantie panne mécanique', 'Mobile app']),
      whatsappNumber: '+221783456789',
      websiteUrl: 'https://www.axa.sn',
      isRecommended: false,
      priority: 80,
    },
    {
      name: 'Star Assurance',
      slug: 'star',
      logoUrl: '/images/insurance/star.png',
      primaryColor: '#FFD700',
      coverages: JSON.stringify(['tiers', 'tiers_etendu', 'tous_risques']),
      basePriceTier: 70000,
      basePriceTiers: JSON.stringify({ '<5ans': 70000, '5-10ans': 90000, '>10ans': 110000 }),
      advantages: JSON.stringify(['Tarifs compétitifs', 'Service client réactif', 'Agences partout au Sénégal', 'Paiement mobile']),
      whatsappNumber: '+221784567890',
      websiteUrl: 'https://www.star-assurance.sn',
      isRecommended: false,
      priority: 70,
    },
    {
      name: 'Saham Assurance',
      slug: 'saham',
      logoUrl: '/images/insurance/saham.png',
      primaryColor: '#00A651',
      coverages: JSON.stringify(['tiers', 'tiers_etendu', 'tous_risques']),
      basePriceTier: 72000,
      basePriceTiers: JSON.stringify({ '<5ans': 72000, '5-10ans': 92000, '>10ans': 115000 }),
      advantages: JSON.stringify(['Couverture Afrique', 'Assistance 24h/24', 'Remboursement rapide', 'Partenariats garages']),
      whatsappNumber: '+221785678901',
      websiteUrl: 'https://www.sahamassurance.sn',
      isRecommended: false,
      priority: 60,
    },
  ]

  for (const provider of insuranceProviders) {
    await db.insuranceProvider.upsert({
      where: { slug: provider.slug },
      update: provider,
      create: provider,
    })
  }
  console.log(`   ✅ ${insuranceProviders.length} assureurs créés`)

  // Résumé
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ Seed terminé avec succès!')
  console.log('\n📝 Comptes de test:')
  console.log('   Superadmin: admin@okar.com / admin123')
  console.log('   Garage: garage@okar.com / garage123')
  console.log('   Driver: driver@okar.com / driver123')
  console.log('\n🛡️ Assureurs partenaires: 5')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
