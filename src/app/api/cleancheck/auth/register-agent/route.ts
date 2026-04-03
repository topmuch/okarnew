import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, hashPassword } from '@/lib/auth'

async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Manager role required.' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const { firstName, lastName, email, phone, password } = body

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 },
      )
    }

    if (!user.companyId) {
      return NextResponse.json(
        { success: false, error: 'User is not associated with a company' },
        { status: 400 },
      )
    }

    // Check maxAgents limit
    const company = await db.company.findUnique({ where: { id: user.companyId } })
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 },
      )
    }

    const agentCount = await db.user.count({
      where: { companyId: user.companyId, role: 'agent', isActive: true },
    })

    if (agentCount >= company.maxAgents) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent limit reached (${company.maxAgents}). Upgrade your plan to add more agents.`,
        },
        { status: 403 },
      )
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 409 },
      )
    }

    const newAgent = await db.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        firstName,
        lastName,
        phone,
        role: 'agent',
        companyId: user.companyId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        companyId: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: newAgent }, { status: 201 })
  } catch (error) {
    console.error('Register agent error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
