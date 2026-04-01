/**
 * OKAR - Garage Assistance API
 * API for garages to create and view support tickets
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/garage/assistance - Get tickets for a garage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const garageId = searchParams.get('garageId') || 'demo-garage-id'
    const status = searchParams.get('status')

    const where: any = { garageId }
    if (status) where.status = status

    const tickets = await db.supportTicket.findMany({
      where,
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // If no tickets in DB, return demo data
    if (tickets.length === 0) {
      return NextResponse.json({
        success: true,
        data: getDemoTickets()
      })
    }

    return NextResponse.json({
      success: true,
      data: tickets.map(ticket => ({
        id: ticket.id,
        garageId: ticket.garageId,
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

// POST /api/garage/assistance - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { garageId, userId, subject, message, priority } = body

    if (!garageId || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Garage, sujet et message requis' },
        { status: 400 }
      )
    }

    const ticket = await db.supportTicket.create({
      data: {
        garageId,
        userId: userId || 'demo-user-id',
        subject,
        message,
        priority: priority || 'normal',
        status: 'open'
      }
    })

    return NextResponse.json({ success: true, data: ticket })
  } catch (error) {
    console.error('Erreur création ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du ticket' },
      { status: 500 }
    )
  }
}

// Demo data
function getDemoTickets() {
  return [
    {
      id: 't1',
      garageId: 'demo-garage-id',
      userId: 'demo-user-id',
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
      garageId: 'demo-garage-id',
      userId: 'demo-user-id',
      subject: 'Demande de fonctionnalité - Export Excel',
      message: 'Serait-il possible d\'ajouter une fonction d\'export Excel pour les interventions ? Cela nous faciliterait la gestion administrative.',
      status: 'in_progress',
      priority: 'normal',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      resolvedAt: null,
      replies: [
        {
          id: 'r2',
          ticketId: 't2',
          userId: 'admin-1',
          userRole: 'superadmin',
          message: 'Excellente suggestion ! Nous avons ajouté cette fonctionnalité à notre roadmap. Elle devrait être disponible dans les prochaines semaines.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 't3',
      garageId: 'demo-garage-id',
      userId: 'demo-user-id',
      subject: 'Mise à jour des horaires',
      message: 'Comment puis-je mettre à jour mes horaires d\'ouverture ? Je ne trouve pas l\'option dans les paramètres.',
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
          message: 'Bonjour, pour mettre à jour vos horaires, allez dans Paramètres > Configuration Garage > Horaires. Vous pouvez ensuite modifier chaque jour individuellement.',
          createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'r4',
          ticketId: 't3',
          userId: 'demo-user-id',
          userRole: 'garage',
          message: 'Parfait, j\'ai trouvé ! Merci beaucoup pour votre aide.',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        }
      ]
    }
  ]
}
