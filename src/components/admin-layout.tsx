'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  LifeBuoy,
  ScrollText,
  LogOut,
  Menu,
  Bell,
  Shield,
  ChevronLeft,
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Sociétés', href: '/admin/companies', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Abonnements', href: '/admin/subscriptions', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Configuration', href: '/admin/config', icon: <Settings className="h-5 w-5" /> },
  { label: 'Support', href: '/admin/support', icon: <LifeBuoy className="h-5 w-5" /> },
  { label: 'Audit Logs', href: '/admin/audit', icon: <ScrollText className="h-5 w-5" /> },
]

function SidebarContent({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-violet-700 via-violet-600 to-violet-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
          <Shield className="h-6 w-6 text-white" />
        </div>
        {(!collapsed) && (
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">CleanCheck</h1>
              <Badge className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0">Admin</Badge>
            </div>
            <p className="text-xs text-violet-200">Panneau superadmin</p>
          </div>
        )}
      </div>

      <Separator className="bg-violet-500/30" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-violet-100 hover:bg-white/10 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-violet-300'}`}>
                  {item.icon}
                </span>
                {(!collapsed) && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-4 border-t border-violet-500/30">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm font-semibold text-white">SuperAdmin</p>
            <p className="text-xs text-violet-200 mt-1">Accès complet à la plateforme</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
  user: UserData
  onLogout?: () => void
}

export function AdminLayout({ children, user, onLogout }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      router.replace('/auth/login')
    }
  }

  const displayName = `${user.firstName} ${user.lastName}`
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase()

  const pageTitle = navItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Administration'

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30
          transition-all duration-300
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-violet-50 transition-colors"
        >
          <ChevronLeft className={`h-3 w-3 text-gray-500 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SidebarContent onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* Page title */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User info */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-violet-100 text-violet-700 text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-xs px-1.5 py-0">
                    SuperAdmin
                  </Badge>
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
