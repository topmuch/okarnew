import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin/auth'
import db from '@/lib/db'
import { listInvoicesQuerySchema } from '@/lib/admin/validation'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// GET /api/admin/invoices — List invoices with filtering
// Note: Since the schema doesn't have an Invoice model, this returns a placeholder
// structure. In a production system, integrate with Stripe API or a real billing model.
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request)

    const { searchParams } = new URL(request.url)
    const parsed = listInvoicesQuerySchema.safeParse(Object.fromEntries(searchParams))
    if (!parsed.success) {
      return error('Invalid query parameters: ' + parsed.error.issues.map((i) => i.message).join(', '))
    }

    const { page, limit, companyId } = parsed.data

    // Build query based on company filter
    const companyWhere: Record<string, unknown> = {}
    if (companyId) companyWhere.id = companyId

    const companies = await db.company.findMany({
      where: companyWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionTier: true,
        createdAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await db.company.count({ where: companyWhere })

    // Generate invoice placeholders based on subscription tiers
    // In production, this would query Stripe or a real Invoice model
    const invoices = companies.map((company, index) => ({
      id: `inv_placeholder_${company.id}`,
      companyId: company.id,
      companyName: company.name,
      amount: company.subscriptionTier === 'pro' ? 49.99 : company.subscriptionTier === 'enterprise' ? 199.99 : 0,
      currency: 'EUR',
      status: company.subscriptionTier === 'free' ? 'paid' : 'pending',
      tier: company.subscriptionTier,
      description: `${company.subscriptionTier.charAt(0).toUpperCase() + company.subscriptionTier.slice(1)} plan - Monthly subscription`,
      invoiceDate: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() - (index * 30 - 15) * 24 * 60 * 60 * 1000).toISOString(),
    }))

    return success({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      note: 'Invoice data is placeholder. Integrate Stripe API for real invoice data.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.startsWith('UNAUTHORIZED')) return error(message, 401)
    if (message.startsWith('FORBIDDEN')) return error(message, 403)
    console.error('API Error:', message)
    return error('Internal server error', 500)
  }
}
