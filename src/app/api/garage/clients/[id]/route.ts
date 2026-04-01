/**
 * OKAR - Garage Client Details API
 * Get detailed information about a client including vehicles and interventions
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/clients/[id] - Détails d'un client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find the client in the database
    const client = await db.garageClient.findUnique({
      where: { id },
      include: {
        reminders: {
          where: { isSent: false },
          orderBy: { dueDate: 'asc' }
        }
      }
    })

    if (!client) {
      // Return demo data
      return NextResponse.json({
        success: true,
        data: getDemoClientDetails(id)
      })
    }

    // Get vehicles owned by this client (if we can match them)
    // For now, we'll get vehicles from the garage that might be associated
    // In a real app, you'd have a proper relationship

    // Get interventions for this client
    // This would require tracking which interventions belong to which client
    // For now, return the basic client info

    return NextResponse.json({
      success: true,
      data: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        vehicleCount: client.vehicleCount,
        lastVisitDate: client.lastVisitDate,
        totalSpent: client.totalSpent,
        notes: client.notes,
        reminders: client.reminders.map(r => ({
          id: r.id,
          type: r.type,
          message: r.message,
          dueDate: r.dueDate
        })),
        vehicles: [],
        interventions: []
      }
    })
  } catch (error) {
    console.error('Erreur récupération détails client:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des détails' },
      { status: 500 }
    )
  }
}

// Demo data for client details
function getDemoClientDetails(id: string) {
  const demoClients: Record<string, any> = {
    '1': {
      id: '1',
      name: 'Ahmed Fall',
      phone: '77 123 45 67',
      email: 'ahmed@email.com',
      vehicleCount: 2,
      lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      totalSpent: 485000,
      notes: 'Client régulier, préfère les pièces d\'origine. Toujours ponctuel.',
      reminders: [
        {
          id: 'r1',
          type: 'oil_change',
          message: 'Vidange dans 15 jours',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }
      ],
      vehicles: [
        {
          id: 'v1',
          plateNumber: 'DK-1234-AA',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2018
        },
        {
          id: 'v2',
          plateNumber: 'DK-5678-BB',
          brand: 'Honda',
          model: 'CR-V',
          year: 2020
        }
      ],
      interventions: [
        {
          id: 'i1',
          type: 'oil_change',
          title: 'Vidange complète',
          description: 'Huile 5W30, filtre à huile remplacé',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          cost: 45000,
          mileage: 125000,
          status: 'validated'
        },
        {
          id: 'i2',
          type: 'tire_change',
          title: 'Remplacement pneus avant',
          description: '4 pneus Michelin 205/55 R16',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          cost: 180000,
          mileage: 120000,
          status: 'validated'
        },
        {
          id: 'i3',
          type: 'major_repair',
          title: 'Réparation freins',
          description: 'Plaquettes et disques avant',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          cost: 120000,
          mileage: 115000,
          status: 'validated'
        }
      ]
    },
    '2': {
      id: '2',
      name: 'Fatou Diop',
      phone: '78 234 56 78',
      email: 'fatou@email.com',
      vehicleCount: 1,
      lastVisitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalSpent: 120000,
      notes: '',
      reminders: [
        {
          id: 'r2',
          type: 'ct_expiry',
          message: 'CT expire dans 30 jours',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ],
      vehicles: [
        {
          id: 'v3',
          plateNumber: 'DK-9999-CC',
          brand: 'Peugeot',
          model: '208',
          year: 2019
        }
      ],
      interventions: [
        {
          id: 'i4',
          type: 'inspection',
          title: 'Contrôle général',
          description: 'Check-up avant voyage',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          cost: 25000,
          mileage: 85000,
          status: 'validated'
        }
      ]
    },
    '3': {
      id: '3',
      name: 'Moussa Sow',
      phone: '76 345 67 89',
      email: null,
      vehicleCount: 1,
      lastVisitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      totalSpent: 250000,
      notes: 'Véhicule de fonction - Société ABC',
      reminders: [],
      vehicles: [
        {
          id: 'v4',
          plateNumber: 'DK-1111-DD',
          brand: 'Renault',
          model: 'Duster',
          year: 2021
        }
      ],
      interventions: [
        {
          id: 'i5',
          type: 'major_repair',
          title: 'Réparation climatisation',
          description: 'Remplacement compresseur',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          cost: 180000,
          mileage: 45000,
          status: 'validated'
        },
        {
          id: 'i6',
          type: 'oil_change',
          title: 'Vidange',
          description: 'Huile synthèse',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          cost: 35000,
          mileage: 45000,
          status: 'validated'
        }
      ]
    },
    '4': {
      id: '4',
      name: 'Aminata Ndiaye',
      phone: '77 456 78 90',
      email: 'aminata@email.com',
      vehicleCount: 3,
      lastVisitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalSpent: 1250000,
      notes: 'Cliente VIP, prioritaire. Toujours payer par virement.',
      reminders: [],
      vehicles: [
        {
          id: 'v5',
          plateNumber: 'DK-2222-EE',
          brand: 'Mercedes',
          model: 'Classe C',
          year: 2022
        },
        {
          id: 'v6',
          plateNumber: 'DK-3333-FF',
          brand: 'BMW',
          model: 'X3',
          year: 2021
        },
        {
          id: 'v7',
          plateNumber: 'DK-4444-GG',
          brand: 'Audi',
          model: 'A4',
          year: 2020
        }
      ],
      interventions: [
        {
          id: 'i7',
          type: 'oil_change',
          title: 'Vidange Mercedes',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          cost: 75000,
          mileage: 32000,
          status: 'validated'
        },
        {
          id: 'i8',
          type: 'major_repair',
          title: 'Révision BMW',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          cost: 350000,
          mileage: 55000,
          status: 'validated'
        },
        {
          id: 'i9',
          type: 'oil_change',
          title: 'Vidange Audi',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          cost: 65000,
          mileage: 48000,
          status: 'validated'
        }
      ]
    },
    '5': {
      id: '5',
      name: 'Ibrahima Ba',
      phone: '78 567 89 01',
      email: 'ibrahim@email.com',
      vehicleCount: 1,
      lastVisitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      totalSpent: 85000,
      notes: '',
      reminders: [
        {
          id: 'r3',
          type: 'insurance_expiry',
          message: 'Assurance expire dans 7 jours',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ],
      vehicles: [
        {
          id: 'v8',
          plateNumber: 'DK-5555-HH',
          brand: 'Hyundai',
          model: 'i30',
          year: 2017
        }
      ],
      interventions: [
        {
          id: 'i10',
          type: 'oil_change',
          title: 'Vidange simple',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          cost: 30000,
          mileage: 135000,
          status: 'validated'
        }
      ]
    }
  }

  return demoClients[id] || {
    id,
    name: 'Client inconnu',
    phone: 'N/A',
    email: null,
    vehicleCount: 0,
    lastVisitDate: null,
    totalSpent: 0,
    notes: '',
    reminders: [],
    vehicles: [],
    interventions: []
  }
}
