'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  Clock,
  Target,
} from 'lucide-react'

interface AgentScore {
  id: string
  name: string
  avatar: string
  totalScore: number
  rank: number
  interventions: number
  breakdown: {
    punctuality: number
    quality: number
    communication: number
    thoroughness: number
    professionalism: number
  }
  trend: 'up' | 'down' | 'stable'
}

const demoScores: AgentScore[] = [
  {
    id: '1', name: 'Sophie Laurent', avatar: 'SL', totalScore: 96, rank: 1, interventions: 47,
    breakdown: { punctuality: 98, quality: 95, communication: 97, thoroughness: 94, professionalism: 96 },
    trend: 'up',
  },
  {
    id: '3', name: 'Julie Renard', avatar: 'JR', totalScore: 91, rank: 2, interventions: 52,
    breakdown: { punctuality: 92, quality: 90, communication: 93, thoroughness: 89, professionalism: 91 },
    trend: 'stable',
  },
  {
    id: '5', name: 'Emma Bernard', avatar: 'EB', totalScore: 88, rank: 3, interventions: 28,
    breakdown: { punctuality: 90, quality: 87, communication: 89, thoroughness: 86, professionalism: 88 },
    trend: 'up',
  },
  {
    id: '2', name: 'Marc Dupont', avatar: 'MD', totalScore: 82, rank: 4, interventions: 35,
    breakdown: { punctuality: 75, quality: 85, communication: 88, thoroughness: 80, professionalism: 82 },
    trend: 'down',
  },
  {
    id: '4', name: 'Pierre Moreau', avatar: 'PM', totalScore: 65, rank: 5, interventions: 12,
    breakdown: { punctuality: 60, quality: 70, communication: 65, thoroughness: 62, professionalism: 68 },
    trend: 'down',
  },
]

function getScoreColor(score: number) {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 75) return 'bg-blue-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getScoreTextColor(score: number) {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 75) return 'text-blue-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-amber-500" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
  if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />
  return <span className="h-6 w-6 flex items-center justify-center text-sm font-bold text-gray-400">{rank}</span>
}

const criteriaLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  punctuality: { label: 'Ponctualité', icon: <Clock className="h-3.5 w-3.5" /> },
  quality: { label: 'Qualité', icon: <Star className="h-3.5 w-3.5" /> },
  communication: { label: 'Communication', icon: <Target className="h-3.5 w-3.5" /> },
  thoroughness: { label: 'Minutie', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  professionalism: { label: 'Professionnalisme', icon: <Award className="h-3.5 w-3.5" /> },
}

export default function ScoresPage() {
  const [period, setPeriod] = useState('month')
  const [loading] = useState(false)

  const sortedScores = [...demoScores].sort((a, b) => a.rank - b.rank)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scores Qualité</h1>
          <p className="text-gray-500 text-sm mt-1">Classement des agents par performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44 h-10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 podium */}
      <div className="grid sm:grid-cols-3 gap-4">
        {sortedScores.slice(0, 3).map((agent, index) => (
          <Card
            key={agent.id}
            className={`border-0 shadow-sm rounded-xl ${index === 0 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-200' : ''}`}
          >
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                {getRankIcon(agent.rank)}
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-700 font-bold">
                {agent.avatar}
              </div>
              <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{agent.interventions} interventions</p>
              <div className="mt-3">
                <span className={`text-3xl font-bold ${getScoreTextColor(agent.totalScore)}`}>
                  {agent.totalScore}
                </span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {agent.trend === 'up' && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" /> +3%
                  </Badge>
                )}
                {agent.trend === 'stable' && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Stable</Badge>
                )}
                {agent.trend === 'down' && (
                  <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> -2%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Détail par agent</h2>
        {sortedScores.map((agent) => (
          <Card key={agent.id} className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6">{getRankIcon(agent.rank)}</div>
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {agent.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.interventions} interventions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreTextColor(agent.totalScore)}`}>{agent.totalScore}</span>
                  <span className="text-sm text-gray-400">/100</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {Object.entries(agent.breakdown).map(([key, value]) => {
                  const criterion = criteriaLabels[key]
                  if (!criterion) return null
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 w-36 shrink-0 text-xs text-gray-600">
                        {criterion.icon}
                        {criterion.label}
                      </div>
                      <div className="flex-1">
                        <Progress value={value} className={`h-2 [&>div]:${getScoreColor(value)}`} />
                      </div>
                      <span className={`text-xs font-semibold w-8 text-right ${getScoreTextColor(value)}`}>
                        {value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
