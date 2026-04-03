import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, generateQRPayload, generatePinCode } from '@/lib/auth'
import { generateQRCodeImage } from '@/lib/qr'

async function requireManager(req: NextRequest) {
  const token = req.cookies.get('token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const user = await verifyToken(token)
  if (!user || user.role !== 'manager' || !user.companyId) return null
  return user
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interventionId: string }> },
) {
  try {
    const user = await requireManager(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const { interventionId } = await params

    // Find intervention
    const intervention = await db.intervention.findFirst({
      where: { id: interventionId, companyId: user.companyId },
    })

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: 'Intervention not found' },
        { status: 404 },
      )
    }

    // Generate new QR token and PIN
    const newQrToken = generateQRPayload(interventionId)
    const newPinCode = generatePinCode()
    const newExpiresAt = new Date()
    newExpiresAt.setHours(newExpiresAt.getHours() + 4)

    // Update intervention
    const updated = await db.intervention.update({
      where: { id: interventionId },
      data: {
        qrToken: newQrToken,
        qrPinCode: newPinCode,
        qrGeneratedAt: new Date(),
        qrExpiresAt: newExpiresAt,
        qrScannedAt: null,
        qrCompletedAt: null,
        qrUsed: false,
      },
    })

    // Generate QR code image
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const qrCodeImage = await generateQRCodeImage(
      `${baseUrl}/api/cleancheck/qr/verify?token=${newQrToken}`,
    )

    console.log(`[CleanCheck] QR code regenerated for intervention ${interventionId}`)
    console.log(`[CleanCheck] New PIN: ${newPinCode}`)

    return NextResponse.json({
      success: true,
      data: {
        interventionId: updated.id,
        qrToken: newQrToken,
        qrPinCode: newPinCode,
        qrExpiresAt: newExpiresAt,
        qrCodeImage,
      },
    })
  } catch (error) {
    console.error('Regenerate QR error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
