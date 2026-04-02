/**
 * OKAR - Ads Module for Driver Dashboard
 * Displays advertisements in a carousel/grid format
 * - Fetches ads from API
 * - Tracks clicks
 * - Supports multiple positions
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Loader2,
} from 'lucide-react'

interface Ad {
  id: string
  title: string
  description: string | null
  imageUrl: string
  linkUrl: string | null
  position: string
  priority: number
  clickCount: number
}

interface AdsModuleProps {
  position?: string
  variant?: 'light' | 'dark'
  maxAds?: number
}

export function AdsModule({ 
  position = 'driver_dashboard_top', 
  variant = 'light',
  maxAds = 3 
}: AdsModuleProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchAds()
  }, [position])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/public/ads?position=${position}&limit=${maxAds}`)
      const data = await res.json()
      if (data.success) {
        setAds(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement publicités:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async (ad: Ad) => {
    // Track click
    try {
      await fetch('/api/public/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id })
      })
    } catch (error) {
      console.error('Erreur tracking clic:', error)
    }

    // Open link
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank')
    }
  }

  const nextAd = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length)
  }

  const prevAd = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

  const isDark = variant === 'dark'
  const cardBg = isDark ? 'bg-slate-800/40' : 'bg-gradient-to-r from-orange-50 via-pink-50 to-blue-50'
  const cardBorder = isDark ? 'border-white/10' : 'border-orange-100'

  // Single ad - simple display
  if (ads.length === 1) {
    const ad = ads[0]
    return (
      <Card 
        className={`${cardBg} backdrop-blur-md rounded-2xl border ${cardBorder} overflow-hidden cursor-pointer group`}
        onClick={() => handleClick(ad)}
      >
        <div className="relative h-32 md:h-40">
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">Publicité</span>
            </div>
            <h3 className="text-white font-semibold">{ad.title}</h3>
            {ad.description && (
              <p className="text-white/80 text-sm line-clamp-1">{ad.description}</p>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Multiple ads - carousel
  const currentAd = ads[currentIndex]

  return (
    <div className="relative">
      <Card 
        className={`${cardBg} backdrop-blur-md rounded-2xl border ${cardBorder} overflow-hidden cursor-pointer group`}
        onClick={() => handleClick(currentAd)}
      >
        <div className="relative h-32 md:h-40">
          <img 
            src={currentAd.imageUrl} 
            alt={currentAd.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Navigation arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevAd()
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextAd()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-orange-400 font-medium">Publicité</span>
                </div>
                <h3 className="text-white font-semibold">{currentAd.title}</h3>
                {currentAd.description && (
                  <p className="text-white/80 text-sm line-clamp-1">{currentAd.description}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
            </div>

            {/* Dots indicator */}
            <div className="flex items-center gap-1 mt-2">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(idx)
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdsModule
