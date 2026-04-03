import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const logs = [
      {
        id: '1',
        adminName: 'Super Admin',
        action: 'company.created',
        targetType: 'Company',
        targetId: 'comp-001',
        timestamp: '2025-01-15T14:30:00Z',
      },
      {
        id: '2',
        adminName: 'Super Admin',
        action: 'user.role_changed',
        targetType: 'User',
        targetId: 'user-012',
        timestamp: '2025-01-15T13:15:00Z',
      },
      {
        id: '3',
        adminName: 'Super Admin',
        action: 'subscription.upgraded',
        targetType: 'Subscription',
        targetId: 'sub-005',
        timestamp: '2025-01-15T11:45:00Z',
      },
      {
        id: '4',
        adminName: 'Super Admin',
        action: 'config.updated',
        targetType: 'Config',
        targetId: 'scoring',
        timestamp: '2025-01-15T10:20:00Z',
      },
      {
        id: '5',
        adminName: 'Super Admin',
        action: 'company.suspended',
        targetType: 'Company',
        targetId: 'comp-003',
        timestamp: '2025-01-14T16:00:00Z',
      },
      {
        id: '6',
        adminName: 'Super Admin',
        action: 'user.activated',
        targetType: 'User',
        targetId: 'user-007',
        timestamp: '2025-01-14T14:30:00Z',
      },
      {
        id: '7',
        adminName: 'Super Admin',
        action: 'ticket.resolved',
        targetType: 'Ticket',
        targetId: 'tk-015',
        timestamp: '2025-01-14T12:00:00Z',
      },
      {
        id: '8',
        adminName: 'Super Admin',
        action: 'feature_flag.toggled',
        targetType: 'FeatureFlag',
        targetId: 'qr_v2',
        timestamp: '2025-01-14T09:30:00Z',
      },
      {
        id: '9',
        adminName: 'Super Admin',
        action: 'company.created',
        targetType: 'Company',
        targetId: 'comp-000',
        timestamp: '2025-01-13T17:00:00Z',
      },
      {
        id: '10',
        adminName: 'Super Admin',
        action: 'user.password_reset',
        targetType: 'User',
        targetId: 'user-003',
        timestamp: '2025-01-13T15:15:00Z',
      },
    ]

    return NextResponse.json(logs)
  } catch {
    return NextResponse.json([])
  }
}
