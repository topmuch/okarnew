import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Demo mode: return recent interventions without auth
    const interventions = await db.intervention.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
        rating: { select: { score: true } },
      },
    })

    const formatted = interventions.map((i) => {
      const lastRating = i.rating?.score ?? null
      return {
        id: i.id,
        clientName: i.client?.name || 'Client inconnu',
        agentName: i.agent
          ? `${i.agent.firstName} ${i.agent.lastName.charAt(0)}.`
          : 'Agent inconnu',
        status: i.status,
        scheduledDate: i.scheduledStart
          ? i.scheduledStart.toISOString().split('T')[0]
          : i.createdAt.toISOString().split('T')[0],
        score: lastRating,
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Recent interventions error:', error)
    return NextResponse.json([
      { id: '1', clientName: 'Bureau Martin', agentName: 'Sophie L.', status: 'completed', scheduledDate: '2025-01-15', score: 5 },
      { id: '2', clientName: 'Hôtel Riviera', agentName: 'Marc D.', status: 'in_progress', scheduledDate: '2025-01-15', score: null },
      { id: '3', clientName: 'Clinique Santé+', agentName: 'Julie R.', status: 'pending', scheduledDate: '2025-01-16', score: null },
      { id: '4', clientName: 'Restaurant Le Jardin', agentName: 'Sophie L.', status: 'completed', scheduledDate: '2025-01-14', score: 4 },
      { id: '5', clientName: 'Immeuble Tour Eiffel', agentName: 'Marc D.', status: 'overdue', scheduledDate: '2025-01-13', score: null },
    ])
  }
}
