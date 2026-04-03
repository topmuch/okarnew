/**
 * CleanCheck - Quality Score Algorithm
 *
 * Calculates agent quality scores based on 5 weighted criteria:
 * - Ponctualité (Punctuality): 25%
 * - Complétion Checklist (Checklist Completion): 20%
 * - Note Client (Client Rating): 35%
 * - Régularité (Regularity): 10%
 * - Réactivité (Reactivity): 10%
 *
 * Score = (Punctuality × 0.25) + (Completion × 0.20) + (Client Rating × 0.35)
 *        + (Regularity × 0.10) + (Reactivity × 0.10)
 */

import db from '@/lib/db'

// ============================================================================
// TYPES
// ============================================================================

export interface AgentScoreBreakdown {
  punctualityScore: number
  completionScore: number
  clientRatingScore: number
  regularityScore: number
  reactivityScore: number
  overallScore: number
  interventionCount: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WEIGHT_PUNCTUALITY = 0.25
const WEIGHT_COMPLETION = 0.20
const WEIGHT_CLIENT_RATING = 0.35
const WEIGHT_REGULARITY = 0.10
const WEIGHT_REACTIVITY = 0.10

const DEFAULT_RATING_SCORE = 70 // Used when no ratings exist yet
const MAX_INTERVENTIONS_FOR_SCORE = 5

// ============================================================================
// SCORE CALCULATORS
// ============================================================================

/**
 * Calculate punctuality score for a single intervention.
 * Based on the difference between actual start and scheduled start.
 * Score: min(100, max(0, 100 - diff_minutes / 2))
 */
function calculatePunctualityScore(
  scheduledStart: Date,
  actualStart: Date
): number {
  const diffMs = actualStart.getTime() - scheduledStart.getTime()
  const diffMinutes = diffMs / (60 * 1000)

  // Negative = early, positive = late
  const score = 100 - Math.abs(diffMinutes) / 2
  return Math.min(100, Math.max(0, Math.round(score * 10) / 10))
}

/**
 * Calculate checklist completion score for a single intervention.
 * Percentage of completed items over total items.
 */
function calculateCompletionScore(
  totalItems: number,
  completedItems: number
): number {
  if (totalItems === 0) return 100
  return Math.round((completedItems / totalItems) * 100 * 10) / 10
}

/**
 * Calculate reactivity score for a single intervention.
 * Based on the time between QR scan and actual start.
 * Score: 100 - avg_minutes (capped 0-100)
 */
function calculateReactivityScore(
  qrScannedAt: Date | null,
  actualStart: Date | null
): number {
  if (!qrScannedAt || !actualStart) return 75 // Default if no data

  const diffMs = actualStart.getTime() - qrScannedAt.getTime()
  const diffMinutes = diffMs / (60 * 1000)

  const score = 100 - diffMinutes
  return Math.min(100, Math.max(0, Math.round(score * 10) / 10))
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate the quality score for an agent based on their last N interventions.
 * Upserts the result in the QualityScore table and returns the computed score.
 */
export async function calculateQualityScore(
  agentId: string
): Promise<AgentScoreBreakdown> {
  // 1. Fetch the agent to get companyId
  const agent = await db.user.findUnique({
    where: { id: agentId },
    select: { id: true, companyId: true },
  })

  if (!agent || !agent.companyId) {
    return emptyScoreBreakdown()
  }

  // 2. Fetch last N completed interventions with related data
  const interventions = await db.intervention.findMany({
    where: {
      agentId,
      status: 'completed',
      actualStart: { not: null },
    },
    include: {
      checklistItems: true,
      rating: true,
    },
    orderBy: { scheduledStart: 'desc' },
    take: MAX_INTERVENTIONS_FOR_SCORE,
  })

  if (interventions.length === 0) {
    const breakdown = emptyScoreBreakdown()
    breakdown.interventionCount = 0
    await upsertQualityScore(agentId, agent.companyId, breakdown)
    return breakdown
  }

  // 3. Calculate each sub-score

  // --- Punctuality ---
  const punctualityScores = interventions
    .filter((i) => i.scheduledStart && i.actualStart)
    .map((i) =>
      calculatePunctualityScore(i.scheduledStart, i.actualStart!)
    )
  const avgPunctuality =
    punctualityScores.length > 0
      ? punctualityScores.reduce((a, b) => a + b, 0) / punctualityScores.length
      : 75

  // --- Completion ---
  const completionScores = interventions.map((i) => {
    const total = i.checklistItems.length
    const completed = i.checklistItems.filter((item) => item.completed).length
    return calculateCompletionScore(total, completed)
  })
  const avgCompletion =
    completionScores.length > 0
      ? completionScores.reduce((a, b) => a + b, 0) / completionScores.length
      : 75

  // --- Client Rating ---
  const ratedInterventions = interventions.filter((i) => i.rating)
  let avgClientRating: number
  if (ratedInterventions.length > 0) {
    const ratingScores = ratedInterventions.map(
      (i) => (i.rating!.score / 5) * 100
    )
    avgClientRating =
      ratingScores.reduce((a, b) => a + b, 0) / ratingScores.length
  } else {
    avgClientRating = DEFAULT_RATING_SCORE
  }

  // --- Regularity ---
  // Percentage of interventions completed on time (actualEnd <= scheduledEnd)
  const onTimeCount = interventions.filter((i) => {
    if (!i.actualEnd || !i.scheduledEnd) return true // No data = assume on time
    return i.actualEnd <= i.scheduledEnd
  }).length
  const regularityScore = Math.round(
    (onTimeCount / interventions.length) * 100 * 10
  ) / 10

  // --- Reactivity ---
  const reactivityScores = interventions.map((i) =>
    calculateReactivityScore(i.qrScannedAt, i.actualStart)
  )
  const avgReactivity =
    reactivityScores.length > 0
      ? reactivityScores.reduce((a, b) => a + b, 0) / reactivityScores.length
      : 75

  // 4. Calculate weighted overall score
  const overallScore = Math.round(
    avgPunctuality * WEIGHT_PUNCTUALITY +
      avgCompletion * WEIGHT_COMPLETION +
      avgClientRating * WEIGHT_CLIENT_RATING +
      regularityScore * WEIGHT_REGULARITY +
      avgReactivity * WEIGHT_REACTIVITY
  )

  const breakdown: AgentScoreBreakdown = {
    punctualityScore: Math.round(avgPunctuality * 10) / 10,
    completionScore: Math.round(avgCompletion * 10) / 10,
    clientRatingScore: Math.round(avgClientRating * 10) / 10,
    regularityScore: Math.round(regularityScore * 10) / 10,
    reactivityScore: Math.round(avgReactivity * 10) / 10,
    overallScore: Math.round(overallScore * 10) / 10,
    interventionCount: interventions.length,
  }

  // 5. Upsert into DB
  await upsertQualityScore(agentId, agent.companyId, breakdown)

  return breakdown
}

// ============================================================================
// HELPERS
// ============================================================================

function emptyScoreBreakdown(): AgentScoreBreakdown {
  return {
    punctualityScore: 0,
    completionScore: 0,
    clientRatingScore: 0,
    regularityScore: 0,
    reactivityScore: 0,
    overallScore: 0,
    interventionCount: 0,
  }
}

async function upsertQualityScore(
  agentId: string,
  companyId: string,
  breakdown: AgentScoreBreakdown
): Promise<void> {
  const calculatedAt = new Date()

  // Check if a score already exists for this agent today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await db.qualityScore.findFirst({
    where: {
      agentId,
      calculatedAt: { gte: today },
    },
  })

