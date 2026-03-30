/**
 * OKAR - StatCard Component
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * KPIs avec effet "Néon Soft" - ombres colorées et brillance
 * Fond: Verre semi-transparent avec bordures lumineuses
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'pink' | 'orange' | 'blue' | 'green' | 'purple'
  className?: string
}

// Styles variants avec effets NÉON SOFT
const variantStyles = {
  default: {
    gradient: 'from-slate-500/20 via-slate-400/10 to-slate-500/5',
    icon: 'text-slate-200',
    iconBg: 'bg-slate-400/20',
    glow: 'shadow-[0_8px_30px_rgb(100,116,139,0.3)]',
    glowHover: 'hover:shadow-[0_12px_40px_rgb(100,116,139,0.4)]',
    border: 'border-slate-500/20',
    innerGlow: 'from-slate-300/10',
    accentColor: 'rgb(100,116,139)',
  },
  pink: {
    gradient: 'from-rose-500/25 via-pink-400/15 to-fuchsia-500/10',
    icon: 'text-pink-200',
    iconBg: 'bg-pink-400/25',
    glow: 'shadow-[0_8px_30px_rgb(236,72,153,0.35)]',
    glowHover: 'hover:shadow-[0_12px_40px_rgb(236,72,153,0.5)]',
    border: 'border-pink-400/20',
    innerGlow: 'from-pink-300/10',
    accentColor: 'rgb(236,72,153)',
  },
  orange: {
    gradient: 'from-amber-500/25 via-orange-400/15 to-yellow-500/10',
    icon: 'text-amber-200',
    iconBg: 'bg-amber-400/25',
    glow: 'shadow-[0_8px_30px_rgb(245,158,11,0.35)]',
    glowHover: 'hover:shadow-[0_12px_40px_rgb(245,158,11,0.5)]',
    border: 'border-amber-400/20',
    innerGlow: 'from-amber-300/10',
    accentColor: 'rgb(245,158,11)',
  },
  blue: {
    gradient: 'from-cyan-500/25 via-blue-400/15 to-sky-500/10',
    icon: 'text-cyan-200',
    iconBg: 'bg-cyan-400/25',
    glow: 'shadow-[0_8px_30px_rgb(6,182,212,0.35)]',
    glowHover: 'hover:shadow-[0_12px_40px_rgb(6,182,212,0.5)]',
    border: 'border-cyan-400/20',
    innerGlow: 'from-cyan-300/10',
    accentColor: 'rgb(6,182,212)',
  },
  green: {
    gradient: 'from-emerald-500/25 via-green-400/15 to-teal-500/10',
    icon: 'text-emerald-200',
    iconBg: 'bg-emerald-400/25',
    glow: 'shadow-[0_8px_30px_rgb(16,185,129,0.35)]',
    glowHover: 'hover:shadow-[0_12px_40px_rgb(16,185,129,0.5)]',
    border: 'border-emerald-400/20',
    innerGlow: 'from-emerald-300/10',
    accentColor: 'rgb(16,185,129)',
  },
  purple: {
    gradient: 'from-violet-500/25 via-purple-400/15 to-fuchsia-500/10',
    icon: 'text-violet-200',
    iconBg: 'bg-violet-400/25',
    glow: 'shadow-[0_8px_30px_rgb(139,92,246,0.35)]',
    glowHover: 'hover:shadow-[0_12px_40px_rgb(139,92,246,0.5)]',
    border: 'border-violet-400/20',
    innerGlow: 'from-violet-300/10',
    accentColor: 'rgb(139,92,246)',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn(
      'relative overflow-hidden',
      // Fond verre semi-transparent
      'bg-gradient-to-br backdrop-blur-xl',
      styles.gradient,
      // Bordure lumineuse fine
      'border',
      styles.border,
      'rounded-2xl',
      // Effet NÉON SOFT - ombre colorée
      styles.glow,
      styles.glowHover,
      // Transitions fluides
      'transition-all duration-500 ease-out',
      'hover:-translate-y-1',
      className
    )}>
      {/* Inner Glow - lueur intérieure haute */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-b pointer-events-none',
        styles.innerGlow,
        'to-transparent h-1/2 opacity-60'
      )} />
      
      {/* Shine effect - reflet subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
      
      {/* Border glow effect */}
      <div className={cn(
        'absolute inset-0 rounded-2xl pointer-events-none',
        'border border-white/5'
      )} />

      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            {/* Titre - Gris clair */}
            <p className="text-[#CBD5E1] text-sm font-medium tracking-wide uppercase">
              {title}
            </p>
            
            {/* Valeur - Blanc pur pour contraste maximal */}
            <p className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            </p>
            
            {/* Sous-titre */}
            {subtitle && (
              <p className="text-[#94A3B8] text-xs font-medium">{subtitle}</p>
            )}
            
            {/* Trend badge */}
            {trend && (
              <div className={cn(
                'inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full',
                'backdrop-blur-sm border',
                trend.isPositive 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          {/* Icône avec fond lumineux */}
          <div className={cn(
            'relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl',
            styles.iconBg,
            'backdrop-blur-sm border border-white/10',
            'shadow-lg'
          )}>
            {icon}
            
            {/* Mini glow sous l'icône */}
            <div className={cn(
              'absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full blur-md opacity-50',
              styles.iconBg
            )} />
          </div>
        </div>
      </CardContent>
      
      {/* Bottom accent line - ligne colorée en bas */}
      <div className={cn(
        'absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30',
        styles.icon.replace('text-', 'text-').replace('200', '400')
      )} />
    </Card>
  )
}

export default StatCard
