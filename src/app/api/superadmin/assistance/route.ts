/**
 * OKAR - Superadmin Assistance API
 * API for superadmins to manage support tickets
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/superadmin/assistance - Get all tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    const tickets = await db.supportTicket.findMany({
      where,
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: [
        { status: 'asc' }, // open first
        { priority: 'desc' }, // high priority first
        { createdAt: 'desc' }
      ]
    })

    // If no tickets in DB, return demo data
    if (tickets.length === 0) {
      return NextResponse.json({
        success: true,
        data: getDemoTickets()
      })
    }

    // Get garage info for each ticket
    const garageIds = [...new Set(tickets.map(t => t.garageId))]
    const garages = await db.garage.findMany({
      where: { id: { in: garageIds } },
      select: { id: true, businessName: true, phone: true }
    })
    const garageMap = Object.fromEntries(garages.map(g => [g.id, g]))

    return NextResponse.json({
      success: true,
      data: tickets.map(ticket => ({
        id: ticket.id,
        garageId: ticket.garageId,
        garageName: garageMap[ticket.garageId]?.businessName || 'Garage inconnu',
        garagePhone: garageMap[ticket.garageId]?.phone,
        userId: ticket.userId,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt,
        replies: ticket.replies.map((reply: any) => ({
          id: reply.id,
          userId: reply.userId,
          userRole: reply.userRole,
          message: reply.message,
          createdAt: reply.createdAt
        }))
      }))
    })
  } catch (error) {
    console.error('Erreur récupération tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    )
  }
}

// PUT /api/superadmin/assistance - Update ticket status or add reply
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId, status, priority, reply, userId } = body

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'ID du ticket requis' },
        { status: 400 }
      )
    }

    // Update ticket
    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date()
      }
    }
    if (priority) updateData.priority = priority

    const ticket = await db.supportTicket.update({
      where: { id: ticketId },
      data: updateData
    })

    // Add reply if provided
    if (reply && userId) {
      await db.supportTicketReply.create({
        data: {
          ticketId,
          userId,
          userRole: 'superadmin',
          message: reply
        }
      })
    }

    return NextResponse.json({ success: true, data: ticket })
  } catch (error) {
    console.error('Erreur mise à jour ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// Demo data
function getDemoTickets() {
  return [
    {
      id: 't1',
      garageId: 'garage-1',
      garageName: 'Auto Service Express',
      garagePhone: '77 123 45 67',
      userId: 'user-1',
      subject: 'Problème avec le scanner QR',
      message: 'Le scanner QR ne fonctionne pas correctement. Il ne détecte pas les codes même lorsqu\'ils sont valides.',
      status: 'open',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      resolvedAt: null,
      replies: [
        {
          id: 'r1',
          ticketId: 't1',
          userId: 'admin-1',
          userRole: 'superadmin',
          message: 'Bonjour, nous avons bien reçu votre demande. Pouvez-vous nous préciser le modèle de téléphone que vous utilisez ?',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 't2',
      garageId: 'garage-2',
      garageName: 'Garage Moderne',
      garagePhone: '78 234 56 78',
      userId: 'user-2',
      subject: 'Demande de fonctionnalité - Export Excel',
      message: 'Serait-il possible d\'ajouter une fonction d\'export Excel pour les interventions ?',
      status: 'in_progress',
      priority: 'normal',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      resolvedAt: null,
      replies: [
        {
          id: 'r2',
          ticketId: 't2',
          userId: 'admin-1',
          userRole: 'superadmin',
          message: 'Excellente suggestion ! Nous avons ajouté cette fonctionnalité à notre roadmap.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 't3',
      garageId: 'garage-1',
      garageName: 'Auto Service Express',
      garagePhone: '77 123 45 67',
      userId: 'user-1',
      subject: 'Mise à jour des horaires',
      message: 'Comment puis-je mettre à jour mes horaires d\'ouverture ?',
      status: 'resolved',
      priority: 'low',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      replies: [
        {
          id: 'r3',
          ticketId: 't3',
          userId: 'admin-1',
          userRole: 'superadmin',
          message: 'Bonjour, pour mettre à jour vos horaires, allez dans Paramètres > Configuration Garage > Horaires.',
          createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'r4',
          ticketId: 't3',
          userId: 'user-1',
          userRole: 'garage',
          message: 'Parfait, j\'ai trouvé ! Merci beaucoup.',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 't4',
      garageId: 'garage-3',
      garageName: 'Centre Auto Premium',
      garagePhone: '76 345 67 89',
      userId: 'user-3',
      subject: 'Erreur de paiement',
      message: 'Un client a été débité deux fois pour une intervention. Comment procéder au remboursement ?',
      status: 'open',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      resolvedAt: null,
      replies: []
    }
  ]
}
