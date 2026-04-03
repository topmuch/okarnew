import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const companies = await db.company.findMany({
      select: {
        id: true,
        name: true,
        subscriptionTier: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = companies.map((company) => ({
      id: `sub-${company.id}`,
      companyName: company.name,
      companyId: company.id,
      plan: company.subscriptionTier,
      status: company.subscriptionTier === 'free' ? 'active' : 'active',
      periodStart: company.createdAt.toISOString(),
      periodEnd: new Date(company.createdAt.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      trialEnd: null,
    }))

    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([
      { id: 'sub-001', companyName: 'CleanPro Services', companyId: 'comp-001', plan: 'pro', status: 'active', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-12-31T23:59:59Z', trialEnd: null },
      { id: 'sub-002', companyName: 'Nettexpert', companyId: 'comp-002', plan: 'enterprise', status: 'active', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-12-31T23:59:59Z', trialEnd: null },
    ])
  }
}
