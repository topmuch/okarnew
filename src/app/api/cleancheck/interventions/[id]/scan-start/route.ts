import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyQRPayload } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { qrToken, pinCode, latitude, longitude } = body

    if (!qrToken) {
      return NextResponse.json(
        { success: false, error: 'QR token is required' },
        { status: 400 },
      )
    }

    // Verify the QR payload
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
      include: {
        client: { select: { id: true, name: true, address: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
        checklistTemplate: { select: { id: true, name: true, itemsJson: true } },
      },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    // Verify QR token matches intervention
    if (intervention.qrToken !== qrToken) {
      return NextResponse.json(
        { success: false, error: 'QR token does not match this intervention' },
        { status: 400 },
      )
    }

    // Check expiration
    if (new Date() > intervention.qrExpiresAt) {
      return NextResponse.json(
        { success: false, error: 'QR code has expired. Please request a new one.' },
        { status: 400 },
      )
    }

    // Check if already used
    if (intervention.qrUsed) {
      return NextResponse.json(
        { success: false, error: 'QR code has already been used' },
        { status: 400 },
      )
    }

    // Verify PIN if provided
    if (pinCode && intervention.qrPinCode !== pinCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN code' },
        { status: 400 },
      )
    }

    // Update intervention
    const updated = await db.intervention.update({
      where: { id },
      data: {
        status: 'in_progress',
        actualStart: new Date(),
        qrScannedAt: new Date(),
        notes: latitude && longitude
          ? `GPS: ${latitude}, ${longitude}`
          : intervention.notes,
      },
    })

    console.log(`[CleanCheck] Scan start for intervention ${id}`)
    console.log(`[CleanCheck] GPS: ${latitude || 'N/A'}, ${longitude || 'N/A'}`)

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        actualStart: updated.actualStart,
        client: intervention.client,
        agent: intervention.agent,
        checklistTemplate: intervention.checklistTemplate,
      },
    })
  } catch (error) {
    console.error('Scan start error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