  if (existing) {
    await db.qualityScore.update({
      where: { id: existing.id },
      data: {
        score: breakdown.overallScore,
        punctualityScore: breakdown.punctualityScore,
        completionScore: breakdown.completionScore,
        clientRatingScore: breakdown.clientRatingScore,
        regularityScore: breakdown.regularityScore,
        reactivityScore: breakdown.reactivityScore,
        interventionCount: breakdown.interventionCount,
        calculatedAt,
      },
    })
  } else {
    await db.qualityScore.create({
      data: {
        agentId,
        companyId,
        score: breakdown.overallScore,
        punctualityScore: breakdown.punctualityScore,
        completionScore: breakdown.completionScore,
        clientRatingScore: breakdown.clientRatingScore,
        regularityScore: breakdown.regularityScore,
        reactivityScore: breakdown.reactivityScore,
        interventionCount: breakdown.interventionCount,
        calculatedAt,
      },
    })
  }
}

/**
 * Get the latest quality score for an agent.
 */
export async function getLatestQualityScore(
  agentId: string
): Promise<AgentScoreBreakdown | null> {
  const score = await db.qualityScore.findFirst({
    where: { agentId },
    orderBy: { calculatedAt: 'desc' },
  })

  if (!score) return null

  return {
    punctualityScore: score.punctualityScore,
    completionScore: score.completionScore,
    clientRatingScore: score.clientRatingScore,
    regularityScore: score.regularityScore,
    reactivityScore: score.reactivityScore,
    overallScore: score.score,
    interventionCount: score.interventionCount,
  }
}
