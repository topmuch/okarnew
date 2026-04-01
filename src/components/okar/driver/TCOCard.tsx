/**
 * OKAR - TCO Card (Total Cost of Ownership)
 * 
 * Affiche le coût total de possession du véhicule
 * - Récapitulatif des coûts sur 12 mois
 * - Graphique camembert avec répartition
 * - Comparaison avec le marché
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  BarChart3,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  Info
} from 'lucide-react'

interface TCOCardProps {
  tco: {
    totalCost12Months: number
    totalCostAllTime: number
    averageMonthlyCost: number
    costBreakdown: Array<{
      category: string
      amount: number
      percentage: number
      color: string
    }>
    comparisonPercent: number
  }
}

// Formate un montant en FCFA
function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

// Composant graphique camembert SVG simple
function PieChartSVG({ data, size = 80 }: { data: Array<{ percentage: number; color: string }>; size?: number }) {
  const radius = size / 2 - 5
  const center = size / 2
  
  // Calculer les segments avec reduce pour éviter la mutation
  const segments = data.reduce<Array<{
    path: string
    color: string
    index: number
  }>>((acc, item, index) => {
    // Calculer l'angle de départ basé sur les segments précédents
    const previousAngle = acc.reduce((sum, _, i) => sum + (data[i].percentage / 100) * 360, 0)
    const startAngle = previousAngle - 90 // Start from top
    const angle = (item.percentage / 100) * 360
    const endAngle = startAngle + angle
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    // Calculate points
    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)
    
    // Large arc flag
    const largeArc = angle > 180 ? 1 : 0
    
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    
    return [...acc, { path, color: item.color, index }]
  }, [])
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((segment) => (
        <path
          key={segment.index}
          d={segment.path}
          fill={segment.color}
          className="transition-opacity hover:opacity-80"
        />
      ))}
    </svg>
  )
}

// Composant compteur animé
function AnimatedValue({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setDisplayValue(Math.round(value * eased))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value])
  
  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}

export function TCOCard({ tco }: TCOCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const isSaving = tco.comparisonPercent > 0
  
  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
            <Calculator className="h-5 w-5 text-blue-500" />
            Coût Total
          </CardTitle>
          <CardDescription>
            Vos dépenses automobiles sur 12 mois
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Montant principal */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedValue value={tco.totalCost12Months} suffix=" FCFA" />
              </p>
              <p className="text-sm text-gray-500">
                ~{formatFCFA(Math.round(tco.averageMonthlyCost))}/mois
              </p>
            </div>
            
            {/* Mini graphique */}
            <div className="relative">
              <PieChartSVG data={tco.costBreakdown} size={60} />
              <div className="absolute inset-0 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Comparaison marché */}
          <div className={`p-3 rounded-xl mb-4 ${
            isSaving ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-green-700 font-medium">
                      Vous économisez {Math.abs(tco.comparisonPercent)}%
                    </p>
                    <p className="text-green-600 text-xs">vs moyenne du marché</p>
                  </div>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-red-700 font-medium">
                      Vous dépensez {Math.abs(tco.comparisonPercent)}% de plus
                    </p>
                    <p className="text-red-600 text-xs">vs moyenne du marché</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Répartition */}
          <div className="space-y-2 mb-4">
            {tco.costBreakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 flex-1">{item.category}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatFCFA(item.amount)}
                </span>
                <span className="text-xs text-gray-500 w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
          
          {/* Bouton détails */}
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl"
            onClick={() => setShowDetails(true)}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Voir les détails
          </Button>
        </CardContent>
      </Card>
      
      {/* Modal Détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              Détail des coûts
            </DialogTitle>
            <DialogDescription>
              Analyse complète de vos dépenses automobiles
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Graphique camembert */}
            <div className="flex justify-center py-4">
              <div className="relative">
                <PieChartSVG data={tco.costBreakdown} size={140} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {formatFCFA(tco.totalCost12Months)}
                  </span>
                  <span className="text-xs text-gray-500">sur 12 mois</span>
                </div>
              </div>
            </div>
            
            {/* Légende détaillée */}
            <div className="space-y-2">
              {tco.costBreakdown.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.category}</p>
                    <p className="text-xs text-gray-500">{item.percentage}% du total</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatFCFA(item.amount)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 mb-1">Coût mensuel moyen</p>
                <p className="font-bold text-blue-700">
                  {formatFCFA(Math.round(tco.averageMonthlyCost))}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600 mb-1">Depuis le début</p>
                <p className="font-bold text-purple-700">
                  {formatFCFA(tco.totalCostAllTime)}
                </p>
              </div>
            </div>
            
            {/* Comparaison */}
            <div className={`p-4 rounded-xl ${
              isSaving ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-start gap-3">
                <Info className={`h-5 w-5 mt-0.5 ${isSaving ? 'text-green-500' : 'text-red-500'}`} />
                <div>
                  <p className={`font-medium ${isSaving ? 'text-green-700' : 'text-red-700'}`}>
                    {isSaving ? 'Vous êtes économe !' : 'Attention à vos dépenses'}
                  </p>
                  <p className={`text-sm ${isSaving ? 'text-green-600' : 'text-red-600'}`}>
                    {isSaving 
                      ? `Vous dépensez ${Math.abs(tco.comparisonPercent)}% de moins que la moyenne des propriétaires de ce modèle. Continuez comme ça !`
                      : `Vous dépensez ${Math.abs(tco.comparisonPercent)}% de plus que la moyenne. Vérifiez si des économies sont possibles.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
