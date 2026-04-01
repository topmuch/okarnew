/**
 * OKAR - Mobile Driver Navigation
 * Bottom tab bar for mobile driver dashboard
 * 
 * Design: Light theme with dark accents matching existing design
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
  User,
  Home,
  ChevronRight,
  BarChart3,
  MessageCircle,
  Shield,
  MoreHorizontal,
} from 'lucide-react'

interface MobileDriverNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout?: () => void
  pendingCount?: number
  alertCount?: number
  userName?: string | null
}

interface TabItem {
  id: string
  label: string
  icon: React.ElementType
  badge?: number
}

const mainTabs: TabItem[] = [
  { id: 'vehicle', label: 'Véhicule', icon: Car },
  { id: 'history', label: 'Historique', icon: Clock },
  { id: 'stats', label: 'Bilan', icon: BarChart3 },
  { id: 'more', label: 'Plus', icon: MoreHorizontal },
]

const moreMenuItems: TabItem[] = [
  { id: 'validations', label: 'Validations', icon: CheckCircle },
  { id: 'insurance', label: 'Assurance', icon: Shield },
  { id: 'emergency', label: 'Urgence', icon: Zap },
  { id: 'transfer', label: 'Transfert', icon: Share2 },
  { id: 'report', label: 'Rapport', icon: FileText },
  { id: 'support', label: 'Assistance', icon: MessageCircle },
]

export function MobileDriverNav({
  activeTab,
  onTabChange,
  onLogout,
  pendingCount = 0,
  alertCount = 0,
  userName,
}: MobileDriverNavProps) {
  const router = useRouter()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const handleTabPress = (tabId: string) => {
    if (tabId !== 'more') {
      onTabChange(tabId)
    }
    setMoreMenuOpen(false)
  }

  const isMoreActive = moreMenuItems.some(item => item.id === activeTab)

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100/50">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </button>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative text-gray-600 hover:text-gray-900 h-9 w-9 rounded-full"
            >
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Button>

            {/* Profile */}
            <Button 
              variant="ghost" 
              className="h-9 w-9 rounded-full p-0 bg-gradient-to-br from-orange-500 to-pink-500"
            >
              <span className="text-sm font-bold text-white">
                {userName?.charAt(0) || 'U'}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            const showBadge = tab.id === 'validations' && pendingCount > 0
            const isMore = tab.id === 'more'
            
            // For "More" tab, check if any of the more items are active
            const isCurrentActive = isMore ? isMoreActive : isActive

            if (isMore) {
              return (
                <Sheet key={tab.id} open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={cn(
                        "flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl transition-all duration-200",
                        isMoreActive 
                          ? "text-orange-600" 
                          : "text-gray-500 active:bg-gray-100"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isMoreActive && "text-orange-600")} />
                      <span className={cn(
                        "text-[10px] mt-1 font-medium",
                        isMoreActive ? "text-orange-600" : "text-gray-500"
                      )}>
                        {tab.label}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent 
                    side="bottom" 
                    className="bg-white rounded-t-3xl"
                  >
                    <SheetHeader className="text-left pb-4">
                      <SheetTitle className="text-gray-900 text-lg">Menu</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-1 pb-6">
                      {/* Validation item with badge */}
                      {moreMenuItems.map((item) => {
                        const isItemActive = activeTab === item.id
                        const ItemIcon = item.icon
                        const showItemBadge = item.id === 'validations' && pendingCount > 0
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleTabPress(item.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200",
                              isItemActive 
                                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" 
                                : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <ItemIcon className="h-5 w-5" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {showItemBadge && (
                              <Badge className={cn(
                                "text-xs",
                                isItemActive 
                                  ? "bg-white/20 text-white" 
                                  : "bg-red-100 text-red-700"
                              )}>
                                {pendingCount}
                              </Badge>
                            )}
                            <ChevronRight className={cn(
                              "h-4 w-4",
                              isItemActive ? "text-white/70" : "text-gray-400"
                            )} />
                          </button>
                        )
                      })}

                      {/* Divider */}
                      <div className="h-px bg-gray-200 my-4" />

                      {/* User Info */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {userName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userName || 'Utilisateur'}</p>
                          <p className="text-gray-500 text-sm">Conducteur OKAR</p>
                        </div>
                      </div>

                      {/* Home & Logout */}
                      <button
                        onClick={() => router.push('/')}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
                      >
                        <Home className="h-5 w-5" />
                        <span className="font-medium">Accueil</span>
                      </button>

                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Déconnexion</span>
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              )
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl transition-all duration-200 relative",
                  isCurrentActive 
                    ? "text-orange-600" 
                    : "text-gray-500 active:bg-gray-100"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isCurrentActive && "text-orange-600")} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  isCurrentActive ? "text-orange-600" : "text-gray-500"
                )}>
                  {tab.label}
                </span>
                {isCurrentActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
                )}
              </button>
            )
          })}
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

export default MobileDriverNav
