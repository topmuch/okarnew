import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import { addTicketMessageSchema } from '@/lib/admin/validation'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

type RouteContext = { params: Promise<{ id: string }> }

// In-memory support ticket store (shared with support-tickets/route.ts)
interface TicketMessage {
  id: string
  content: string
  isInternal: boolean
  authorId: string
  createdAt: string
}

interface Ticket {
  id: string
  subject: string
  description: string
  priority: string
  status: string
  companyId: string | null
  userId: string | null
  assignedToId: string | null
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}

const getTickets = (): Map<string, Ticket> => {
  if (!(globalThis as Record<string, unknown>).__supportTickets) {
    (globalThis as Record<string, unknown>).__supportTickets = new Map<string, Ticket>()
  }
  return (globalThis as Record<string, unknown>).__supportTickets as Map<string, Ticket>
}

// POST /api/admin/support-tickets/[id]/messages — Add message to ticket
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { id } = await context.params

    const tickets = getTickets()
    const ticket = tickets.get(id)

    if (!ticket) {
      return error('NOT_FOUND: Ticket not found', 404)
    }

    const body = await request.json()
    const parsed = addTicketMessageSchema.safeParse(body)
    if (!parsed.success) {
      return error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
    }

    const data = parsed.data

    const message: TicketMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      content: data.content,
      isInternal: data.isInternal,
      authorId: admin.id,
      createdAt: new Date().toISOString(),
    }

    ticket.messages.push(message)
    ticket.updatedAt = message.createdAt
    tickets.set(id, ticket)

    await createAuditLog({
      action: 'ticket.message',
      userId: admin.id,
      targetId: id,
      targetType: 'SupportTicket',
      details: {
        messageId: message.id,
        isInternal: data.isInternal,
        contentLength: data.content.length,
      },
      ipAddress: ip,
      userAgent,
    })

    return success(message, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    if (message.startsWith('NOT_FOUND')) return error(message, 404)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}
