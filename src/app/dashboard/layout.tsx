'use client'

import { DashboardLayout } from '@/components/dashboard-layout'

// Demo user data - no authentication required
const demoUser = {
  id: 'demo',
  email: 'demo@cleancheck.fr',
  firstName: 'Marie',
  lastName: 'Dupont',
  role: 'manager',
  companyId: 'demo-company',
  company: {
    name: 'CleanPro Services',
    subscriptionTier: 'pro',
  },
}

export default function CleanCheckDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout user={demoUser}>{children}</DashboardLayout>
}
