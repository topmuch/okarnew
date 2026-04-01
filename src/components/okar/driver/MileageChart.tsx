/**
 * OKAR - Mileage Chart Component
 * Graphique d'évolution du kilométrage avec détection d'anomalies
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface MileageEntry {
  date: Date | string
  mileage: number
  type: string
}

interface MileageAnomaly {
  date: Date | string
  from: number
  to: number
}

interface MileageChartProps {
  mileageHistory: MileageEntry[]
  anomalies: MileageAnomaly[]
}

export function MileageChart({ mileageHistory, anomalies }: MileageChartProps) {
  // Formater les données pour le graphique
  const chartData = mileageHistory.map((entry) => {
    const hasAnomaly = anomalies.some(
      a => new Date(a.date).getTime() === new Date(entry.date).getTime()
    )
    return {
      date: format(new Date(entry.date), 'MMM yy', { locale: fr }),
      fullDate: format(new Date(entry.date), 'd MMM yyyy', { locale: fr }),
      mileage: entry.mileage,
      type: entry.type,
      hasAnomaly
    }
  })

  // Calculer la tendance
  const averageGrowth = mileageHistory.length > 1 
    ? (mileageHistory[mileageHistory.length - 1].mileage - mileageHistory[0].mileage) / mileageHistory.length
    : 0

  const typeLabels: Record<string, string> = {
    oil_change: 'Vidange',
    major_repair: 'Réparation',
    accident: 'Accident',
    tire_change: 'Pneus',
    battery: 'Batterie',
    inspection: 'Contrôle'
  }

  // Custom dot renderer function
  const renderDot = (props: { cx?: number; cy?: number; payload?: { hasAnomaly?: boolean } }) => {
    const { cx, cy, payload } = props
    if (!cx || !cy) return null
    
    const hasAnomaly = payload?.hasAnomaly
    const radius = hasAnomaly ? 6 : 4
    const fill = hasAnomaly ? '#ef4444' : '#f97316'
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius} 
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        className="transition-all hover:r-8"
      />
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Évolution du Kilométrage
            </CardTitle>
            <CardDescription>
              Historique des relevés kilométriques
            </CardDescription>
          </div>
          {averageGrowth > 0 ? (
            <Badge className="bg-green-100 text-green-700 border-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{Math.round(averageGrowth).toLocaleString()} km/intervention
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600 border-0">
              Tendance stable
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Alerte d'anomalie */}
        {anomalies.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">Anomalie détectée</p>
                <p className="text-sm text-red-600 mt-1">
                  Des incohérences ont été détectées dans le kilométrage. Cela peut indiquer un problème de compteur.
                </p>
                <div className="mt-2 space-y-1">
                  {anomalies.map((anomaly, index) => (
                    <p key={index} className="text-xs text-red-500">
                      {format(new Date(anomaly.date), 'd MMM yyyy', { locale: fr })}: 
                      {anomaly.from.toLocaleString()} km → {anomaly.to.toLocaleString()} km
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graphique */}
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} km`,
                    'Kilométrage'
                  ]}
                  labelFormatter={(_label, payload) => {
                    if (payload && payload[0]?.payload) {
                      const data = payload[0].payload as { fullDate?: string; type?: string }
                      return `${data.fullDate || ''} - ${typeLabels[data.type || ''] || 'Intervention'}`
                    }
                    return ''
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mileage" 
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={renderDot}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#f97316' }}
                />
                {anomalies.map((anomaly, index) => (
                  <ReferenceLine 
                    key={index}
                    x={format(new Date(anomaly.date), 'MMM yy', { locale: fr })}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">
            <p>Pas assez de données pour afficher le graphique</p>
          </div>
        )}

        {/* Légende */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Relevé normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Anomalie</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
