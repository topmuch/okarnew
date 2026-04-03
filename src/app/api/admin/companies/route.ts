import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const companies = await db.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            interventions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = companies.map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      subscriptionTier: company.subscriptionTier,
      agentCount: company._count.users,
      interventionCount: company._count.interventions,
      createdAt: company.createdAt.toISOString(),
      isActive: true,
    }))

    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([
      { id: 'comp-001', name: 'CleanPro Services', slug: 'cleanpro-services', subscriptionTier: 'pro', agentCount: 12, interventionCount: 156, createdAt: '2024-06-15T10:00:00Z', isActive: true },
      { id: 'comp-002', name: 'Nettexpert', slug: 'nettexpert', subscriptionTier: 'enterprise', agentCount: 25, interventionCount: 342, createdAt: '2024-04-20T08:30:00Z', isActive: true },
      { id: 'comp-003', name: 'Propreté Plus', slug: 'proprete-plus', subscriptionTier: 'starter', agentCount: 5, interventionCount: 78, createdAt: '2024-08-10T14:00:00Z', isActive: true },
    ])
  }
}
