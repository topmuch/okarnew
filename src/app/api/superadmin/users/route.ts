/**
 * OKAR - API Gestion des Utilisateurs (SuperAdmin)
 * 
 * GET: Liste des utilisateurs avec filtres
 * POST: Créer/Mettre à jour/Supprimer un utilisateur
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = {}
    
    if (role && role !== 'all') {
      where.role = role
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Récupérer les utilisateurs
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isApproved: true,
          subscriptionStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              vehicles: true,
              maintenanceRecords: true,
            }
          },
          garage: {
            select: {
              id: true,
              businessName: true,
              city: true,
              isActive: true,
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Statistiques
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: stats.reduce((acc, s) => {
        acc[s.role] = s._count
        return acc
      }, {} as Record<string, number>)
    })

  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, userData, name, email, phone, role, password } = body

    switch (action) {
      case 'create': {
        // Créer un nouvel utilisateur - accepte les données de userData ou à plat
        const userDataObj = userData || { name, email, phone, role, password }
        const { email: userEmail, password: userPassword, name: userName, phone: userPhone, role: userRole } = userDataObj
        
        // Vérifier si l'email existe déjà
        const existing = await prisma.user.findUnique({
          where: { email: userEmail }
        })
        
        if (existing) {
          return NextResponse.json(
            { error: 'Un utilisateur avec cet email existe déjà' },
            { status: 400 }
          )
        }

        const passwordHash = hashPassword(userPassword)
        
        const user = await prisma.user.create({
          data: {
            email: userEmail,
            passwordHash,
            name: userName,
            phone: userPhone,
            role: userRole || 'driver',
            isApproved: userRole === 'superadmin',
            subscriptionStatus: 'free'
          }
        })

        return NextResponse.json({ 
          success: true, 
          user: { ...user, passwordHash: undefined } 
        })
      }

      case 'update': {
        // Mettre à jour un utilisateur
        const { name, phone, role, isApproved, subscriptionStatus } = userData
        
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            name,
            phone,
            role,
            isApproved,
            subscriptionStatus
          }
        })

        return NextResponse.json({ 
          success: true, 
          user: { ...user, passwordHash: undefined } 
        })
      }

      case 'resetPassword': {
        // Réinitialiser le mot de passe
        const { password } = userData
        const passwordHash = hashPassword(password)
        
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash }
        })

        return NextResponse.json({ success: true })
      }

      case 'delete': {
        // Supprimer un utilisateur
        await prisma.user.delete({
          where: { id: userId }
        })

        return NextResponse.json({ success: true })
      }

      case 'toggleApproval': {
        // Approuver/Suspendre un utilisateur
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })
        
        if (!user) {
          return NextResponse.json(
            { error: 'Utilisateur non trouvé' },
            { status: 404 }
          )
        }

        const updated = await prisma.user.update({
          where: { id: userId },
          data: { isApproved: !user.isApproved }
        })

        return NextResponse.json({ 
          success: true, 
          user: { ...updated, passwordHash: undefined } 
        })
      }

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erreur gestion utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'opération' },
      { status: 500 }
    )
  }
}
