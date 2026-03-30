/**
 * OKAR - Resale Score Card
 * 
 * Affiche le score de revente avec une jauge circulaire animée
 * - Score sur 100 avec couleur dynamique
 * - Animation de remplissage progressif
 * - Confettis si score > 90
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Target,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { ActionPlan } from './ActionPlan'

interface ResaleScoreCardProps {
  resaleScore: number
  resaleFactors?: Array<{
    name: string
    impact: number
    status: 'positive' | 'negative' | 'neutral'
  }>
  actionItems?: Array<{
    id: string
    category: 'critical' | 'recommended' | 'strength'
    title: string
    description: string
    impact: number
    action?: string
    deadline?: string
  }>
}

// Couleur selon le score
function getScoreColor(score: number): { bg: string; text: string; gradient: string } {
  if (score >= 80) {
    return {
      bg: 'from-emerald-500 to-green-500',
      text: 'text-green-600',
      gradient: 'text-green-500'
    }
  } else if (score >= 60) {
    return {
      bg: 'from-amber-500 to-yellow-500',
      text: 'text-amber-600',
      gradient: 'text-amber-500'
    }
  } else if (score >= 40) {
    return {
      bg: 'from-orange-500 to-amber-500',
      text: 'text-orange-600',
      gradient: 'text-orange-500'
    }
  } else {
    return {
      bg: 'from-red-500 to-rose-500',
      text: 'text-red-600',
      gradient: 'text-red-500'
    }
  }
}

// Composant jauge circulaire SVG
function CircularGauge({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedScore / 100) * circumference
  const colors = getScoreColor(score)
  
  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setAnimatedScore(Math.round(score * eased))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [score])
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`transition-all duration-300 ${colors.gradient}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="url(#scoreGradient)"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'} />
            <stop offset="100%" stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : score >= 40 ? '#ea580c' : '#dc2626'} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${colors.text}`}>{animatedScore}</span>
        <span className="text-gray-400 text-sm">/ 100</span>
      </div>
    </div>
  )
}

export function ResaleScoreCard({
  resaleScore,
  resaleFactors,
  actionItems
}: ResaleScoreCardProps) {
  const [showFactors, setShowFactors] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const colors = getScoreColor(resaleScore)
  
  // Message selon le score
  const getMessage = (score: number): string => {
    if (score >= 90) return 'Excellent ! Votre véhicule est très vendable'
    if (score >= 80) return 'Très bien ! Bonne facilité de revente'
    if (score >= 70) return 'Bien. Quelques actions recommandées'
    if (score >= 60) return 'Correct. Des améliorations possibles'
    if (score >= 50) return 'Moyen. Plusieurs points à améliorer'
    if (score >= 40) return 'À améliorer. Actions importantes nécessaires'
    return 'Attention. Reprise difficile sans améliorations'
  }
  
  // Compter les actions par catégorie
  const criticalCount = actionItems?.filter(a => a.category === 'critical').length || 0
  const recommendedCount = actionItems?.filter(a => a.category === 'recommended').length || 0
  const strengthCount = actionItems?.filter(a => a.category === 'strength').length || 0
  
  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-purple-500" />
            Score Revente
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Jauge */}
            <CircularGauge score={resaleScore} />
            
            {/* Info */}
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-3">
                {getMessage(resaleScore)}
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                    <XCircle className="h-3 w-3" />
                    {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                  </span>
                )}
                {recommendedCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    {recommendedCount} recommandé{recommendedCount > 1 ? 's' : ''}
                  </span>
                )}
                {strengthCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    {strengthCount} point{strengthCount > 1 ? 's' : ''} fort{strengthCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl"
              onClick={() => setShowFactors(true)}
            >
              <Award className="h-4 w-4 mr-1" />
              Facteurs
            </Button>
            <Button
              size="sm"
              className={`flex-1 rounded-xl bg-gradient-to-r ${colors.bg} text-white border-0`}
              onClick={() => setShowActions(true)}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Booster
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal Facteurs */}
      <Dialog open={showFactors} onOpenChange={setShowFactors}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Facteurs du score
            </DialogTitle>
            <DialogDescription>
              Ce qui influence votre score de revente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {resaleFactors?.map((factor, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  factor.status === 'positive' ? 'bg-green-50' :
                  factor.status === 'negative' ? 'bg-red-50' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {factor.status === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : factor.status === 'negative' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">{factor.name}</span>
                </div>
                <span className={`font-semibold text-sm ${
                  factor.impact > 0 ? 'text-green-600' :
                  factor.impact < 0 ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {factor.impact > 0 ? '+' : ''}{factor.impact} pts
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal Actions */}
      <Dialog open={showActions} onOpenChange={setShowActions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Boostez votre score
            </DialogTitle>
            <DialogDescription>
              Actions pour améliorer votre score de revente
            </DialogDescription>
          </DialogHeader>
          
          {actionItems && <ActionPlan actionItems={actionItems} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
