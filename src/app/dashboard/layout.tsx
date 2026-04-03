'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  role: string
  companyId?: string | null
  avatarUrl?: string | null
  company?: {
    id: string
    name: string
    slug: string
    subscriptionTier: string
  } | null
}

export default function CleanCheckDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('cleancheck_token') : null

    if (!token) {
      router.replace('/auth/login')
      return
    }

    let cancelled = false

    // Verify token via API
    fetch('/api/cleancheck/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        if (data.success && data.data) {
          setUser(data.data)
        } else {
          localStorage.removeItem('cleancheck_token')
          router.replace('/auth/login')
        }
      })
      .catch(() => {
        if (cancelled) return
        router.replace('/auth/login')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [router])

  const handleLogout = async () => {
    localStorage.removeItem('cleancheck_token')
    router.replace('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 border-4 border-emerald-200 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <DashboardLayout user={user} onLogout={handleLogout}>{children}</DashboardLayout>
}
