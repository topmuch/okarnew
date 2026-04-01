/**
 * OKAR - Garage Settings API
 * Paramètres et configuration du garage
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/settings - Paramètres du garage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const garageId = searchParams.get('garageId') || 'demo-garage-id'

    const garage = await db.garage.findUnique({ 
      where: { id: garageId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone: true
          }
        }
      }
    })
    
    if (!garage) {
      return NextResponse.json({
        success: true,
        data: getDemoSettings()
      })
    }

    // Parser les données JSON
    let specialties = []
    let workingHours = {}
    let photos = []

    try {
      if (garage.specialties) specialties = JSON.parse(garage.specialties)
    } catch (e) {}
    
    try {
      if (garage.workingHours) workingHours = JSON.parse(garage.workingHours)
    } catch (e) {}
    
    try {
      if (garage.photos) photos = JSON.parse(garage.photos)
    } catch (e) {}

    return NextResponse.json({ 
      success: true, 
      data: {
        // Infos de base
        id: garage.id,
        businessName: garage.businessName,
        address: garage.address,
        city: garage.city,
        phone: garage.phone,
        email: garage.user.email,
        contactName: garage.user.name,
        contactPhone: garage.user.phone,
        
        // Localisation
        latitude: garage.latitude,
        longitude: garage.longitude,
        
        // Certification
        isActive: garage.isActive,
        certificationDate: garage.certificationDate,
        rating: garage.rating,
        
        // Abonnement
        subscription: {
          plan: garage.subscriptionPlan,
          status: garage.subscriptionStatus,
          expiry: garage.subscriptionExpiry
        },
        
        // Configuration
        specialties,
        workingHours,
        publicDescription: garage.publicDescription,
        websiteUrl: garage.websiteUrl,
        photos,
        
        // Statistiques
        totalClients: garage.totalClients,
        totalRevenue: garage.totalRevenue,
        
        // Dates
        createdAt: garage.createdAt,
        updatedAt: garage.updatedAt
      }
    })
  } catch (error) {
    console.error('Erreur récupération paramètres:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// POST /api/garage/settings - Mettre à jour les paramètres
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      garageId,
      businessName,
      address,
      city,
      phone,
      publicDescription,
      websiteUrl,
      specialties,
      workingHours,
      photos,
      latitude,
      longitude
    } = body

    if (!garageId) {
      return NextResponse.json(
        { success: false, error: 'ID garage requis' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (businessName) updateData.businessName = businessName
    if (address) updateData.address = address
    if (city) updateData.city = city
    if (phone) updateData.phone = phone
    if (publicDescription !== undefined) updateData.publicDescription = publicDescription
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl
    if (specialties) updateData.specialties = JSON.stringify(specialties)
    if (workingHours) updateData.workingHours = JSON.stringify(workingHours)
    if (photos) updateData.photos = JSON.stringify(photos)
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude

    const garage = await db.garage.update({
      where: { id: garageId },
      data: updateData
    })

    // Log de l'action
    await db.auditLog.create({
      data: {
        action: 'GARAGE_SETTINGS_UPDATE',
        entityType: 'garage',
        entityId: garageId,
        details: JSON.stringify(Object.keys(updateData))
      }
    })

    return NextResponse.json({ success: true, data: garage })
  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// POST /api/garage/settings/renew - Renouveler l'abonnement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { garageId, plan } = body

    if (!garageId || !plan) {
      return NextResponse.json(
        { success: false, error: 'ID garage et plan requis' },
        { status: 400 }
      )
    }

    // Calculer la nouvelle date d'expiration (1 an)
    const newExpiry = new Date()
    newExpiry.setFullYear(newExpiry.getFullYear() + 1)

    const garage = await db.garage.update({
      where: { id: garageId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: 'active',
        subscriptionExpiry: newExpiry
      }
    })

    // Log de l'action
    await db.auditLog.create({
      data: {
        action: 'SUBSCRIPTION_RENEWAL',
        entityType: 'garage',
        entityId: garageId,
        details: JSON.stringify({ plan, newExpiry })
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        plan: garage.subscriptionPlan,
        status: garage.subscriptionStatus,
        expiry: garage.subscriptionExpiry
      }
    })
  } catch (error) {
    console.error('Erreur renouvellement:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du renouvellement' },
      { status: 500 }
    )
  }
}

// Données de démo
function getDemoSettings() {
  return {
    id: 'demo-garage-id',
    businessName: 'Auto Service Plus',
    address: '123 Avenue Cheikh Anta Diop',
    city: 'Dakar',
    phone: '33 849 12 34',
    email: 'contact@autoservice.sn',
    contactName: 'Mamadou Diallo',
    contactPhone: '77 123 45 67',
    
    latitude: 14.6928,
    longitude: -17.4467,
    
    isActive: true,
    certificationDate: new Date('2023-06-15'),
    rating: 4.8,
    
    subscription: {
      plan: 'premium',
      status: 'active',
      expiry: new Date('2025-12-31')
    },
    
    specialties: ['Moteur', 'Carrosserie', 'Électricité', 'Climatisation'],
    
    workingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    
    publicDescription: 'Garage certifié OKAR spécialisé dans la réparation moteur et carrosserie. Plus de 15 ans d\'expérience au service de votre véhicule.',
    websiteUrl: 'https://autoservice.sn',
    photos: [
      '/images/garage-1.jpg',
      '/images/garage-2.jpg',
      '/images/garage-3.jpg'
    ],
    
    totalClients: 156,
    totalRevenue: 2450000,
    
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date()
  }
}
