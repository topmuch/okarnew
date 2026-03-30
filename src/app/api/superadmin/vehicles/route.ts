/**
 * OKAR - API Véhicules Superadmin (Audit)
 * 
 * GET /api/superadmin/vehicles - Liste des véhicules pour audit
 * GET /api/superadmin/vehicles?id=xxx - Détails d'un véhicule
 * 
 * Inclut les infos client et le type de QR code
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { db } from '@/lib/db'

// GET - Liste des véhicules ou détails
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('id')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Si un ID est fourni, retourner les détails complets
    if (vehicleId) {
      const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
          garage: {
            select: {
              id: true,
              businessName: true,
              city: true,
            },
          },
          qrCode: {
            select: {
              code: true,
              lotId: true,
              type: true,
              status: true,
              activatedByName: true,
              activatedByEmail: true,
              activatedByPhone: true,
              activatedAt: true,
            },
          },
          maintenanceHistory: {
            orderBy: { createdAt: 'desc' },
            include: {
              garage: {
                select: { businessName: true },
              },
            },
          },
          alerts: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })

      if (!vehicle) {
        return NextResponse.json(
          { error: 'Véhicule non trouvé' },
          { status: 404 }
        )
      }

      // Formater pour l'audit
      const auditData = {
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        vin: vehicle.vin,
        mileage: vehicle.mileage,
        healthScore: vehicle.healthScore,
        qrCode: vehicle.qrCode?.code || 'N/A',
        qrType: vehicle.qrCode?.type || 'particulier',
        // Infos du client
        owner: {
          id: vehicle.owner.id,
          name: vehicle.owner.name || 'N/A',
          email: vehicle.owner.email,
          phone: vehicle.owner.phone || 'N/A',
          registeredAt: vehicle.owner.createdAt.toISOString(),
        },
        // Infos de l'activateur du QR (peut être différent du propriétaire actuel)
        qrActivatedBy: vehicle.qrCode?.activatedByName ? {
          name: vehicle.qrCode.activatedByName,
          email: vehicle.qrCode.activatedByEmail,
          phone: vehicle.qrCode.activatedByPhone,
          activatedAt: vehicle.qrCode.activatedAt?.toISOString(),
        } : null,
        garage: vehicle.garage ? {
          id: vehicle.garage.id,
          name: vehicle.garage.businessName,
          city: vehicle.garage.city,
        } : null,
        technicalControl: {
          lastDate: vehicle.technicalControlDate?.toISOString() || 'N/A',
          nextDate: vehicle.technicalControlDate 
            ? new Date(vehicle.technicalControlDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : 'N/A',
          status: vehicle.technicalControlStatus,
        },
        insurance: {
          company: 'N/A',
          expiryDate: vehicle.insuranceExpiryDate?.toISOString() || 'N/A',
          status: vehicle.insuranceStatus,
        },
        history: vehicle.maintenanceHistory.map((record) => ({
          id: record.id,
          type: record.type,
          title: record.title,
          description: record.description,
          date: record.createdAt.toISOString(),
          mileage: record.mileage,
          cost: record.cost || 0,
          garage: record.garage.businessName,
          validated: record.isOwnerValidated,
          parts: record.parts ? JSON.parse(record.parts) : undefined,
          oilType: record.oilType,
        })),
        transferHistory: [], // TODO: Implémenter si table de transfert
      }

      return NextResponse.json({ vehicle: auditData })
    }

    // Sinon, retourner la liste
    const where: any = {}
    
    if (search) {
      where.OR = [
        { plateNumber: { contains: search.toUpperCase() } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { owner: { name: { contains: search } } },
        { owner: { email: { contains: search } } },
      ]
    }

    const vehicles = await db.vehicle.findMany({
      where,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        qrCode: {
          select: {
            code: true,
            type: true,
            status: true,
            activatedByName: true,
            activatedByEmail: true,
            activatedByPhone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await db.vehicle.count({ where })

    // Formater pour la liste avec infos client complètes
    const formattedVehicles = vehicles.map((v) => ({
      id: v.id,
      plateNumber: v.plateNumber,
      brand: v.brand,
      model: v.model,
      year: v.year,
      owner: v.owner.name || v.owner.email,
      ownerEmail: v.owner.email,
      ownerPhone: v.owner.phone,
      healthScore: v.healthScore,
      mileage: v.mileage,
      qrCode: v.qrCode?.code || 'N/A',
      qrType: v.qrCode?.type || 'particulier',
      // Infos de l'activateur du QR code
      qrActivatedBy: v.qrCode?.activatedByName,
      createdAt: v.createdAt.toISOString(),
    }))

    return NextResponse.json({
      vehicles: formattedVehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
