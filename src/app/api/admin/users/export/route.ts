import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, getClientIp, getUserAgent } from '@/lib/admin/auth'
import { createAuditLog } from '@/lib/admin/audit'
import db from '@/lib/db'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// GET /api/admin/users/export — Export users as CSV
export async function GET(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)

    // Fetch all managers and agents
    const users = await db.user.findMany({
      where: { role: { in: ['manager', 'agent'] } },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        company: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Build CSV
    const header = 'Email,First Name,Last Name,Role,Company,Active,Created At'
    const rows = users.map((u) => {
      const companyName = u.company?.name || ''
      const escaped = (val: string) => `"${val.replace(/"/g, '""')}"`
      return [
        escaped(u.email),
        escaped(u.firstName),
        escaped(u.lastName),
        u.role,
        escaped(companyName),
        u.isActive ? 'Yes' : 'No',
        escaped(u.createdAt.toISOString()),
      ].join(',')
    })

    const csv = [header, ...rows].join('\n')

    await createAuditLog({
      action: 'user.export',
      userId: admin.id,
      details: { totalExported: users.length },
      ipAddress: ip,
      userAgent,
    })

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}
