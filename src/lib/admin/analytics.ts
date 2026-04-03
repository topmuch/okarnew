/**
 * CleanCheck - Platform Analytics Service
 *
 * Aggregates platform-wide metrics for SuperAdmin dashboard.
 * Multi-tenant aware: can filter by company.
 */

import db from '@/lib/db'

interface DateRange {
  startDate: Date
  endDate: Date
}

function getDateRange(period: '7d' | '30d' | '90d' | '12m'): DateRange {
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '12m':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  return { startDate, endDate }
}

interface PlatformMetrics {
  companies: {
    total: number
    active: number
    newThisPeriod: number
    byPlan: Record<string, number>
  }
  users: {
    total: number
    managers: number
    agents: number
    activeThisPeriod: number
  }
  interventions: {
    total: number
    completed: number
    inProgress: number
    avgPerDay: number
    completionRate: number
  }
  ratings: {
    total: number
    avgScore: number
    distribution: Record<number, number>
  }
  qualityScores: {
    avgScore: number
    above80: number
    below50: number
  }
  subscriptions: {
    mrr: number
    activePaid: number
    avgPlan: string
  }
}

export async function getPlatformMetrics(
  period: '7d' | '30d' | '90d' | '12m' = '30d',
  companyId?: string,
): Promise<PlatformMetrics> {
  const { startDate, endDate } = getDateRange(period)
  const companyFilter = companyId ? { companyId } : {}

  // Companies
  const [totalCompanies, activeCompanies, newCompanies] = await Promise.all([
    db.company.count(),
    db.company.count({ where: { ...companyFilter } }),
    db.company.count({ where: { ...companyFilter, createdAt: { gte: startDate } } }),
  ])

  const companiesByPlan = await db.company.groupBy({
    by: ['subscriptionTier'],
    where: companyId ? { id: companyId } : undefined,
    _count: { id: true },
  })

  // Users
  const [totalUsers, managers, agents, activeUsers] = await Promise.all([
    db.user.count({ where: { role: { in: ['manager', 'agent'] } } }),
    db.user.count({ where: { role: 'manager', ...companyFilter } }),
    db.user.count({ where: { role: 'agent', ...companyFilter } }),
    db.user.count({
      where: { ...companyFilter, lastLoginAt: { gte: startDate } },
    }),
  ])

  // Interventions
  const [totalInterventions, completedInterventions, inProgressInterventions] = await Promise.all([
    db.intervention.count({
      where: { ...companyFilter, createdAt: { gte: startDate, lte: endDate } },
    }),
    db.intervention.count({
      where: { ...companyFilter, status: 'completed', createdAt: { gte: startDate, lte: endDate } },
    }),
    db.intervention.count({ where: { ...companyFilter, status: 'in_progress' } }),
  ])

  const daysDiff = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  )

  // Ratings
  const allRatings = await db.rating.findMany({
    where: { ...companyFilter, createdAt: { gte: startDate, lte: endDate } },
    select: { score: true },
  })

  const avgScore =
    allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length
      : 0

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  allRatings.forEach((r) => {
    distribution[r.score] = (distribution[r.score] || 0) + 1
  })

  // Quality Scores
  const qualityScores = await db.qualityScore.findMany({
    where: companyFilter,
    select: { score: true },
  })

  const avgQualityScore =
    qualityScores.length > 0
      ? qualityScores.reduce((sum, q) => sum + q.score, 0) / qualityScores.length
      : 0

  // Subscriptions (MRR)
  const planCounts = await db.company.groupBy({
    by: ['subscriptionTier'],
    _count: { id: true },
  })

  const planPricing: Record<string, number> = { free: 0, starter: 29, pro: 99, enterprise: 299 }

  let mrr = 0
  let mostCommonPlan = 'free'
  let maxCount = 0
  for (const pc of planCounts) {
    const count = pc._count.id
    mrr += (planPricing[pc.subscriptionTier] || 0) * count
    if (count > maxCount) {
      maxCount = count
      mostCommonPlan = pc.subscriptionTier
    }
  }

  return {
    companies: {
      total: totalCompanies,
      active: activeCompanies,
      newThisPeriod: newCompanies,
      byPlan: Object.fromEntries(
        companiesByPlan.map((c) => [c.subscriptionTier, c._count.id]),
      ),
    },
    users: {
      total: totalUsers,
      managers,
      agents,
      activeThisPeriod: activeUsers,
    },
    interventions: {
      total: totalInterventions,
      completed: completedInterventions,
      inProgress: inProgressInterventions,
      avgPerDay: Math.round((totalInterventions / daysDiff) * 10) / 10,
      completionRate:
        totalInterventions > 0
          ? Math.round((completedInterventions / totalInterventions) * 100)
          : 0,
    },
    ratings: {
      total: allRatings.length,
      avgScore: Math.round(avgScore * 10) / 10,
      distribution,
    },
    qualityScores: {
      avgScore: Math.round(avgQualityScore * 10) / 10,
      above80: qualityScores.filter((q) => q.score >= 80).length,
      below50: qualityScores.filter((q) => q.score < 50).length,
    },
    subscriptions: {
      mrr,
      activePaid: planCounts
        .filter((p) => p.subscriptionTier !== 'free')
        .reduce((s, p) => s + p._count.id, 0),
      avgPlan: mostCommonPlan,
    },
  }
}

export async function getInterventionTrend(
  period: '7d' | '30d' | '90d' | '12m' = '30d',
): Promise<{ date: string; count: number; completed: number }[]> {
  const { startDate, endDate } = getDateRange(period)
  const interventions = await db.intervention.findMany({
    where: {
      scheduledStart: { gte: startDate, lte: endDate },
    },
    select: { scheduledStart: true, status: true },
    orderBy: { scheduledStart: 'asc' },
  })

  // Group by date
  const grouped = new Map<string, { count: number; completed: number }>()
  interventions.forEach((i) => {
    const dateKey = i.scheduledStart.toISOString().split('T')[0]
    const entry = grouped.get(dateKey) || { count: 0, completed: 0 }
    entry.count++
    if (i.status === 'completed') entry.completed++
    grouped.set(dateKey, entry)
  })

  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    ...data,
  }))
}
