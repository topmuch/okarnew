/**
 * OKAR - API Gestion des Demandes d'Activation en Attente
 * 
 * GET /api/superadmin/pending-activations
 * POST /api/superadmin/pending-activations
 * 
 * Permet au superadmin de:
 * - Lister les demandes d'activation en attente
 * - Approuver une demande (crée l'utilisateur, le véhicule et active le QR code)
 * - Rejeter une demande
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes, scryptSync } from 'crypto'
import { calculateInsuranceStatus, calculateTechnicalCheckStatus } from '@/lib/documentStatus'

// Fonction de hashage pour les mots de passe
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// Générer un mot de passe aléatoire
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password + '!1' // Ajouter un chiffre et un caractère spécial
}

// GET - Lister les demandes d'activation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    
    const pendingActivations = await db.pendingActivation.findMany({
      where: status !== 'all' ? { status } : undefined,
      include: {
        qrCode: {
          select: {
            id: true,
            code: true,
            type: true,
            assignedGarage: {
              select: {
                id: true,
                businessName: true,
                city: true
              }
            }
          }
        },
        assignedGarage: {
          select: {
            id: true,
            businessName: true,
            city: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques
    const stats = await db.pendingActivation.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const statsFormatted = {
      total: stats.reduce((acc, s) => acc + s._count.id, 0),
      pending: stats.find(s => s.status === 'pending')?._count.id || 0,
      approved: stats.find(s => s.status === 'approved')?._count.id || 0,
      rejected: stats.find(s => s.status === 'rejected')?._count.id || 0,
    }

    return NextResponse.json({
      pendingActivations,
      stats: statsFormatted
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    )
  }
}

// POST - Approuver ou rejeter une demande
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, pendingActivationId, rejectionReason, adminId } = body

    if (!action || !pendingActivationId) {
      return NextResponse.json(
        { error: 'Action et ID de la demande requis' },
        { status: 400 }
      )
    }

    // Récupérer la demande
    const pendingActivation = await db.pendingActivation.findUnique({
      where: { id: pendingActivationId },
      include: {
        qrCode: true
      }
    })

    if (!pendingActivation) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      )
    }

    if (pendingActivation.status !== 'pending') {
      return NextResponse.json(
        { error: `Cette demande a déjà été ${pendingActivation.status}` },
        { status: 400 }
      )
    }

    // REJETER
    if (action === 'reject') {
      const updated = await db.pendingActivation.update({
        where: { id: pendingActivationId },
        data: {
          status: 'rejected',
          rejectionReason: rejectionReason || 'Non spécifié',
          processedAt: new Date(),
          processedBy: adminId
        }
      })

      // Log d'audit
      await db.auditLog.create({
        data: {
          userId: adminId,
          action: 'PENDING_ACTIVATION_REJECTED',
          entityType: 'pending_activation',
          entityId: pendingActivationId,
          details: JSON.stringify({
            code: pendingActivation.code,
            plateNumber: pendingActivation.plateNumber,
            ownerEmail: pendingActivation.ownerEmail,
            rejectionReason
          }),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Demande rejetée',
        pendingActivation: updated
      })
    }

    // APPROUVER
    if (action === 'approve') {
      // Générer un mot de passe
      const generatedPassword = generatePassword()
      const passwordHash = hashPassword(generatedPassword)

      // Transaction atomique
      const result = await db.$transaction(async (tx) => {
        // 1. Créer ou trouver l'utilisateur
        let user = await tx.user.findUnique({
          where: { email: pendingActivation.ownerEmail }
        })

        if (!user) {
          user = await tx.user.create({
            data: {
              email: pendingActivation.ownerEmail,
              name: pendingActivation.ownerName,
              phone: pendingActivation.ownerPhone,
              passwordHash,
              role: 'driver',
              isApproved: true,
              subscriptionStatus: 'free',
            },
          })
        }

        // 2. Calculer les statuts des documents
        const insuranceStatusResult = calculateInsuranceStatus(
          pendingActivation.insuranceStartDate,
          pendingActivation.insuranceEndDate
        )
        const ctStatusResult = calculateTechnicalCheckStatus(
          pendingActivation.technicalCheckStartDate,
          pendingActivation.technicalCheckEndDate
        )

        // 3. Créer le véhicule
        const vehicle = await tx.vehicle.create({
          data: {
            plateNumber: pendingActivation.plateNumber,
            brand: pendingActivation.brand,
            model: pendingActivation.model,
            year: pendingActivation.year,
            color: pendingActivation.color,
            mileage: pendingActivation.mileage,
            vin: pendingActivation.vin,
            photoUrl: pendingActivation.photoUrl,
            ownerId: user.id,
            qrCodeId: pendingActivation.qrCodeId,
            garageId: pendingActivation.assignedGarageId,
            healthScore: 100,
            // Champs assurance
            insuranceStartDate: pendingActivation.insuranceStartDate,
            insuranceEndDate: pendingActivation.insuranceEndDate,
            insuranceStatus: insuranceStatusResult.status,
            // Champs CT
            technicalCheckStartDate: pendingActivation.technicalCheckStartDate,
            technicalCheckEndDate: pendingActivation.technicalCheckEndDate,
            technicalCheckStatus: ctStatusResult.status,
            // Compatibilité
            insuranceExpiryDate: pendingActivation.insuranceEndDate,
            technicalControlDate: pendingActivation.technicalCheckEndDate,
            technicalControlStatus: ctStatusResult.status,
          },
        })

        // 4. Mettre à jour le QR code
        await tx.qRCode.update({
          where: { id: pendingActivation.qrCodeId },
          data: {
            status: 'active',
            vehicleId: vehicle.id,
            activatedAt: new Date(),
            activatedByName: pendingActivation.ownerName,
            activatedByEmail: pendingActivation.ownerEmail,
            activatedByPhone: pendingActivation.ownerPhone,
          },
        })

        // 5. Mettre à jour la demande
        const updated = await tx.pendingActivation.update({
          where: { id: pendingActivationId },
          data: {
            status: 'approved',
            processedAt: new Date(),
            processedBy: adminId
          }
        })

        // 6. Créer les alertes si nécessaire
        if (insuranceStatusResult.status === 'expiring_soon' || insuranceStatusResult.status === 'expired') {
          await tx.vehicleAlert.create({
            data: {
              vehicleId: vehicle.id,
              type: 'insurance_expiry',
              message: insuranceStatusResult.status === 'expired'
                ? `Assurance expirée`
                : `Assurance expire dans ${insuranceStatusResult.daysRemaining} jours`,
              severity: insuranceStatusResult.status === 'expired' ? 'critical' : 'warning',
            },
          })
        }

        if (ctStatusResult.status === 'expiring_soon' || ctStatusResult.status === 'expired') {
          await tx.vehicleAlert.create({
            data: {
              vehicleId: vehicle.id,
              type: 'ct_expiry',
              message: ctStatusResult.status === 'expired'
                ? `Contrôle technique expiré`
                : `Contrôle technique expire dans ${ctStatusResult.daysRemaining} jours`,
              severity: ctStatusResult.status === 'expired' ? 'critical' : 'warning',
            },
          })
        }

        // 7. Log d'audit
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'PENDING_ACTIVATION_APPROVED',
            entityType: 'pending_activation',
            entityId: pendingActivationId,
            details: JSON.stringify({
              code: pendingActivation.code,
              vehiclePlate: pendingActivation.plateNumber,
              vehicleId: vehicle.id,
              ownerEmail: pendingActivation.ownerEmail,
              ownerId: user.id,
              isNewUser: true,
            }),
          },
        })

        return { vehicle, user, pendingActivation: updated, generatedPassword }
      })

      return NextResponse.json({
        success: true,
        message: 'Demande approuvée avec succès',
        data: {
          vehicleId: result.vehicle.id,
          userId: result.user.id,
          plateNumber: result.vehicle.plateNumber,
          ownerEmail: result.user.email,
          ownerPhone: result.user.phone,
          generatedPassword: result.generatedPassword, // Pour envoyer par WhatsApp
        }
      })
    }

    return NextResponse.json(
      { error: 'Action non reconnue. Utilisez "approve" ou "reject"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la demande' },
      { status: 500 }
    )
  }
}
