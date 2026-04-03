'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ClipboardList,
  Users,
  Star,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle,
  Calendar,
  BarChart3,
} from 'lucide-react'

interface DashboardStats {
  interventionsToday: number
  inProgress: number
  avgScore: number
  completionRate: number
}

interface RecentIntervention {
  id: string
  clientName: string
  agentName: string
  status: string
  scheduledDate: string
  score: number | null
}

// Demo data for initial display
const demoStats: DashboardStats = {
  interventionsToday: 8,
  inProgress: 3,
  avgScore: 4.6,
  completionRate: 94,
}

const demoInterventions: RecentIntervention[] = [
  { id: '1', clientName: 'Bureau Martin', agentName: 'Sophie L.', status: 'completed', scheduledDate: '2025-01-15', score: 5 },
  { id: '2', clientName: 'Hôtel Riviera', agentName: 'Marc D.', status: 'in_progress', scheduledDate: '2025-01-15', score: null },
  { id: '3', clientName: 'Clinique Santé+', agentName: 'Julie R.', status: 'pending', scheduledDate: '2025-01-16', score: null },
  { id: '4', clientName: 'Restaurant Le Jardin', agentName: 'Sophie L.', status: 'completed', scheduledDate: '2025-01-14', score: 4 },
  { id: '5', clientName: 'Immeuble Tour Eiffel', agentName: 'Marc D.', status: 'overdue', scheduledDate: '2025-01-13', score: null },
]

const demoAlerts = [
  { id: '1', type: 'overdue', message: 'Intervention Hôtel Riviera en retard depuis 2h', time: 'Il y a 2h' },
  { id: '2', type: 'upcoming', message: 'Intervention Clinique Santé+ dans 30 minutes', time: 'Il y a 5min' },
  { id: '3', type: 'low_score', message: 'Score qualité de Marc D. sous la moyenne (3.2/5)', time: 'Hier' },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Terminée', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  in_progress: { label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-100' },
  pending: { label: 'Planifiée', color: 'text-amber-700', bg: 'bg-amber-100' },
  overdue: { label: 'En retard', color: 'text-red-700', bg: 'bg-red-100' },
  cancelled: { label: 'Annulée', color: 'text-gray-700', bg: 'bg-gray-100' },
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [interventions, setInterventions] = useState<RecentIntervention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch('/api/dashboard/stats')
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        } else {
          setStats(demoStats)
        }

        const recentRes = await fetch('/api/dashboard/recent-interventions')
        if (recentRes.ok) {
          const data = await recentRes.json()
          setInterventions(data)
        } else {
          setInterventions(demoInterventions)
        }
      } catch {
        setStats(demoStats)
        setInterventions(demoInterventions)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      label: "Interventions aujourd'hui",
      value: stats?.interventionsToday ?? '-',
      icon: ClipboardList,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'En cours',
      value: stats?.inProgress ?? '-',
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Score moyen',
      value: stats?.avgScore ? `${stats.avgScore}/5` : '-',
      icon: Star,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Taux de complétion',
      value: stats?.completionRate ? `${stats.completionRate}%` : '-',
      icon: TrendingUp,
      gradient: 'from-teal-500 to-teal-600',
      bg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de votre activité</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/interventions/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle intervention
            </Button>
          </Link>
          <Link href="/dashboard/agents">
            <Button variant="outline" className="border-gray-200">
              <Users className="h-4 w-4 mr-2" />
              Ajouter un agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Interventions */}
        <Card className="lg:col-span-2 border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Interventions récentes
              </CardTitle>
              <Link href="/dashboard/interventions">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                  Voir tout <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interventions.slice(0, 5).map((intervention) => {
                const status = statusConfig[intervention.status] || statusConfig.pending
                return (
                  <div key={intervention.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <ClipboardList className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{intervention.clientName}</p>
                        <p className="text-xs text-gray-500">
                          {intervention.agentName} · {intervention.scheduledDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {intervention.score !== null && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-gray-700">{intervention.score}</span>
                        </div>
                      )}
                      <Badge variant="secondary" className={`${status.bg} ${status.color} text-xs font-medium`}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoAlerts.map((alert) => {
                const alertColor = alert.type === 'overdue' ? 'border-l-red-400 bg-red-50' :
                  alert.type === 'low_score' ? 'border-l-amber-400 bg-amber-50' :
                  'border-l-blue-400 bg-blue-50'
                const alertIcon = alert.type === 'overdue' ? 'text-red-500' :
                  alert.type === 'low_score' ? 'text-amber-500' : 'text-blue-500'
                return (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alertColor}`}>
                    <p className="text-sm text-gray-800">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
