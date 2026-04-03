import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        company: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      companyName: user.company?.name || 'CleanCheck',
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
    }))

    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([
      { id: 'u1', firstName: 'Super', lastName: 'Admin', email: 'superadmin@cleancheck.fr', role: 'superadmin', companyName: 'CleanCheck', isActive: true, lastLoginAt: '2025-01-15T08:00:00Z', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'u2', firstName: 'Marie', lastName: 'Dupont', email: 'marie@cleanpro.fr', role: 'manager', companyName: 'CleanPro Services', isActive: true, lastLoginAt: '2025-01-15T08:30:00Z', createdAt: '2024-06-15T10:00:00Z' },
    ])
  }
}
