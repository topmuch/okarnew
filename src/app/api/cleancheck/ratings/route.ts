import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { saveQualityScore } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { interventionId, token, score, comment, clientName, clientEmail } = body

    if (!interventionId || !token || !score) {
      return NextResponse.json(
        { success: false, error: 'interventionId, token, and score are required' },
        { status: 400 },
      )
    }

    if (score < 1 || score > 5) {
      return NextResponse.json(
        { success: false, error: 'Score must be between 1 and 5' },
        { status: 400 },
      )
    }

    // Verify the intervention exists and is completed
    const intervention = await db.intervention.findUnique({
      where: { id: interventionId },
      include: { agent: true },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    if (intervention.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Can only rate completed interventions' },
        { status: 400 },
      )
    }

    // Verify token matches the client report URL token
    if (!intervention.clientReportUrl || !intervention.clientReportUrl.includes(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired report token' },
        { status: 401 },
      )
    }

    // Check if already rated
    const existingRating = await db.rating.findUnique({
      where: { interventionId },
    })
    if (existingRating) {
      return NextResponse.json(
        { success: false, error: 'This intervention has already been rated' },
        { status: 409 },
      )
    }

    // Create rating
    const rating = await db.rating.create({
      data: {
        interventionId,
        score,
        comment: comment || null,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
      },
    })

    // Trigger score recalculation for the agent
    try {
      await saveQualityScore(intervention.agentId, intervention.companyId)
      console.log(`[CleanCheck] Score recalculated for agent ${intervention.agentId} after rating`)
    } catch (scoreError) {
      console.error('[CleanCheck] Score recalculation failed after rating:', scoreError)
    }

    return NextResponse.json({ success: true, data: rating }, { status: 201 })
  } catch (error) {
    console.error('Create rating error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
