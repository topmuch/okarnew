/**
 * OKAR - BackToHomeButton Component
 * 
 * Bouton universel de retour à l'accueil
 * Design élégant et discret mais visible
 * Style Wahoo Multicolor cohérent avec la landing page
 * 
 * Utilisation :
 * <BackToHomeButton /> // Retour simple
 * <BackToHomeButton label="Retour" /> // Label personnalisé
 * <BackToHomeButton showOnMobile={false} /> // Cacher sur mobile
 */

'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackToHomeButtonProps {
  /** Label du bouton (défaut: "Retour à l'accueil") */
  label?: string
  /** Afficher sur mobile (défaut: true) */
  showOnMobile?: boolean
  /** Classes CSS supplémentaires */
  className?: string
  /** Variante du style */
  variant?: 'default' | 'minimal' | 'floating'
  /** Afficher l'icône de maison au lieu de la flèche */
  showHomeIcon?: boolean
}

export function BackToHomeButton({
  label = "Retour à l'accueil",
  showOnMobile = true,
  className,
  variant = 'default',
  showHomeIcon = false,
}: BackToHomeButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center gap-2 font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2',
    !showOnMobile && 'hidden sm:inline-flex'
  )

  const variantStyles = {
    default: cn(
      baseStyles,
      'px-4 py-2.5 rounded-full',
      'bg-white/90 backdrop-blur-sm border border-gray-200',
      'text-gray-600 hover:text-gray-900',
      'shadow-sm hover:shadow-md',
      'hover:border-orange-200 hover:bg-orange-50/50'
    ),
    minimal: cn(
      baseStyles,
      'px-3 py-2',
      'text-gray-500 hover:text-gray-900',
      'hover:bg-gray-100 rounded-lg'
    ),
    floating: cn(
      baseStyles,
      'px-4 py-3 rounded-full',
      'fixed top-20 left-4 z-40',
      'bg-white/95 backdrop-blur-md border border-gray-100',
      'text-gray-700 hover:text-gray-900',
      'shadow-lg hover:shadow-xl',
      'hover:border-orange-200 hover:bg-orange-50/50'
    ),
  }

  return (
    <Link
      href="/"
      className={cn(variantStyles[variant], className)}
      aria-label="Retour à la page d'accueil"
    >
      {showHomeIcon ? (
        <Home className="h-4 w-4" />
      ) : (
        <ArrowLeft className="h-4 w-4" />
      )}
      <span>{label}</span>
    </Link>
  )
}

export default BackToHomeButton
