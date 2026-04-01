/**
 * OKAR - Garage Dashboard Principal
 * Design Dark Luxury avec accents Or/Rose
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  Users,
  TrendingUp,
  QrCode,
  Scan,
  Wrench,
  Package,
  Star,
  Award,
  Trophy,
  Zap,
  ArrowUpRight,
  Calendar,
  Car,
  Clock,
  CheckCircle2,
  Sparkles,
  Target,
  Flame,
} from 'lucide-react'
import { GarageSidebar } from './GarageSidebar'

// Données mockées
const mockData = {
  revenue: {
    currentMonth: 2450000,
    clientsOkar: 156,
    visits: 234,
    growth: 32.4,
  },
  qrStock: { total: 200, used: 47, remaining: 153 },
  interventions: { today: 8, pending: 3, weekTotal: 42 },
  rating: 4.8,
  badges: ['Top 10 Dakar', '5 Ans', 'Certifié'],
  recentActivity: [
    { id: 1, type: 'vidange', plate: 'DK-409-HN', client: 'Ahmed Fall', time: '09:30', amount: 45000, status: 'validated' },
    { id: 2, type: 'freins', plate: 'DK-687-LG', client: 'Marie Kane', time: '10:15', amount: 125000, status: 'validated' },
    { id: 3, type: 'accident', plate: 'TH-466-PY', client: 'Ousmane Ba', time: '11:45', amount: 350000, status: 'pending' },
  ],
}

export function GarageDashboard() {
  const { user } = useAuth()
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`
  }

  return (
    <div className="min-h-screen bg-okar-dark-900">
      <GarageSidebar />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-okar-text-primary">
              Bonjour, {user?.name?.split(' ')[0] || 'Mécanicien'} 👋
            </h1>
            <p className="text-okar-text-muted mt-1">
              Voici l'activité de votre garage aujourd'hui
            </p>
          </div>
          <div className="px-4 py-2 bg-okar-dark-card/60 backdrop-blur-xl rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-okar-text-muted text-sm">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        {/* Section Revenus */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-okar-text-primary">Revenus Générés</h2>
            <Badge className="bg-amber-400/20 text-amber-300 border-0">Ce mois</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CA Estimé */}
            <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-okar-text-muted text-sm">CA Estimé</p>
                    <p className="text-3xl font-bold text-okar-text-primary mt-1">
                      {formatCurrency(mockData.revenue.currentMonth)} FCFA
                    </p>
                    <div className="flex items-center gap-1 text-sm text-emerald-400 mt-2">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="font-semibold">{mockData.revenue.growth}%</span>
                      <span className="text-okar-text-muted">vs mois dernier</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clients OKAR */}
            <Card className="bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent border-emerald-500/20 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-okar-text-muted text-sm">Clients OKAR</p>
                    <p className="text-3xl font-bold text-okar-text-primary mt-1">{mockData.revenue.clientsOkar}</p>
                    <p className="text-okar-text-muted text-xs mt-2">Ce mois</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visites */}
            <Card className="bg-okar-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-okar-text-muted text-sm">Visites Générées</p>
                    <p className="text-3xl font-bold text-okar-text-primary mt-1">{mockData.revenue.visits}</p>
                    <p className="text-okar-text-muted text-xs mt-2">Retraits inclus</p>
                  </div>
                  <div className="w-14 h-14 bg-okar-dark-700/50 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-okar-text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interventions */}
            <Card className="bg-okar-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-okar-text-muted text-sm">Interventions</p>
                    <p className="text-3xl font-bold text-okar-text-primary mt-1">{mockData.interventions.weekTotal}</p>
                    <p className="text-okar-text-muted text-xs mt-2">Cette semaine</p>
                  </div>
                  <div className="w-14 h-14 bg-okar-dark-700/50 rounded-2xl flex items-center justify-center">
                    <Wrench className="h-7 w-7 text-okar-text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-okar-text-primary mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="group relative p-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Scan className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-bold text-lg">Scanner QR</p>
                  <p className="text-sm text-white/80">Identifiez un véhicule</p>
                </div>
              </div>
            </button>

            <button className="group relative p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <QrCode className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-bold text-lg">Activer Pass</p>
                  <p className="text-sm text-white/80">Nouveau véhicule client</p>
                </div>
              </div>
            </button>

            <button className="group relative p-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Wrench className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-bold text-lg">Intervention</p>
                  <p className="text-sm text-white/80">Enregistrer un travail</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Stock QR + Gamification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stock QR */}
          <Card className="bg-okar-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-okar-text-primary flex items-center gap-2">
                  <Package className="h-5 w-5 text-pink-400" />
                  Mon Stock QR
                </CardTitle>
                <Button variant="outline" size="sm" className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10">
                  Commander plus
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-okar-text-primary">{mockData.qrStock.remaining}</p>
                  <p className="text-okar-text-muted text-sm">codes disponibles</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-okar-text-secondary">{mockData.qrStock.total}</p>
                  <p className="text-okar-text-muted text-sm">total</p>
                </div>
              </div>
              <Progress 
                value={(mockData.qrStock.used / mockData.qrStock.total) * 100} 
                className="h-3 bg-okar-dark-800"
              />
            </CardContent>
          </Card>

          {/* Gamification */}
          <Card className="bg-gradient-to-br from-okar-dark-card/80 to-okar-dark-800/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-3xl" />
            <CardHeader>
              <CardTitle className="text-okar-text-primary flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                Votre Réputation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < Math.floor(mockData.rating) ? 'fill-amber-400 text-amber-400' : 'text-okar-dark-600'}`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-okar-text-primary">{mockData.rating}</span>
                <span className="text-okar-text-muted">/ 5</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {mockData.badges.map((badge, i) => (
                  <Badge
                    key={i}
                    className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {badge}
                  </Badge>
                ))}
              </div>

              {mockData.rating >= 4.5 && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300">Top Garage</p>
                    <p className="text-xs text-okar-text-muted">Vous êtes dans le top 10% OKAR</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activité Récente */}
        <Card className="bg-okar-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-okar-text-primary">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockData.recentActivity.map((activity) => {
                const typeConfig: Record<string, { icon: typeof Sparkles; color: string; bg: string; label: string }> = {
                  vidange: { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Vidange' },
                  freins: { icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Freins' },
                  accident: { icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'Accident' },
                }
                const config = typeConfig[activity.type] || typeConfig.vidange
                const Icon = config.icon
                
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-okar-dark-800/30 hover:bg-okar-dark-800/50 transition-colors">
                    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-okar-text-primary">{activity.plate}</span>
                        <Badge variant="outline" className="text-xs border-white/10 text-okar-text-muted">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-okar-text-muted truncate">{activity.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-okar-text-primary">{(activity.amount / 1000).toFixed(0)}K FCFA</p>
                      <div className="flex items-center gap-1 justify-end">
                        {activity.status === 'validated' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400">Validé</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-xs text-amber-400">En attente</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
