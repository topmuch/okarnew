import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyQRPayload } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 },
      )
    }

    // Verify the QR payload
    const qrData = verifyQRPayload(token)
    if (!qrData || !qrData.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid QR token' },
        { status: 400 },
      )
    }

    // Find the intervention by QR token
    const intervention = await db.intervention.findUnique({
      where: { qrToken: token },
      include: {
        client: { select: { id: true, name: true, address: true, phone: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
        checklistTemplate: { select: { id: true, name: true, itemsJson: true } },
        company: { select: { id: true, name: true } },
      },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    // Check if expired
    const isExpired = new Date() > intervention.qrExpiresAt

    return NextResponse.json({
      success: true,
      data: {
        interventionId: intervention.id,
        status: intervention.status,
        qrExpired: isExpired,
        qrUsed: intervention.qrUsed,
        client: intervention.client,
        agent: intervention.agent,
        checklistTemplate: intervention.checklistTemplate
          ? {
              ...intervention.checklistTemplate,
              items: JSON.parse(intervention.checklistTemplate.itemsJson),
            }
          : null,
        company: intervention.company,
        scheduledStart: intervention.scheduledStart,
        scheduledEnd: intervention.scheduledEnd,
      },
    })
  } catch (error) {
    console.error('Verify QR error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
