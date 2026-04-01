/**
 * OKAR - Advertisement Banner Component
 * Displays advertisements in the garage dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, X, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Advertisement {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  position: string
}

interface AdvertisementBannerProps {
  position: 'garage_dashboard_top' | 'garage_dashboard_side'
  className?: string
  onClose?: () => void
}

export function AdvertisementBanner({ 
  position, 
  className,
  onClose 
}: AdvertisementBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetchAds()
  }, [position])

  // Auto-rotate ads every 10 seconds for top position
  useEffect(() => {
    if (position === 'garage_dashboard_top' && ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [ads.length, position])

  const fetchAds = async () => {
    try {
      const res = await fetch(`/api/superadmin/advertisements?position=${position}&activeOnly=true`)
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

  const handleClick = async (ad: Advertisement) => {
    // Track click
    try {
      await fetch('/api/superadmin/advertisements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, clickCount: 'increment' })
      })
    } catch (error) {
      // Ignore tracking errors
    }

    // Open link if exists
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank')
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    onClose?.()
  }

  if (loading || dismissed || ads.length === 0) return null

  const currentAd = ads[currentIndex]

  if (position === 'garage_dashboard_top') {
    return (
      <Card className={cn(
        'relative overflow-hidden bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-pink-500/30',
        className
      )}>
        <CardContent className="p-0">
          <div
            className="flex items-center gap-4 p-4 cursor-pointer"
            onClick={() => handleClick(currentAd)}
          >
            {/* Image */}
            <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
              <img
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
                  <Megaphone className="h-3 w-3 mr-1" />
                  Sponsorisé
                </Badge>
                {ads.length > 1 && (
                  <div className="flex gap-1">
                    {ads.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full transition-colors',
                          idx === currentIndex ? 'bg-pink-400' : 'bg-white/20'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              <h3 className="text-white font-semibold mt-1">{currentAd.title}</h3>
              {currentAd.description && (
                <p className="text-sm text-[#94A3B8] line-clamp-1">{currentAd.description}</p>
              )}
            </div>

            {/* CTA */}
            {currentAd.linkUrl && (
              <div className="flex items-center gap-1 text-pink-400 text-sm">
                En savoir plus
                <ExternalLink className="h-4 w-4" />
              </div>
            )}
          </div>
        </CardContent>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </Card>
    )
  }

  // Side position
  return (
    <Card className={cn(
      'overflow-hidden bg-gradient-to-b from-pink-600/10 to-purple-600/10 border-pink-500/20',
      className
    )}>
      <CardContent className="p-0">
        <div
          className="cursor-pointer"
          onClick={() => handleClick(currentAd)}
        >
          <div className="aspect-video relative">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
              <Megaphone className="h-3 w-3 mr-1" />
              Sponsorisé
            </Badge>
          </div>
          <div className="p-3">
            <h3 className="text-white font-medium text-sm">{currentAd.title}</h3>
            {currentAd.description && (
              <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1">{currentAd.description}</p>
            )}
            {currentAd.linkUrl && (
              <div className="flex items-center gap-1 text-pink-400 text-xs mt-2">
                En savoir plus
                <ExternalLink className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdvertisementBanner
