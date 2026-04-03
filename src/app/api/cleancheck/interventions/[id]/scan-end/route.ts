import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyQRPayload } from '@/lib/auth'
import { saveQualityScore } from '@/lib/scoring'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { qrToken } = body

    if (!qrToken) {
      return NextResponse.json(
        { success: false, error: 'QR token is required' },
        { status: 400 },
      )
    }

    // Verify QR payload
    const qrData = verifyQRPayload(qrToken)
    if (!qrData || !qrData.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid QR token' },
        { status: 400 },
      )
    }

    // Find intervention
    const intervention = await db.intervention.findUnique({
      where: { id },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    // Verify QR token matches
    if (intervention.qrToken !== qrToken) {
      return NextResponse.json(
        { success: false, error: 'QR token does not match this intervention' },
        { status: 400 },
      )
    }

    // Check if already completed/used
    if (intervention.qrUsed) {
      return NextResponse.json(
        { success: false, error: 'QR code has already been used' },
        { status: 400 },
      )
    }

    // Generate client report token
    const { randomBytes } = await import('crypto')
    const reportToken = randomBytes(24).toString('hex')
    const reportUrl = `/report/${id}?token=${reportToken}`

    // Update intervention
    const updated = await db.intervention.update({
      where: { id },
      data: {
        status: 'completed',
        actualEnd: new Date(),
        qrCompletedAt: new Date(),
        qrUsed: true,
        clientReportUrl: reportUrl,
      },
    })

    // Trigger score recalculation for the agent
    try {
      await saveQualityScore(intervention.agentId, intervention.companyId)
      console.log(`[CleanCheck] Score recalculated for agent ${intervention.agentId}`)
    } catch (scoreError) {
      console.error('[CleanCheck] Score recalculation failed:', scoreError)
    }

    console.log(`[CleanCheck] Scan end for intervention ${id}`)
    console.log(`[CleanCheck] Report URL: ${reportUrl}`)

    return NextResponse.json({
      success: true,
      data: {
        interventionId: updated.id,
        status: updated.status,
        reportUrl,
        completedAt: updated.actualEnd,
      },
    })
  } catch (error) {
    console.error('Scan end error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
