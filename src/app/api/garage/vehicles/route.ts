/**
 * OKAR - Garage Vehicles API
 * Gestion des véhicules actifs au garage
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/vehicles - Liste des véhicules du garage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const garageId = searchParams.get('garageId') || 'demo-garage-id'
    const status = searchParams.get('status') || 'active' // active, all

    const garage = await db.garage.findUnique({ where: { id: garageId } })
    if (!garage) {
      return NextResponse.json({
        success: true,
        data: getDemoVehicles()
      })
    }

    const whereClause: any = { garageId }
    if (status === 'active') {
      whereClause.isActive = true
    }

    const vehicles = await db.vehicle.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { name: true, phone: true, email: true }
        },
        qrCode: {
          select: { code: true, activatedAt: true }
        },
        _count: {
          select: { maintenanceHistory: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const formatted = vehicles.map(v => ({
      id: v.id,
      plateNumber: v.plateNumber,
      brand: v.brand,
      model: v.model,
      year: v.year,
      color: v.color,
      mileage: v.mileage,
      healthScore: v.healthScore,
      owner: {
        name: v.owner.name,
        phone: v.owner.phone,
        email: v.owner.email
      },
      qrCode: v.qrCode?.code,
      interventionCount: v._count.maintenanceHistory,
      lastVisit: v.qrCode?.activatedAt || v.createdAt,
      technicalControl: {
        date: v.technicalControlDate,
        status: v.technicalControlStatus
      },
      insurance: {
        expiry: v.insuranceExpiryDate,
        status: v.insuranceStatus
      }
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error('Erreur récupération véhicules:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des véhicules' },
      { status: 500 }
    )
  }
}

// POST /api/garage/vehicles - Activer un pass (nouveau véhicule)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      garageId,
      qrCodeId,
      plateNumber,
      brand,
      model,
      year,
      color,
      mileage,
      ownerName,
      ownerPhone,
      ownerEmail,
      technicalControlDate,
      insuranceExpiryDate
    } = body

    if (!garageId || !qrCodeId || !plateNumber || !brand || !model || !ownerName || !ownerPhone) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que le QR code est disponible
    const qrCode = await db.qRCode.findUnique({
      where: { id: qrCodeId }
    })

    if (!qrCode || qrCode.status !== 'stock') {
      return NextResponse.json(
        { success: false, error: 'QR code non disponible' },
        { status: 400 }
      )
    }

    // Créer ou récupérer l'utilisateur
    let user = await db.user.findFirst({
      where: { phone: ownerPhone }
    })

    if (!user) {
      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8)
      user = await db.user.create({
        data: {
          email: ownerEmail || `${ownerPhone}@okar.temp`,
          passwordHash: tempPassword, // TODO: hasher le mot de passe
          name: ownerName,
          phone: ownerPhone,
          role: 'driver'
        }
      })
    }

    // Créer le véhicule
    const vehicle = await db.vehicle.create({
      data: {
        plateNumber,
        brand,
        model,
        year: year ? parseInt(year) : null,
        color,
        mileage: parseInt(mileage) || 0,
        qrCodeId,
        ownerId: user.id,
        garageId,
        technicalControlDate: technicalControlDate ? new Date(technicalControlDate) : null,
        insuranceExpiryDate: insuranceExpiryDate ? new Date(insuranceExpiryDate) : null
      }
    })

    // Mettre à jour le QR code
    await db.qRCode.update({
      where: { id: qrCodeId },
      data: {
        status: 'active',
        vehicleId: vehicle.id,
        activatedByName: ownerName,
        activatedByPhone: ownerPhone,
        activatedByEmail: ownerEmail,
        activatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        vehicle,
        tempPassword: user.passwordHash // Pour envoyer au client
      } 
    })
  } catch (error) {
    console.error('Erreur activation véhicule:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'activation du pass' },
      { status: 500 }
    )
  }
}

// Données de démo
function getDemoVehicles() {
  return [
    {
      id: '1',
      plateNumber: 'DK-409-HN',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2019,
      color: 'Blanc',
      mileage: 125000,
      healthScore: 95,
      owner: {
        name: 'Ahmed Fall',
        phone: '77 123 45 67',
        email: 'ahmed@email.com'
      },
      qrCode: 'OKAR-ABC-123',
      interventionCount: 8,
      lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      technicalControl: {
        date: new Date('2025-06-15'),
        status: 'valid'
      },
      insurance: {
        expiry: new Date('2025-03-20'),
        status: 'valid'
      }
    },
    {
      id: '2',
      plateNumber: 'DK-123-AB',
      brand: 'Renault',
      model: 'Logan',
      year: 2020,
      color: 'Gris',
      mileage: 89000,
      healthScore: 78,
      owner: {
        name: 'Fatou Diop',
        phone: '78 234 56 78',
        email: 'fatou@email.com'
      },
      qrCode: 'OKAR-DEF-456',
      interventionCount: 5,
      lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      technicalControl: {
        date: new Date('2024-12-01'),
        status: 'expiring_soon'
      },
      insurance: {
        expiry: new Date('2024-12-15'),
        status: 'expiring_soon'
      }
    },
    {
      id: '3',
      plateNumber: 'DK-789-XY',
      brand: 'Peugeot',
      model: '208',
      year: 2022,
      color: 'Bleu',
      mileage: 67000,
      healthScore: 100,
      owner: {
        name: 'Moussa Sow',
        phone: '76 345 67 89',
        email: null
      },
      qrCode: 'OKAR-GHI-789',
      interventionCount: 3,
      lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      technicalControl: {
        date: new Date('2025-08-20'),
        status: 'valid'
      },
      insurance: {
        expiry: new Date('2025-06-10'),
        status: 'valid'
      }
    },
    {
      id: '4',
      plateNumber: 'DK-456-CD',
      brand: 'Mercedes',
      model: 'Classe C',
      year: 2021,
      color: 'Noir',
      mileage: 45000,
      healthScore: 88,
      owner: {
        name: 'Aminata Ndiaye',
        phone: '77 456 78 90',
        email: 'aminata@email.com'
      },
      qrCode: 'OKAR-JKL-012',
      interventionCount: 12,
      lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      technicalControl: {
        date: new Date('2025-01-15'),
        status: 'valid'
      },
      insurance: {
        expiry: new Date('2025-02-28'),
        status: 'valid'
      }
    }
  ]
}
