/**
 * OKAR - Vehicle Value Card
 * 
 * Affiche la valeur estimée du véhicule ("La Cote OKAR")
 * - Gros chiffre en vert avec animation
 * - Sous-titre avec détails du calcul
 * - Graphique d'évolution de la valeur
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  ChevronRight,
  DollarSign,
  Calendar,
  Gauge,
  Shield
} from 'lucide-react'
import { ValueChart } from './ValueChart'

interface VehicleValueCardProps {
  estimatedValue: number
  valueMessage: string
  valueBonusMessage?: string
  valueBreakdown?: {
    base: number
    mileageDeduction: number
    historyBonus: number
    accidentMalus: number
    alertMalus: number
  }
  valueHistory?: Array<{
    date: Date | string
    value: number
    reason?: string | null
  }>
}

// Formate un montant en FCFA
function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

// Composant de compteur animé
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0
    const endValue = value
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * eased)
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration])
  
  return <span>{formatFCFA(displayValue)}</span>
}

export function VehicleValueCard({
  estimatedValue,
  valueMessage,
  valueBonusMessage,
  valueBreakdown,
  valueHistory
}: VehicleValueCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showChart, setShowChart] = useState(false)
  
  // Déterminer la tendance
  const trend = valueHistory && valueHistory.length >= 2
    ? valueHistory[0].value - valueHistory[1].value
    : 0
  
  return (
    <>
      <Card className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 border-0 shadow-xl rounded-2xl overflow-hidden relative">
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
        
        <CardHeader className="pb-2">
          <CardTitle className="text-white/90 flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5" />
            La Cote OKAR
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Valeur principale */}
          <div className="text-center mb-4">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter value={estimatedValue} />
            </div>
            
            {/* Tendance */}
            {trend !== 0 && (
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                trend > 0 ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-100'
              }`}>
                {trend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    +{formatFCFA(Math.abs(trend))}
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    -{formatFCFA(Math.abs(trend))}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Message */}
          <p className="text-white/80 text-sm text-center mb-3">
            {valueMessage}
          </p>
          
          {/* Bonus message */}
          {valueBonusMessage && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-white text-sm font-medium">
                  {valueBonusMessage}
                </span>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => setShowChart(true)}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Évolution
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => setShowDetails(true)}
            >
              <Info className="h-4 w-4 mr-1" />
              Détails
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal Détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Détail de l'estimation
            </DialogTitle>
            <DialogDescription>
              Comment est calculée la valeur de votre véhicule
            </DialogDescription>
          </DialogHeader>
          
          {valueBreakdown && (
            <div className="space-y-3">
              {/* Valeur de base */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Valeur de base</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatFCFA(valueBreakdown.base)}
                </span>
              </div>
              
              {/* Décote kilométrique */}
              {valueBreakdown.mileageDeduction > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">Décote kilométrage</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    - {formatFCFA(valueBreakdown.mileageDeduction)}
                  </span>
                </div>
              )}
              
              {/* Bonus historique */}
              {valueBreakdown.historyBonus > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Bonus historique certifié</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    + {formatFCFA(valueBreakdown.historyBonus)}
                  </span>
                </div>
              )}
              
              {/* Malus accidents */}
              {valueBreakdown.accidentMalus > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700">Malus accidents</span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    - {formatFCFA(valueBreakdown.accidentMalus)}
                  </span>
                </div>
              )}
              
              {/* Malus alertes */}
              {valueBreakdown.alertMalus > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-700">Malus alertes</span>
                  </div>
                  <span className="font-semibold text-yellow-700">
                    - {formatFCFA(valueBreakdown.alertMalus)}
                  </span>
                </div>
              )}
              
              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <span className="text-white font-medium">Valeur estimée OKAR</span>
                  <span className="text-white font-bold text-lg">
                    {formatFCFA(estimatedValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal Graphique */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Évolution de la valeur
            </DialogTitle>
            <DialogDescription>
              Historique de la valeur estimée de votre véhicule
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-64">
            {valueHistory && valueHistory.length > 0 ? (
              <ValueChart data={valueHistory} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucun historique disponible
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Animation shimmer */}
      <style jsx global>{`
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </>
  )
}
