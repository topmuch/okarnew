/**
 * CleanCheck - Admin Validation Schemas
 */

import { z } from 'zod'

// ============================================================================
// PAGINATION & SEARCH
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const searchSchema = z.object({
  search: z.string().optional().default(''),
})

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

// ============================================================================
// COMPANY SCHEMAS
// ============================================================================

export const listCompaniesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().default(''),
  plan: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'subscriptionTier']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  subscriptionTier: z.enum(['free', 'pro', 'enterprise']).default('free'),
  maxAgents: z.number().int().min(1).max(500).default(3),
  maxInterventionsPerMonth: z.number().int().min(1).max(10000).default(30),
})

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  subscriptionTier: z.enum(['free', 'pro', 'enterprise']).optional(),
  maxAgents: z.number().int().min(1).max(500).optional(),
  maxInterventionsPerMonth: z.number().int().min(1).max(10000).optional(),
})

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().default(''),
  role: z.enum(['manager', 'agent']).optional(),
  companyId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['manager', 'agent']),
})

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
})

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8).max(128),
})

// ============================================================================
// SUBSCRIPTION SCHEMAS
// ============================================================================

export const listSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  tier: z.string().optional(),
})

export const updateSubscriptionSchema = z.object({
  tier: z.enum(['free', 'pro', 'enterprise']).optional(),
  status: z.enum(['active', 'past_due', 'cancelled', 'trialing']).optional(),
  maxAgents: z.number().int().min(1).max(500).optional(),
  maxInterventionsPerMonth: z.number().int().min(1).max(10000).optional(),
})

// ============================================================================
// INVOICE SCHEMAS
// ============================================================================

export const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  companyId: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '12m']).default('30d'),
  companyId: z.string().optional(),
})

export const analyticsTrendQuerySchema = z.object({
  metric: z.enum(['interventions', 'users', 'companies', 'ratings']).default('interventions'),
  period: z.enum(['7d', '30d', '90d', '12m']).default('30d'),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
})

// ============================================================================
// CONFIG SCHEMAS
// ============================================================================

export const batchUpdateConfigSchema = z.object({
  configs: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string().min(1),
      category: z.string().min(1),
    })
  ).min(1).max(50),
})

// ============================================================================
// FEATURE FLAG SCHEMAS
// ============================================================================

export const createFeatureFlagSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().default(''),
  enabled: z.boolean().default(false),
  rolloutPercentage: z.number().int().min(0).max(100).default(100),
})

export const updateFeatureFlagSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).optional(),
})

// ============================================================================
// SUPPORT TICKET SCHEMAS
// ============================================================================

export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional().default(''),
})

export const createTicketSchema = z.object({
  subject: z.string().min(3).max(300),
  description: z.string().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  companyId: z.string().optional(),
  userId: z.string().optional(),
  assignedToId: z.string().optional(),
})

export const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.string().nullable().optional(),
})

export const addTicketMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  isInternal: z.boolean().default(false),
})

// ============================================================================
// AUDIT LOG SCHEMAS
// ============================================================================

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  action: z.string().optional(),
  userId: z.string().optional(),
  companyId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

// ============================================================================
// IMPERSONATION SCHEMAS
// ============================================================================

export const startImpersonateSchema = z.object({
  companyId: z.string().min(1),
})

// ============================================================================
// RATING MODERATION SCHEMAS
// ============================================================================

export const moderateRatingSchema = z.object({
  action: z.enum(['hide', 'show', 'flag']),
  reason: z.string().min(1).max(500).optional(),
})
