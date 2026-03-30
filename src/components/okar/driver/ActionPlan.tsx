/**
 * OKAR - Action Plan
 * 
 * Affiche le plan d'action pour améliorer le score de revente
 * - 3 catégories: Critique, Recommandé, Points forts
 * - Icônes et couleurs par type
 * - Progress bars pour les impacts
 */

'use client'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Wrench,
  Shield,
  FileCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react'

interface ActionPlanProps {
  actionItems: Array<{
    id: string
    category: 'critical' | 'recommended' | 'strength'
    title: string
    description: string
    impact: number
    action?: string
    deadline?: string
  }>
  compact?: boolean
}

// Icône selon le type d'action
function getActionIcon(id: string): React.ReactNode {
  if (id.includes('ct_')) return <FileCheck className="h-4 w-4" />
  if (id.includes('insurance')) return <Shield className="h-4 w-4" />
  if (id.includes('oil')) return <Wrench className="h-4 w-4" />
  if (id.includes('accident')) return <AlertTriangle className="h-4 w-4" />
  if (id.includes('docs')) return <FileCheck className="h-4 w-4" />
  return <Zap className="h-4 w-4" />
}

// Composant pour une action individuelle
function ActionItem({ 
  item, 
  compact = false 
}: { 
  item: {
    id: string
    category: 'critical' | 'recommended' | 'strength'
    title: string
    description: string
    impact: number
    action?: string
    deadline?: string
  }
  compact?: boolean
}) {
  const styles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      impactBg: 'bg-red-100',
      impactText: 'text-red-700'
    },
    recommended: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      impactBg: 'bg-orange-100',
      impactText: 'text-orange-700'
    },
    strength: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      impactBg: 'bg-green-100',
      impactText: 'text-green-700'
    }
  }
  
  const style = styles[item.category]
  
  if (compact) {
    return (
      <div className={`flex items-center justify-between p-2 rounded-lg ${style.bg}`}>
        <div className="flex items-center gap-2">
          {style.icon}
          <span className="text-sm text-gray-700">{item.title}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.impactBg} ${style.impactText}`}>
          {item.impact > 0 ? '+' : ''}{item.impact} pts
        </span>
      </div>
    )
  }
  
  return (
    <div className={`p-4 rounded-xl border ${style.border} ${style.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {style.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${style.impactBg} ${style.impactText}`}>
              {item.impact > 0 ? '+' : ''}{item.impact} pts
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
          
          {/* Deadline ou Action */}
          <div className="flex items-center gap-2">
            {item.deadline && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {item.deadline}
              </span>
            )}
            
            {item.action && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
              >
                {item.action}
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Icône XCircle pour critical
function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function ActionPlan({ actionItems, compact = false }: ActionPlanProps) {
  // Séparer par catégorie
  const criticalItems = actionItems.filter(a => a.category === 'critical')
  const recommendedItems = actionItems.filter(a => a.category === 'recommended')
  const strengthItems = actionItems.filter(a => a.category === 'strength')
  
  return (
    <div className="space-y-4">
      {/* Actions Critiques */}
      {criticalItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-red-700">Actions Critiques</h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {criticalItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {criticalItems.map(item => (
              <ActionItem key={item.id} item={item} compact={compact} />
            ))}
          </div>
        </div>
      )}
      
      {/* Actions Recommandées */}
      {recommendedItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h3 className="font-semibold text-orange-700">Actions Recommandées</h3>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {recommendedItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {recommendedItems.map(item => (
              <ActionItem key={item.id} item={item} compact={compact} />
            ))}
          </div>
        </div>
      )}
      
      {/* Points Forts */}
      {strengthItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold text-green-700">Points Forts</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {strengthItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {strengthItems.map(item => (
              <ActionItem key={item.id} item={item} compact={compact} />
            ))}
          </div>
        </div>
      )}
      
      {/* Message si vide */}
      {actionItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="font-medium">Parfait !</p>
          <p className="text-sm">Aucune action nécessaire</p>
        </div>
      )}
    </div>
  )
}
