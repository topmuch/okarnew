/**
 * OKAR - Business Module
 * Module Business & Revenus pour le garage
 * - Tableau de bord financier
 * - Gamification & Réputation
 * - Profil Public
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Users,
  Eye,
  Star,
  Trophy,
  Award,
  Flame,
  Crown,
  Share2,
  ExternalLink,
  MessageCircle,
  MapPin,
  Calendar,
  Target,
  Zap,
} from 'lucide-react'

interface BusinessModuleProps {
  garageId?: string
}

interface Stats {
  clientsOKAR: number
  caEstime: number
  visites: number
  note: number
  badges: Array<{ type: string; name: string; earnedAt: Date }>
  classement: { position: number; total: number; ville: string }
  subscription: { plan: string; status: string; expiry: Date }
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  top_garage: Trophy,
  reactive: Zap,
  certified_premium: Crown,
  most_reviews: Flame,
  trusted: Award,
}

const BADGE_COLORS: Record<string, string> = {
  top_garage: 'from-amber-400 to-orange-500',
  reactive: 'from-cyan-400 to-blue-500',
  certified_premium: 'from-violet-400 to-purple-500',
  most_reviews: 'from-rose-400 to-pink-500',
  trusted: 'from-emerald-400 to-green-500',
}

export function BusinessModule({ garageId }: BusinessModuleProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les stats depuis l'API
    fetch('/api/garage/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data)
        }
      })
      .finally(() => setLoading(false))
  }, [garageId])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M FCFA`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`
    }
    return `${amount} FCFA`
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`🚗 Découvrez mon garage sur OKAR - Passeport Numérique Automobile!\n\nNote: ${stats?.note}/5 ⭐\n\nConsultez notre profil: https://okar.sn/garage/${garageId}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://okar.sn/garage/${garageId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-okar-dark-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section "Tableau de bord financier" */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-okar-text-primary">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            Tableau de Bord Financier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Clients OKAR */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-okar-text-muted text-xs">Clients OKAR ce mois</p>
                  <p className="text-2xl font-bold text-emerald-300">{stats?.clientsOKAR || 0}</p>
                </div>
              </div>
            </div>

            {/* CA Estimé */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-okar-text-muted text-xs">CA estimé généré</p>
                  <p className="text-2xl font-bold text-amber-300">{formatCurrency(stats?.caEstime || 0)}</p>
                </div>
              </div>
            </div>

            {/* Visites */}
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-okar-text-muted text-xs">Visites du profil</p>
                  <p className="text-2xl font-bold text-blue-300">{stats?.visites || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progression mensuelle */}
          <div className="bg-okar-dark-800/30 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-okar-text-secondary">Objectif mensuel</span>
              <span className="text-sm font-medium text-amber-300">78%</span>
            </div>
            <Progress value={78} className="h-2 bg-okar-dark-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-500" />
            <p className="text-xs text-okar-text-muted mt-2">
              Encore 22% pour atteindre votre objectif de {formatCurrency(3000000)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section "Gamification & Réputation" */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-okar-text-primary">
            <Trophy className="h-5 w-5 text-amber-400" />
            Gamification & Réputation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Note moyenne */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-xl p-5 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-okar-text-muted text-sm mb-1">Note moyenne</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-amber-300">{stats?.note || 0}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.floor(stats?.note || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-okar-text-muted text-xs mt-1">Basé sur 89 avis clients</p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Star className="h-10 w-10 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <p className="text-sm text-okar-text-secondary mb-3">Badges obtenus</p>
            <div className="flex flex-wrap gap-3">
              {stats?.badges?.map((badge, index) => {
                const Icon = BADGE_ICONS[badge.type] || Award
                const gradient = BADGE_COLORS[badge.type] || 'from-gray-400 to-gray-500'
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-20 border border-white/10`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{badge.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Classement */}
          <div className="bg-okar-dark-800/30 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-okar-text-muted text-xs">Position classement local</p>
                  <p className="text-xl font-bold text-white">
                    N°{stats?.classement?.position || 0} {stats?.classement?.ville || 'Dakar'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-okar-text-muted text-xs">Sur</p>
                <p className="text-lg font-semibold text-okar-text-secondary">{stats?.classement?.total || 0} garages</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section "Profil Public" */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-okar-text-primary">
            <ExternalLink className="h-5 w-5 text-pink-400" />
            Profil Public
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aperçu vitrine */}
          <div className="bg-okar-dark-800/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-okar-text-secondary mb-3">Votre vitrine publique</p>
            <div className="flex items-center gap-3 p-3 bg-okar-dark-900/50 rounded-lg border border-white/5">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">Auto Service Plus</p>
                <p className="text-xs text-okar-text-muted">okar.sn/garage/auto-service-plus</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-okar-text-secondary hover:text-white hover:bg-white/10"
                onClick={() => window.open(`/garage/${garageId}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Boutons partage */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={shareOnWhatsApp}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Partager WhatsApp
            </Button>
            <Button
              onClick={shareOnFacebook}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager Facebook
            </Button>
          </div>

          {/* Prochain renouvellement */}
          <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm text-okar-text-secondary">Prochain renouvellement</p>
                <p className="text-sm font-medium text-amber-300">
                  {stats?.subscription?.expiry 
                    ? new Date(stats.subscription.expiry).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Non défini'}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
              {stats?.subscription?.plan || 'Free'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BusinessModule
