/**
 * OKAR - SuperAdmin Sidebar Component
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * Sidebar avec effet de verre distinct et liens actifs lumineux
 */

'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Car,
  Wrench,
  QrCode,
  MapPin,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  Shield,
  LayoutGrid,
  Sparkles,
  Users,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarNavItem {
  icon: React.ElementType
  label: string
  tab: string
}

const navItems: SidebarNavItem[] = [
  {
    icon: BarChart3,
    label: 'Vue d\'ensemble',
    tab: 'overview',
  },
  {
    icon: UserPlus,
    label: 'Demandes',
    tab: 'requests',
  },
  {
    icon: Users,
    label: 'Utilisateurs',
    tab: 'users',
  },
  {
    icon: Wrench,
    label: 'Garages',
    tab: 'garages',
  },
  {
    icon: QrCode,
    label: 'Générer QR',
    tab: 'qrcodes',
  },
  {
    icon: LayoutGrid,
    label: 'Mes QR Codes',
    tab: 'myqrcodes',
  },
  {
    icon: MapPin,
    label: 'Carte',
    tab: 'map',
  },
  {
    icon: Car,
    label: 'Véhicules',
    tab: 'vehicles',
  },
  {
    icon: FileText,
    label: 'Audit',
    tab: 'audit',
  },
  {
    icon: Settings,
    label: 'Paramètres',
    tab: 'settings',
  },
]

interface SuperAdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  pendingCount?: number
  onLogout: () => void
  userName?: string
  userEmail?: string
}

export function SuperAdminSidebar({ 
  activeTab, 
  onTabChange, 
  pendingCount = 0, 
  onLogout,
  userName = 'Admin',
  userEmail = 'admin@okar.com'
}: SuperAdminSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col overflow-hidden">
      {/* Background with Luminous Dark */}
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ff6201]/5 via-transparent to-slate-900/50" />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Gradient glow effect at top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#ff6201]/10 to-transparent" />
      
      {/* Left border accent gradient - more luminous */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#ff6201] via-[#ff8533] to-[#ff6201]/30" />
      
      {/* Right border subtle */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-white/5" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff6201] to-[#ff8533] flex items-center justify-center border border-white/20 shadow-[0_0_25px_rgba(255,98,1,0.4)]">
              <Car className="h-6 w-6 text-white" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center border border-[#ff6201]/40">
                <Sparkles className="h-2.5 w-2.5 text-[#ff8533]" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">OKAR</span>
              <span className="text-[#94A3B8] ml-1 text-sm font-medium">Admin</span>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider px-3 mb-3 flex items-center gap-2">
            <div className="w-1 h-1 bg-[#ff6201] rounded-full shadow-[0_0_6px_rgba(255,98,1,0.5)]" />
            Navigation
          </div>
          
          {navItems.map((item) => {
            const isActive = activeTab === item.tab
            
            return (
              <button
                key={item.tab}
                onClick={() => {
                  console.log('Tab clicked:', item.tab)
                  onTabChange(item.tab)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer group',
                  isActive
                    ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_20px_rgba(255,98,1,0.15)] backdrop-blur-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-[#ff6201] drop-shadow-[0_0_8px_rgba(255,98,1,0.5)]" : "text-[#64748B] group-hover:text-[#94A3B8]",
                )} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.tab === 'requests' && pendingCount > 0 && (
                  <span className="bg-gradient-to-r from-[#ff6201] to-[#ff8533] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,98,1,0.4)] animate-pulse">
                    {pendingCount}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-[#ff6201]/60" />
                )}
              </button>
            )
          })}
        </nav>

        <Separator className="bg-white/5" />

        {/* Stats rapides - Style verre dépoli */}
        <div className="p-4">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-medium">
              <Shield className="h-3.5 w-3.5 text-[#ff6201]" />
              Statut Système
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-[#10B981] rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-[#34D399] text-sm font-medium">Opérationnel</span>
            </div>
          </div>
        </div>

        {/* User info & logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6201] to-[#ff8533] flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(255,98,1,0.3)]">
              <span className="text-white text-sm font-bold">
                {userName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{userName}</p>
              <p className="text-[#64748B] text-xs truncate">{userEmail}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-[#64748B] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default SuperAdminSidebar
