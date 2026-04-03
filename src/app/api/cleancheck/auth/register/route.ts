import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, firstName, lastName, email, phone, password } = body

    if (!companyName || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 },
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    // Create company
    const company = await db.company.create({
      data: {
        name: companyName,
        slug: companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') +
          '-' +
          Date.now().toString(36),
        subscriptionTier: 'free',
        maxAgents: 3,
        maxInterventionsPerMonth: 30,
      },
    })

    // Create user (manager)
    const user = await db.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        firstName,
        lastName,
        phone,
        role: 'manager',
        companyId: company.id,
      },
    })

    // Create session
    const token = await createSession(user.id)

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId,
        },
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
