/**
 * OKAR - Value Chart
 * 
 * Graphique d'évolution de la valeur du véhicule dans le temps
 * Utilise Recharts pour un rendu performant
 */

'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface ValueChartProps {
  data: Array<{
    date: Date | string
    value: number
    reason?: string | null
  }>
  height?: number
  showLegend?: boolean
}

// Formate un montant en FCFA
function formatFCFA(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K'
  }
  return amount.toString()
}

// Formate une date
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

// Tooltip personnalisé
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; payload: { reason?: string } }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  
  const value = payload[0].value
  const reason = payload[0].payload.reason
  
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-green-600">
        {formatFCFA(value)} FCFA
      </p>
      {reason && (
        <p className="text-xs text-gray-400 mt-1">{reason}</p>
      )}
    </div>
  )
}

export function ValueChart({ data, height = 200, showLegend = true }: ValueChartProps) {
  // Formater les données pour le graphique
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: formatDate(item.date),
      value: item.value,
      reason: item.reason
    }))
  
  // Calculer la tendance
  const firstValue = chartData[0]?.value || 0
  const lastValue = chartData[chartData.length - 1]?.value || 0
  const trend = lastValue - firstValue
  const trendPercent = firstValue > 0 ? ((trend / firstValue) * 100).toFixed(1) : '0'
  
  // Valeurs min/max pour l'axe Y
  const values = chartData.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.1
  
  return (
    <div className="w-full">
      {/* Légende */}
      {showLegend && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Évolution de la valeur</span>
          </div>
          
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{trend > 0 ? '+' : ''}{trendPercent}%</span>
            </div>
          )}
        </div>
      )}
      
      {/* Graphique */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dy={10}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={formatFCFA}
              domain={[minValue - padding, maxValue + padding]}
              width={50}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorValue)"
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Message si pas de données */}
      {chartData.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}
