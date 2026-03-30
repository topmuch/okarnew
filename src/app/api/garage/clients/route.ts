/**
 * OKAR - Garage Clients API
 * CRM pour les garages
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/clients - Liste des clients du garage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const garageId = searchParams.get('garageId') || 'demo-garage-id'
    const withReminders = searchParams.get('reminders') === 'true'

    const garage = await db.garage.findUnique({ 
      where: { id: garageId },
      include: {
        clients: {
          include: {
            reminders: {
              where: { isSent: false },
              orderBy: { dueDate: 'asc' }
            }
          }
        }
      }
    })
    
    if (!garage) {
      return NextResponse.json({
        success: true,
        data: {
          clients: getDemoClients(),
          reminders: getDemoReminders()
        }
      })
    }

    const formatted = garage.clients.map(client => ({
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
      }))
    }))

    // Récupérer tous les rappels en attente
    const allReminders = await db.clientReminder.findMany({
      where: {
        client: { garageId },
        isSent: false
      },
      include: {
        client: true
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        clients: formatted,
        reminders: allReminders.map(r => ({
          id: r.id,
          clientId: r.clientId,
          clientName: r.client.name,
          clientPhone: r.client.phone,
          type: r.type,
          message: r.message,
          dueDate: r.dueDate
        }))
      }
    })
  } catch (error) {
    console.error('Erreur récupération clients:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    )
  }
}

// POST /api/garage/clients - Créer un client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { garageId, name, phone, email, notes } = body

    if (!garageId || !name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Nom et téléphone requis' },
        { status: 400 }
      )
    }

    // Vérifier si le client existe déjà
    const existing = await db.garageClient.findFirst({
      where: { garageId, phone }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce client existe déjà' },
        { status: 400 }
      )
    }

    const client = await db.garageClient.create({
      data: {
        garageId,
        name,
        phone,
        email,
        notes
      }
    })

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error('Erreur création client:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du client' },
      { status: 500 }
    )
  }
}

// PUT /api/garage/clients - Mettre à jour un client
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, name, phone, email, notes, lastVisitDate, totalSpent } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'ID client requis' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (notes !== undefined) updateData.notes = notes
    if (lastVisitDate) updateData.lastVisitDate = new Date(lastVisitDate)
    if (totalSpent) updateData.totalSpent = totalSpent

    const client = await db.garageClient.update({
      where: { id: clientId },
      data: updateData
    })

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error('Erreur mise à jour client:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// POST /api/garage/clients/reminders - Créer un rappel
export async function POST_REMINDER(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, type, message, dueDate } = body

    if (!clientId || !type || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      )
    }

    const reminder = await db.clientReminder.create({
      data: {
        clientId,
        type,
        message: message || getReminderMessage(type),
        dueDate: new Date(dueDate)
      }
    })

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    console.error('Erreur création rappel:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du rappel' },
      { status: 500 }
    )
  }
}

function getReminderMessage(type: string): string {
  const messages: Record<string, string> = {
    oil_change: 'Vidange recommandée',
    ct_expiry: 'Contrôle technique à renouveler',
    insurance_expiry: 'Assurance à renouveler',
    custom: 'Rappel'
  }
  return messages[type] || 'Rappel'
}

// Données de démo
function getDemoClients() {
  return [
    {
      id: '1',
      name: 'Ahmed Fall',
      phone: '77 123 45 67',
      email: 'ahmed@email.com',
      vehicleCount: 2,
      lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      totalSpent: 485000,
      notes: 'Client régulier, préfère les pièces d\'origine',
      reminders: []
    },
    {
      id: '2',
      name: 'Fatou Diop',
      phone: '78 234 56 78',
      email: 'fatou@email.com',
      vehicleCount: 1,
      lastVisitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalSpent: 120000,
      notes: '',
      reminders: []
    },
    {
      id: '3',
      name: 'Moussa Sow',
      phone: '76 345 67 89',
      email: null,
      vehicleCount: 1,
      lastVisitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      totalSpent: 250000,
      notes: 'Véhicule de fonction',
      reminders: []
    },
    {
      id: '4',
      name: 'Aminata Ndiaye',
      phone: '77 456 78 90',
      email: 'aminata@email.com',
      vehicleCount: 3,
      lastVisitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalSpent: 1250000,
      notes: 'Cliente VIP, prioritaire',
      reminders: []
    },
    {
      id: '5',
      name: 'Ibrahima Ba',
      phone: '78 567 89 01',
      email: 'ibrahim@email.com',
      vehicleCount: 1,
      lastVisitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      totalSpent: 85000,
      notes: '',
      reminders: []
    }
  ]
}

function getDemoReminders() {
  return [
    {
      id: 'r1',
      clientId: '1',
      clientName: 'Ahmed Fall',
      clientPhone: '77 123 45 67',
      type: 'oil_change',
      message: 'Vidange dans 15 jours',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'r2',
      clientId: '2',
      clientName: 'Fatou Diop',
      clientPhone: '78 234 56 78',
      type: 'ct_expiry',
      message: 'CT expire dans 30 jours',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'r3',
      clientId: '5',
      clientName: 'Ibrahima Ba',
      clientPhone: '78 567 89 01',
      type: 'insurance_expiry',
      message: 'Assurance expire dans 7 jours',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ]
}

// Export pour le routeur
export { POST_REMINDER as POST }
