/**
 * CleanCheck - Admin Constants
 * 
 * Central configuration for plans, limits, and system defaults.
 */

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Gratuit',
    price: 0,
    maxAgents: 3,
    maxInterventionsPerMonth: 30,
    maxChecklistTemplates: 2,
    features: ['basic_dashboard', 'qr_scanning', 'client_rating', 'basic_reports', 'email_support'],
  },
  starter: {
    name: 'Starter',
    price: 29,
    maxAgents: 5,
    maxInterventionsPerMonth: 100,
    maxChecklistTemplates: 5,
    features: ['basic_dashboard', 'qr_scanning', 'client_rating', 'quality_scoring', 'advanced_reports', 'email_notifications', 'priority_support'],
  },
  pro: {
    name: 'Pro',
    price: 99,
    maxAgents: 15,
    maxInterventionsPerMonth: 999999,
    maxChecklistTemplates: 999999,
    features: ['advanced_dashboard', 'qr_scanning', 'client_rating', 'quality_scoring', 'advanced_reports', 'analytics', 'email_notifications', 'sms_notifications', 'api_access', 'priority_support'],
  },
  enterprise: {
    name: 'Entreprise',
    price: 0, // Custom pricing
    maxAgents: 999999,
    maxInterventionsPerMonth: 999999,
    maxChecklistTemplates: 999999,
    features: ['advanced_dashboard', 'qr_scanning', 'client_rating', 'quality_scoring', 'advanced_reports', 'analytics', 'email_notifications', 'sms_notifications', 'api_access', 'webhooks', 'sso', 'dedicated_support', 'sla_guarantee'],
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS

export const TICKET_STATUSES = ['open', 'in_progress', 'waiting', 'resolved', 'closed'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

export const AUDIT_ACTIONS = [
  'create', 'update', 'delete', 'login', 'logout',
  'impersonate_start', 'impersonate_end',
  'config_change', 'flag_toggle', 'support_action',
  'moderate', 'export', 'password_reset',
] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const DEFAULT_SCORING_WEIGHTS = {
  punctuality: 0.2,
  completion: 0.2,
  clientRating: 0.3,
  regularity: 0.15,
  reactivity: 0.15,
} as const

export const DEFAULT_QR_VALIDITY_HOURS = 24
export const DEFAULT_GEO_TOLERANCE_METERS = 200
export const DEFAULT_PHOTO_STORAGE_LIMIT_MB = 500
export const DEFAULT_DATA_RETENTION_MONTHS = 13
export const DEFAULT_INVOICE_RETENTION_MONTHS = 24

export const MODERATION_ACTIONS = ['hide', 'show', 'flag'] as const
export type ModerationAction = (typeof MODERATION_ACTIONS)[number]
