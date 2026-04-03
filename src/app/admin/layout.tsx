'use client'

import { AdminLayout } from '@/components/admin-layout'

const superAdminUser = {
  id: 'superadmin-1',
  email: 'superadmin@cleancheck.fr',
  firstName: 'Super',
  lastName: 'Admin',
  role: 'superadmin',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout user={superAdminUser}>{children}</AdminLayout>
}
