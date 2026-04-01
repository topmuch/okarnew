/**
 * OKAR - Mobile Layout Wrapper
 * 
 * Ajoute le padding nécessaire pour la navigation mobile
 * À utiliser autour du contenu principal
 */

'use client'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface MobileLayoutWrapperProps {
  children: React.ReactNode
  className?: string
}

export function MobileLayoutWrapper({ children, className }: MobileLayoutWrapperProps) {
  const isMobile = useIsMobile()

  return (
    <div className={cn(
      'min-h-screen',
      // Padding en bas pour la navigation mobile
      isMobile && 'pb-mobile-nav',
      className
    )}>
      {children}
    </div>
  )
}

export default MobileLayoutWrapper
