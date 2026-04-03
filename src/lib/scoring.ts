/**
 * CleanCheck - Quality Score Calculator
 *
 * Calculates agent quality scores based on multiple criteria:
 * - Punctuality (20%)
 * - Task completion (20%)
 * - Client rating (30%)
 * - Regularity (15%)
 * - Reactivity (15%)
 */

import db from './db'

interface ScoreInputs {
  punctualityScore: number
  completionScore: number
  clientRatingScore: number
  regularityScore: number
  reactivityScore: number
  interventionCount: number
}

interface CalculatedScore extends ScoreInputs {
  score: number // Overall weighted score 0-100
}

/**
 * Calculate the overall quality score from sub-scores.
 */
export function calculateQualityScore(inputs: ScoreInputs): CalculatedScore {
  const { punctualityScore, completionScore, clientRatingScore, regularityScore, reactivityScore } = inputs

  const overallScore =
    punctualityScore * 0.2 +
    completionScore * 0.2 +
    clientRatingScore * 0.3 +
    regularityScore * 0.15 +
    reactivityScore * 0.15

  return {
    ...inputs,
    score: Math.round(overallScore * 10) / 10,
  }
}

/**
 * Save or update a quality score for an agent.
 */
export async function saveQualityScore(
  agentId: string,
  companyId: string,
): Promise<CalculatedScore | null> {
  try {
    // Get agent's completed interventions with ratings
    const interventions = await db.intervention.findMany({
      where: { agentId, status: 'completed' },
      include: { rating: true },
      orderBy: { scheduledStart: 'asc' },
    })

    if (interventions.length === 0) return null

    const completedCount = interventions.length
    const ratedInterventions = interventions.filter((i) => i.rating)
    const avgRating =
      ratedInterventions.length > 0
        ? ratedInterventions.reduce((sum, i) => sum + (i.rating?.score || 0), 0) / ratedInterventions.length
        : 0

    // Punctuality: based on interventions started on time
    const onTimeCount = interventions.filter((i) => {
      if (!i.actualStart || !i.scheduledStart) return false
      const delay = i.actualStart.getTime() - i.scheduledStart.getTime()
      return delay <= 15 * 60 * 1000 // Within 15 minutes
    }).length
    const punctualityScore = Math.min(100, (onTimeCount / completedCount) * 100)

    // Completion: based on checklist items completed
    let totalItems = 0
    let completedItems = 0
    for (const intervention of interventions) {
      const items = await db.checklistItem.findMany({
        where: { interventionId: intervention.id },
      })
      totalItems += items.length
      completedItems += items.filter((i) => i.completed).length
    }
    const completionScore = totalItems > 0 ? (completedItems / totalItems) * 100 : 50

    // Client rating: average of ratings (0-5 mapped to 0-100)
    const clientRatingScore = avgRating > 0 ? (avgRating / 5) * 100 : 50

    // Regularity: based on frequency of interventions
    const regularityScore = Math.min(100, 50 + completedCount * 10)

    // Reactivity: based on not having overdue interventions
    const overdueCount = interventions.filter((i) => {
      if (!i.actualStart) return false
      return i.actualStart.getTime() > i.scheduledEnd.getTime()
    }).length
    const reactivityScore = Math.max(0, 100 - overdueCount * 20)

    const inputs: ScoreInputs = {
      punctualityScore,
      completionScore,
      clientRatingScore,
      regularityScore,
      reactivityScore,
      interventionCount: completedCount,
    }

    const calculated = calculateQualityScore(inputs)

    // Upsert the quality score in DB
    const existing = await db.qualityScore.findFirst({
      where: { agentId, companyId },
    })

    if (existing) {
      await db.qualityScore.update({
        where: { id: existing.id },
        data: {
          score: calculated.score,
          punctualityScore: calculated.punctualityScore,
          completionScore: calculated.completionScore,
          clientRatingScore: calculated.clientRatingScore,
          regularityScore: calculated.regularityScore,
          reactivityScore: calculated.reactivityScore,
          interventionCount: calculated.interventionCount,
          calculatedAt: new Date(),
        },
      })
    } else {
      await db.qualityScore.create({
        data: {
          agentId,
          companyId,
          score: calculated.score,
          punctualityScore: calculated.punctualityScore,
          completionScore: calculated.completionScore,
          clientRatingScore: calculated.clientRatingScore,
          regularityScore: calculated.regularityScore,
          reactivityScore: calculated.reactivityScore,
          interventionCount: calculated.interventionCount,
        },
      })
    }

    return calculated
  } catch (error) {
    console.error('Error saving quality score:', error)
    return null
  }
}
