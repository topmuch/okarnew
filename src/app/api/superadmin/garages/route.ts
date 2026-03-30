/**
 * OKAR - API Gestion Garages Superadmin
 * 
 * GET  /api/superadmin/garages - Liste des garages
 * POST /api/superadmin/garages - Actions (valider, rejeter, suspendre, créer)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hashPassword } from '@/lib/auth/auth'
import { db } from '@/lib/db'

// GET - Liste des garages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = {}

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { city: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ]
    }

    if (status !== 'all') {
      if (status === 'pending') {
        where.user = { role: 'garage_pending' }
      } else if (status === 'approved') {
        where.isActive = true
        where.user = { role: 'garage_certified' }
      } else if (status === 'suspended') {
        where.isActive = false
      }
    }

    // Récupérer les garages avec les infos utilisateur
    const garages = await db.garage.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isApproved: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    // Compter le total
    const total = await db.garage.count({ where })

    // Formater la réponse
    const formattedGarages = garages.map((garage) => ({
      id: garage.id,
      businessName: garage.businessName,
      ownerName: garage.user.name || 'N/A',
      email: garage.user.email,
      phone: garage.phone || garage.user.phone || 'N/A',
      city: garage.city,
      address: garage.address,
      status: garage.user.role === 'garage_pending' ? 'pending' :
              garage.isActive ? 'approved' : 'suspended',
      documentsComplete: true, // TODO: Implémenter la vérification des documents
      submittedAt: garage.createdAt.toISOString(),
      rating: garage.rating,
      totalClients: garage.totalClients,
      totalRevenue: garage.totalRevenue,
      latitude: garage.latitude,
      longitude: garage.longitude,
    }))

    return NextResponse.json({
      garages: formattedGarages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des garages:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Actions sur les garages
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    // Action: Créer un nouveau garage
    if (action === 'create') {
      const { businessName, ownerName, email, phone, city, address, generatedPassword } = body

      if (!businessName || !ownerName || !email || !generatedPassword || !city) {
        return NextResponse.json(
          { error: 'Informations manquantes pour créer le garage' },
          { status: 400 }
        )
      }

      // Vérifier si l'email existe déjà
      const existingUser = await db.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        )
      }

      // Hasher le mot de passe avec scrypt (cohérent avec le système d'auth)
      const passwordHash = hashPassword(generatedPassword)

      // Créer l'utilisateur et le garage
      const result = await db.$transaction([
        // Créer l'utilisateur
        db.user.create({
          data: {
            email,
            passwordHash,
            name: ownerName,
            phone: phone || null,
            role: 'garage_certified', // Directement certifié car créé par superadmin
            isApproved: true,
          },
        }),
      ])

      const newUser = result[0]

      // Créer le garage
      const newGarage = await db.garage.create({
        data: {
          userId: newUser.id,
          businessName,
          address: address || '',
          city,
          phone: phone || '',
          isActive: true,
          certificationDate: new Date(),
        },
      })

      // Log d'audit
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'GARAGE_CREATED',
          entityType: 'garage',
          entityId: newGarage.id,
          details: JSON.stringify({
            businessName,
            ownerName,
            ownerEmail: email,
            city,
          }),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Garage créé avec succès',
        garage: {
          id: newGarage.id,
          businessName,
          ownerName,
          email,
          city,
        },
      })
    }

    // Actions existantes sur les garages
    const { garageId, reason } = body

    if (!garageId) {
      return NextResponse.json(
        { error: 'garageId requis' },
        { status: 400 }
      )
    }

    // Récupérer le garage
    const garage = await db.garage.findUnique({
      where: { id: garageId },
      include: { user: true },
    })

    if (!garage) {
      return NextResponse.json({ error: 'Garage non trouvé' }, { status: 404 })
    }

    let result

    switch (action) {
      case 'validate':
        // Valider le garage
        result = await db.$transaction([
          // Mettre à jour le rôle de l'utilisateur
          db.user.update({
            where: { id: garage.userId },
            data: {
              role: 'garage_certified',
              isApproved: true,
            },
          }),
          // Activer le garage
          db.garage.update({
            where: { id: garageId },
            data: {
              isActive: true,
              certificationDate: new Date(),
            },
          }),
          // Log d'audit
          db.auditLog.create({
            data: {
              userId: user.id,
              action: 'GARAGE_VALIDATED',
              entityType: 'garage',
              entityId: garageId,
              details: JSON.stringify({
                businessName: garage.businessName,
                ownerEmail: garage.user.email,
              }),
            },
          }),
        ])
        break

      case 'reject':
        if (!reason) {
          return NextResponse.json(
            { error: 'Raison du rejet requise' },
            { status: 400 }
          )
        }
        
        result = await db.$transaction([
          // Rejeter le garage
          db.user.update({
            where: { id: garage.userId },
            data: {
              role: 'driver', // Rétrograder en driver
              isApproved: false,
            },
          }),
          // Désactiver le garage
          db.garage.update({
            where: { id: garageId },
            data: { isActive: false },
          }),
          // Log d'audit
          db.auditLog.create({
            data: {
              userId: user.id,
              action: 'GARAGE_REJECTED',
              entityType: 'garage',
              entityId: garageId,
              details: JSON.stringify({
                businessName: garage.businessName,
                ownerEmail: garage.user.email,
                reason,
              }),
            },
          }),
        ])
        break

      case 'suspend':
        result = await db.$transaction([
          // Suspendre le garage
          db.garage.update({
            where: { id: garageId },
            data: { isActive: false },
          }),
          // Log d'audit
          db.auditLog.create({
            data: {
              userId: user.id,
              action: 'GARAGE_SUSPENDED',
              entityType: 'garage',
              entityId: garageId,
              details: JSON.stringify({
                businessName: garage.businessName,
              }),
            },
          }),
        ])
        break

      case 'reactivate':
        result = await db.$transaction([
          // Réactiver le garage
          db.garage.update({
            where: { id: garageId },
            data: { isActive: true },
          }),
          // Log d'audit
          db.auditLog.create({
            data: {
              userId: user.id,
              action: 'GARAGE_REACTIVATED',
              entityType: 'garage',
              entityId: garageId,
              details: JSON.stringify({
                businessName: garage.businessName,
              }),
            },
          }),
        ])
        break

      case 'delete':
        // D'abord créer le log d'audit
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'GARAGE_DELETED',
            entityType: 'garage',
            entityId: garageId,
            details: JSON.stringify({
              businessName: garage.businessName,
              ownerEmail: garage.user.email,
            }),
          },
        })
        
        // Supprimer dans l'ordre pour respecter les contraintes de clé étrangère
        // 1. Supprimer les interventions liées au garage
        await db.maintenanceRecord.deleteMany({
          where: { garageId },
        })
        
        // 2. Supprimer les QR codes attribués au garage
        await db.qRCode.deleteMany({
          where: { assignedGarageId: garageId },
        })
        
        // 3. Supprimer les badges du garage
        await db.garageBadge.deleteMany({
          where: { garageId },
        })
        
        // 4. Supprimer les clients du garage
        await db.garageClient.deleteMany({
          where: { garageId },
        })
        
        // 5. Détacher les véhicules du garage (ne pas les supprimer, juste retirer le garageId)
        await db.vehicle.updateMany({
          where: { garageId },
          data: { garageId: null },
        })
        
        // 6. Supprimer le garage
        await db.garage.delete({
          where: { id: garageId },
        })
        
        // 7. Supprimer l'utilisateur associé
        await db.user.delete({
          where: { id: garage.userId },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      garageId,
    })
  } catch (error) {
    console.error('Erreur lors de l\'action sur le garage:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
