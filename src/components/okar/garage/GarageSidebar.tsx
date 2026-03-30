/**
 * OKAR - Garage Sidebar "Clean Focus"
 * 
 * Design épuré pour outils B2B à haute fréquence
 * - Palette uniforme (fond sombre, accents colorés réservés aux états)
 * - Navigation claire et fonctionnelle
 * - Pas de dégradés arc-en-ciel
 */

'use client'

import { useAuth } from '@/context/AuthProvider'
import {
  Car,
  LayoutDashboard,
  TrendingUp,
  QrCode,
  Wrench,
  Users,
  Settings,
  LogOut,
  Star,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GarageSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  badge?: string | number
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chantiers', label: 'Chantiers', icon: Wrench, badge: 3 },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'stock', label: 'Stock QR', icon: QrCode },
  { id: 'business', label: 'Business', icon: TrendingUp },
]

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

export function GarageSidebar({ activeTab, onTabChange }: GarageSidebarProps) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 flex flex-col overflow-hidden bg-[#0F172A] border-r border-[#1E293B]">
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo - Compact */}
        <div className="p-5 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3B82F6] flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white">OKAR</span>
              <span className="block text-[10px] text-[#64748B] font-medium">Garage Pro</span>
            </div>
          </div>
        </div>

        {/* Garage Info - Compact */}
        <div className="px-4 py-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#334155] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'G'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Mon Garage'}
              </p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-[#FBBF24] text-[#FBBF24]" />
                <span className="text-xs text-[#64748B]">4.8 • Certifié</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Principale */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider px-3 mb-3">
            Menu
          </div>
          
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer',
                  isActive
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-bold",
                    isActive 
                      ? "bg-white/20 text-white"
                      : "bg-[#3B82F6]/20 text-[#60A5FA]"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Navigation Secondaire */}
        <div className="px-3 py-3 border-t border-[#1E293B]">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-[#1E293B] text-white'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* User info & logout */}
        <div className="p-4 border-t border-[#1E293B]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-150"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default GarageSidebar
