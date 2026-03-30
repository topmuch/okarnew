/**
 * OKAR - Driver Sidebar Component
 * Sidebar de navigation pour le dashboard conducteur
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Car,
  Clock,
  CheckCircle,
  Zap,
  Share2,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Home,
  ChevronRight,
  BarChart3
} from 'lucide-react'

interface DriverSidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
  activeTab: string
  onTabChange: (tab: string) => void
  pendingCount: number
  alertCount: number
  onLogout: () => Promise<void>
}

export function DriverSidebar({ 
  user, 
  activeTab, 
  onTabChange, 
  pendingCount, 
  alertCount,
  onLogout 
}: DriverSidebarProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: 'vehicle', label: 'Mon Véhicule', icon: Car },
    { id: 'stats', label: 'Bilan', icon: BarChart3 },
    { id: 'history', label: 'Historique', icon: Clock },
    { 
      id: 'validations', 
      label: 'Validations', 
      icon: CheckCircle, 
      badge: pendingCount > 0 ? pendingCount : undefined 
    },
    { id: 'emergency', label: 'Urgence', icon: Zap },
    { id: 'transfer', label: 'Transfert', icon: Share2 },
    { id: 'report', label: 'Rapport', icon: FileText },
  ]

  const handleLogout = async () => {
    await onLogout()
  }

  return (
    <>
      {/* Header fixe */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              )}
            </Button>

            {/* Menu utilisateur desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full px-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:inline text-gray-700">{user?.name || 'Utilisateur'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuItem onClick={() => router.push('/')}>
                  <Home className="mr-2 h-4 w-4" />
                  Accueil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu mobile */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100">
            <nav className="container mx-auto px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge className={`${
                        activeTab === item.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Navigation desktop en bas (style app mobile) */}
      <nav className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-2">
        <div className="flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-white text-orange-600' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
