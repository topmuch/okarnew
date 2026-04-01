/**
 * OKAR - Mobile Garage Navigation
 * Bottom tab bar for mobile garage dashboard
 * 
 * Design: Dark theme with glassmorphism
 * Touch-friendly with 44px minimum tap targets
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  LayoutDashboard,
  QrCode,
  Wrench,
  Users,
  MoreHorizontal,
  ScanLine,
  Plus,
  TrendingUp,
  Settings,
  Headphones,
  LogOut,
  Car,
  Bell,
  User,
} from 'lucide-react'

interface MobileGarageNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onOpenScanner?: () => void
  onOpenIntervention?: () => void
  onLogout?: () => void
  pendingCount?: number
  userName?: string | null
}

interface TabItem {
  id: string
  label: string
  icon: React.ElementType
  badge?: number
}

const mainTabs: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stock', label: 'Stock QR', icon: QrCode },
  { id: 'chantiers', label: 'Chantiers', icon: Wrench },
  { id: 'clients', label: 'Clients', icon: Users },
]

const moreMenuItems: TabItem[] = [
  { id: 'business', label: 'Business', icon: TrendingUp },
  { id: 'assistance', label: 'Assistance', icon: Headphones },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

export function MobileGarageNav({
  activeTab,
  onTabChange,
  onOpenScanner,
  onOpenIntervention,
  onLogout,
  pendingCount = 0,
  userName,
}: MobileGarageNavProps) {
  const router = useRouter()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const handleTabPress = (tabId: string) => {
    onTabChange(tabId)
    setMoreMenuOpen(false)
  }

  const isMoreActive = moreMenuItems.some(item => item.id === activeTab)

  return (
    <>
      {/* Mobile Header - Compact */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-b border-[#1E293B]">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">OKAR</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative text-[#64748B] hover:text-white hover:bg-[#1E293B] h-9 w-9"
            >
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
              )}
            </Button>

            {/* Quick Scan */}
            <Button
              onClick={onOpenScanner}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-9 px-3"
            >
              <ScanLine className="h-4 w-4 mr-1" />
              <span className="text-sm">Scan</span>
            </Button>
          </div>
        </div>
      </header>

      {/* FAB - Floating Action Button */}
      <button
        onClick={onOpenIntervention}
        className="md:hidden fixed right-4 bottom-24 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6201] to-[#ff8a3d] shadow-lg shadow-[#ff6201]/30 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Nouvelle intervention"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-lg border-t border-[#1E293B] safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl transition-all duration-200",
                  isActive 
                    ? "text-[#3B82F6]" 
                    : "text-[#64748B] active:bg-[#1E293B]"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive && "text-[#3B82F6]")} />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  isActive ? "text-[#3B82F6]" : "text-[#64748B]"
                )}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-[#3B82F6] rounded-full" />
                )}
              </button>
            )
          })}

          {/* More Menu Button */}
          <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl transition-all duration-200",
                  isMoreActive 
                    ? "text-[#3B82F6]" 
                    : "text-[#64748B] active:bg-[#1E293B]"
                )}
              >
                <MoreHorizontal className={cn("h-5 w-5", isMoreActive && "text-[#3B82F6]")} />
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  isMoreActive ? "text-[#3B82F6]" : "text-[#64748B]"
                )}>
                  Plus
                </span>
              </button>
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="bg-[#0F172A] border-[#1E293B] rounded-t-3xl"
            >
              <SheetHeader className="text-left pb-4">
                <SheetTitle className="text-white text-lg">Menu</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-1 pb-6">
                {moreMenuItems.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabPress(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-[#3B82F6] text-white" 
                          : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B] active:bg-[#334155]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}

                {/* Divider */}
                <div className="h-px bg-[#1E293B] my-4" />

                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center">
                    <User className="h-5 w-5 text-[#94A3B8]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{userName || 'Mon Garage'}</p>
                    <p className="text-[#64748B] text-sm">Garage Certifié</p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Safe Area Spacer for iOS */}
      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  )
}

export default MobileGarageNav
