/**
 * OKAR - Health Indicator Component
 * Indicateur feu tricolore animé pour la santé du véhicule
 */

'use client'

import { useState, useEffect } from 'react'

interface HealthIndicatorProps {
  status: 'good' | 'warning' | 'critical'
}

export function HealthIndicator({ status }: HealthIndicatorProps) {
  const [pulseActive, setPulseActive] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(prev => !prev)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const lights = [
    { 
      key: 'critical', 
      label: 'Critique',
      bgColor: status === 'critical' ? '#ef4444' : '#374151',
      isActive: status === 'critical',
      glowColor: 'shadow-red-500/50'
    },
    { 
      key: 'warning', 
      label: 'Attention',
      bgColor: status === 'warning' ? '#f97316' : '#374151',
      isActive: status === 'warning',
      glowColor: 'shadow-orange-500/50'
    },
    { 
      key: 'good', 
      label: 'Bon état',
      bgColor: status === 'good' ? '#22c55e' : '#374151',
      isActive: status === 'good',
      glowColor: 'shadow-green-500/50'
    }
  ]

  const statusLabels = {
    good: 'Bon état',
    warning: 'À surveiller',
    critical: 'Critique'
  }

  const statusColors = {
    good: 'text-green-600',
    warning: 'text-orange-600',
    critical: 'text-red-600'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Feu tricolore */}
      <div className="bg-gray-900 rounded-full p-2.5 shadow-xl flex flex-col gap-2">
        {lights.map((light) => (
          <div
            key={light.key}
            className={`relative w-10 h-10 rounded-full transition-all duration-300 ${
              light.isActive 
                ? `shadow-lg ${light.glowColor} ${pulseActive ? 'scale-110' : 'scale-100'}` 
                : ''
            }`}
            style={{ backgroundColor: light.bgColor }}
          >
            {/* Effet de brillance */}
            {light.isActive && (
              <>
                <div 
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, white 0%, transparent 60%)'
                  }}
                />
                {/* Pulse ring */}
                {pulseActive && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ backgroundColor: light.bgColor }}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Label */}
      <div className="text-center mt-1">
        <span className={`text-sm font-semibold ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
    </div>
  )
}
