/**
 * OKAR - Mobile Navigation Component
 * 
 * Bottom navigation bar pour les appareils mobiles
 * Design: Glassmorphism avec icônes animées
 * Affiché uniquement sur mobile (< md breakpoint)
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Car,
  Wrench,
  QrCode,
  User,
  Settings,
  FileText,
  Search,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  matchPaths?: string[]
}

const publicNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', href: '/', matchPaths: ['/'] },
  { icon: Search, label: 'Scanner', href: '/search', matchPaths: ['/search'] },
  { icon: FileText, label: 'Blog', href: '/blog', matchPaths: ['/blog'] },
  { icon: User, label: 'Compte', href: '/login', matchPaths: ['/login', '/register'] },
]

export function MobileNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>(publicNavItems)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  // Déterminer les items de navigation selon la page
  useEffect(() => {
    if (!mounted) return
    
    // Dashboard routes
    if (pathname.includes('/dashboard/superadmin')) {
      requestAnimationFrame(() => setNavItems([
        { icon: BarChart3, label: 'Stats', href: '/dashboard/superadmin?tab=overview', matchPaths: ['/dashboard/superadmin'] },
        { icon: User, label: 'Users', href: '/dashboard/superadmin?tab=users', matchPaths: [] },
        { icon: Wrench, label: 'Garages', href: '/dashboard/superadmin?tab=garages', matchPaths: [] },
        { icon: QrCode, label: 'QR', href: '/dashboard/superadmin?tab=qrcodes', matchPaths: [] },
        { icon: Settings, label: 'Plus', href: '/dashboard/superadmin?tab=settings', matchPaths: [] },
      ]))
    } else if (pathname.includes('/dashboard/garage')) {
      requestAnimationFrame(() => setNavItems([
        { icon: Wrench, label: 'Chantiers', href: '/dashboard/garage', matchPaths: ['/dashboard/garage'] },
        { icon: QrCode, label: 'QR Codes', href: '/dashboard/garage#qrcodes', matchPaths: [] },
        { icon: User, label: 'Clients', href: '/dashboard/garage#clients', matchPaths: [] },
        { icon: Settings, label: 'Réglages', href: '/dashboard/garage#settings', matchPaths: [] },
      ]))
    } else if (pathname.includes('/dashboard/driver')) {
      requestAnimationFrame(() => setNavItems([
        { icon: Car, label: 'Véhicule', href: '/dashboard/driver', matchPaths: ['/dashboard/driver'] },
        { icon: QrCode, label: 'QR Code', href: '/dashboard/driver#qrcode', matchPaths: [] },
        { icon: FileText, label: 'Historique', href: '/dashboard/driver#history', matchPaths: [] },
        { icon: Settings, label: 'Réglages', href: '/dashboard/driver#settings', matchPaths: [] },
      ]))
    } else {
      requestAnimationFrame(() => setNavItems(publicNavItems))
    }
  }, [pathname, mounted])

  // Trouver l'index actif
  useEffect(() => {
    if (!mounted || !navItems.length) return
    
    const currentIndex = navItems.findIndex(item => {
      if (item.matchPaths && item.matchPaths.length > 0) {
        return item.matchPaths.some(path => 
          path === '/' ? pathname === '/' : pathname.startsWith(path)
        )
      }
      // Pour les items avec hash, comparer le base path
      const itemBasePath = item.href.split('#')[0].split('?')[0]
      return pathname === itemBasePath || pathname.startsWith(itemBasePath + '/')
    })
    
    if (currentIndex !== -1) {
      requestAnimationFrame(() => setActiveIndex(currentIndex))
    }
  }, [pathname, navItems, mounted])

  // Ne pas afficher sur serveur ou desktop
  if (!mounted) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Navigation bar */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around h-16 px-2 safe-area-pb">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex
            const Icon = item.icon
            
            return (
              <Link
                key={item.href + index}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full',
                  'transition-all duration-200 ease-out',
                  'active:scale-95',
                  isActive ? 'text-[#ff6201]' : 'text-[#64748B]'
                )}
                onClick={() => setActiveIndex(index)}
              >
                {/* Icon container avec animation */}
                <div className={cn(
                  'relative flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-200',
                  isActive && 'bg-[#ff6201]/10'
                )}>
                  <Icon className={cn(
                    'w-5 h-5 transition-all duration-200',
                    isActive && 'scale-110'
                  )} />
                  
                  {/* Indicateur actif */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#ff6201] rounded-full shadow-[0_0_6px_rgba(255,98,1,0.6)]" />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-[10px] font-medium mt-0.5 transition-colors duration-200',
                  isActive ? 'text-[#ff6201]' : 'text-[#64748B]'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default MobileNav
