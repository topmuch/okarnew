/**
 * OKAR - Confidence Score Component
 * 
 * Score de confiance OKAR avec gestion de l'état "Non Évalué"
 * - Nouveau véhicule sans historique = "NON ÉVALUÉ"
 * - Véhicule avec historique partiel = Score provisoire
 * - Véhicule avec historique complet = Score calculé
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, TrendingUp, Info, Clock, AlertCircle, HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ScoreResult } from '@/lib/scoreCalculator'

interface ConfidenceScoreProps {
  // Nouvelle API avec ScoreResult
  scoreResult?: ScoreResult
  // Ancienne API (rétrocompatibilité)
  score?: number
  status?: 'good' | 'warning' | 'critical'
  message?: string
  factors?: Array<{
    name: string
    impact: number
    status: 'good' | 'warning' | 'critical'
  }>
  maintenanceCount?: number
}

export function ConfidenceScore({
  scoreResult,
  // Ancienne API
  score: legacyScore,
  status: legacyStatus,
  message: legacyMessage,
  factors: legacyFactors,
  maintenanceCount: legacyMaintenanceCount,
}: ConfidenceScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // Normaliser les données
  const isLegacyMode = !scoreResult && legacyScore !== undefined
  const finalScore = scoreResult?.score ?? legacyScore ?? null
  const finalStatus = scoreResult?.status ?? (legacyStatus === 'good' ? 'evaluated' : legacyStatus === 'warning' ? 'partial' : 'evaluated')
  const finalMessage = scoreResult?.message ?? legacyMessage ?? ''
  const finalFactors = scoreResult?.factors ?? legacyFactors ?? []
  const displayScore = scoreResult?.displayScore ?? (finalScore !== null ? `${finalScore}` : '—')
  const colorScheme = scoreResult?.color ?? (legacyStatus === 'good' ? 'green' : legacyStatus === 'warning' ? 'orange' : 'red')
  const label = scoreResult?.label ?? ''
  const confidence = scoreResult?.confidence ?? 'medium'

  // Animation du score (uniquement si on a un score numérique)
  useEffect(() => {
    if (!mounted || finalScore === null) return
    
    const duration = 1500
    const steps = 60
    const increment = finalScore / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= finalScore) {
        setAnimatedScore(finalScore)
        clearInterval(interval)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [finalScore, mounted])

  // Calcul du cercle SVG
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  // Couleurs selon l'état
  const statusStyles = {
    evaluated: {
      green: { stroke: '#22c55e', gradient: 'from-green-500 to-emerald-500', text: 'text-green-600', bg: 'from-green-50 to-emerald-50', badge: 'bg-green-100 text-green-700' },
      orange: { stroke: '#f97316', gradient: 'from-orange-500 to-amber-500', text: 'text-orange-600', bg: 'from-orange-50 to-amber-50', badge: 'bg-orange-100 text-orange-700' },
      red: { stroke: '#ef4444', gradient: 'from-red-500 to-rose-500', text: 'text-red-600', bg: 'from-red-50 to-rose-50', badge: 'bg-red-100 text-red-700' },
      gray: { stroke: '#9ca3af', gradient: 'from-gray-400 to-gray-500', text: 'text-gray-500', bg: 'from-gray-50 to-gray-100', badge: 'bg-gray-100 text-gray-600' },
    },
    not_evaluated: {
      gray: { stroke: '#9ca3af', gradient: 'from-gray-300 to-gray-400', text: 'text-gray-400', bg: 'from-gray-50 to-gray-100', badge: 'bg-gray-100 text-gray-500 border border-gray-200' },
    },
    partial: {
      orange: { stroke: '#f97316', gradient: 'from-orange-400 to-amber-500', text: 'text-orange-500', bg: 'from-orange-50 to-amber-50', badge: 'bg-orange-100 text-orange-600 border border-orange-200' },
    },
  }

  const getStyles = () => {
    if (finalStatus === 'not_evaluated') {
      return statusStyles.not_evaluated.gray
    }
    if (finalStatus === 'partial') {
      return statusStyles.partial.orange
    }
    return statusStyles.evaluated[colorScheme as keyof typeof statusStyles.evaluated] || statusStyles.evaluated.gray
  }

  const colors = getStyles()

  // État: NON ÉVALUÉ
  if (finalStatus === 'not_evaluated') {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            Score de Confiance OKAR
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Le score de confiance sera calculé automatiquement après les premières interventions certifiées.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Cercle gris animé */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="transform -rotate-90 w-36 h-36" viewBox="0 0 144 144">
                {/* Cercle de fond */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Cercle en pointillés pour indiquer "en attente" */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#d1d5db"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="10 5"
                  className={mounted ? 'animate-pulse' : ''}
                />
              </svg>
              {/* Icône au centre */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock className="h-8 w-8 text-gray-400 animate-pulse" />
              </div>
            </div>

            {/* Message et facteurs */}
            <div className="flex-1 space-y-4">
              {/* Badge */}
              <Badge className={colors.badge}>
                HISTORIQUE EN CONSTRUCTION
              </Badge>

              <p className="text-gray-600 text-sm">{finalMessage}</p>

              {/* Étapes pour obtenir un score */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Pour obtenir un score:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">1</div>
                    <span>Faites votre première vidange</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">2</div>
                    <span>Validez l'intervention dans l'app</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">3</div>
                    <span>Votre score sera calculé automatiquement</span>
                  </div>
                </div>
              </div>

              {legacyMaintenanceCount !== undefined && legacyMaintenanceCount === 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span>Aucune intervention enregistrée</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // État: Score partiel ou complet
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-500" />
          Score de Confiance OKAR
          {finalStatus === 'partial' && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
              Provisoire
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Le score de confiance est calculé en fonction de la régularité des entretiens, l'état des documents et l'historique du véhicule.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Cercle de progression */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="transform -rotate-90 w-36 h-36" viewBox="0 0 144 144">
              {/* Cercle de fond */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              {/* Cercle de progression */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke={colors.stroke}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: mounted && finalScore !== null ? strokeDashoffset : circumference,
                  transition: 'stroke-dashoffset 1.5s ease-out'
                }}
              />
            </svg>
            {/* Score au centre */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${colors.text}`}>
                {finalStatus === 'partial' ? `${animatedScore}*` : animatedScore}
              </span>
              <span className="text-gray-500 text-sm">/100</span>
            </div>
          </div>

          {/* Facteurs et message */}
          <div className="flex-1 space-y-4">
            {/* Label */}
            {label && (
              <Badge className={colors.badge}>
                {label}
              </Badge>
            )}

            <p className="text-gray-600 text-sm">{finalMessage}</p>

            {/* Facteurs */}
            {finalFactors && finalFactors.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {finalFactors.slice(0, 4).map((factor, index) => {
                  const factorStyle = factor.status === 'good' 
                    ? { bg: 'from-green-50 to-emerald-50', text: 'text-green-600' }
                    : factor.status === 'warning' 
                    ? { bg: 'from-orange-50 to-amber-50', text: 'text-orange-600' }
                    : factor.status === 'critical'
                    ? { bg: 'from-red-50 to-rose-50', text: 'text-red-600' }
                    : { bg: 'from-gray-50 to-gray-100', text: 'text-gray-500' }

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg bg-gradient-to-r ${factorStyle.bg}`}
                    >
                      <span className="text-gray-700 text-sm font-medium">{factor.name}</span>
                      <span className={`text-sm font-bold ${factorStyle.text}`}>
                        {factor.status === 'neutral' ? '—' : (
                          factor.impact > 0 ? `+${factor.impact}` : factor.impact < 0 ? factor.impact : '✓'
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Stats */}
            {legacyMaintenanceCount !== undefined && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span>{legacyMaintenanceCount} interventions enregistrées</span>
                </div>
              </div>
            )}

            {/* Indicateur de confiance */}
            {finalStatus === 'partial' && (
              <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Ce score deviendra plus précis avec plus d'historique</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ConfidenceScore
