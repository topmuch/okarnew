'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  Ticket,
  Settings,
  ArrowRight,
  Activity,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface AdminAnalytics {
  totalCompanies: number
  totalUsers: number
  mrr: number
  avgRating: number
  companiesTrend: number
  usersTrend: number
  mrrTrend: number
  ratingTrend: number
}

interface TrendData {
  month: string
  interventions: number
}

interface PlanData {
  name: string
  value: number
  color: string
}

interface AuditLog {
  id: string
  adminName: string
  action: string
  targetType: string
  targetId: string
  timestamp: string
}

const demoAnalytics: AdminAnalytics = {
  totalCompanies: 47,
  totalUsers: 312,
  mrr: 4850,
  avgRating: 4.7,
  companiesTrend: 12,
  usersTrend: 8,
  mrrTrend: 15,
  ratingTrend: 3,
}

const demoTrend: TrendData[] = [
  { month: 'Jan', interventions: 65 },
  { month: 'Fév', interventions: 78 },
  { month: 'Mar', interventions: 90 },
  { month: 'Avr', interventions: 81 },
  { month: 'Mai', interventions: 95 },
  { month: 'Juin', interventions: 110 },
  { month: 'Juil', interventions: 102 },
  { month: 'Août', interventions: 88 },
  { month: 'Sep', interventions: 120 },
  { month: 'Oct', interventions: 135 },
  { month: 'Nov', interventions: 142 },
  { month: 'Déc', interventions: 156 },
]

const demoPlanData: PlanData[] = [
  { name: 'Gratuit', value: 18, color: '#9CA3AF' },
  { name: 'Starter', value: 12, color: '#3B82F6' },
  { name: 'Pro', value: 11, color: '#7C3AED' },
  { name: 'Enterprise', value: 6, color: '#F59E0B' },
]

const demoAuditLogs: AuditLog[] = [
  { id: '1', adminName: 'Super Admin', action: 'company.created', targetType: 'Company', targetId: 'comp-001', timestamp: '2025-01-15T14:30:00Z' },
  { id: '2', adminName: 'Super Admin', action: 'user.role_changed', targetType: 'User', targetId: 'user-012', timestamp: '2025-01-15T13:15:00Z' },
  { id: '3', adminName: 'Super Admin', action: 'subscription.upgraded', targetType: 'Subscription', targetId: 'sub-005', timestamp: '2025-01-15T11:45:00Z' },
  { id: '4', adminName: 'Super Admin', action: 'config.updated', targetType: 'Config', targetId: 'scoring', timestamp: '2025-01-15T10:20:00Z' },
  { id: '5', adminName: 'Super Admin', action: 'company.suspended', targetType: 'Company', targetId: 'comp-003', timestamp: '2025-01-14T16:00:00Z' },
  { id: '6', adminName: 'Super Admin', action: 'user.activated', targetType: 'User', targetId: 'user-007', timestamp: '2025-01-14T14:30:00Z' },
  { id: '7', adminName: 'Super Admin', action: 'ticket.resolved', targetType: 'Ticket', targetId: 'tk-015', timestamp: '2025-01-14T12:00:00Z' },
  { id: '8', adminName: 'Super Admin', action: 'feature_flag.toggled', targetType: 'FeatureFlag', targetId: 'qr_v2', timestamp: '2025-01-14T09:30:00Z' },
  { id: '9', adminName: 'Super Admin', action: 'company.created', targetType: 'Company', targetId: 'comp-000', timestamp: '2025-01-13T17:00:00Z' },
  { id: '10', adminName: 'Super Admin', action: 'user.password_reset', targetType: 'User', targetId: 'user-003', timestamp: '2025-01-13T15:15:00Z' },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAction(action: string): string {
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' → ')
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [trend, setTrend] = useState<TrendData[]>([])
  const [planData, setPlanData] = useState<PlanData[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, trendRes, auditRes] = await Promise.allSettled([
          fetch('/api/admin/analytics'),
          fetch('/api/admin/analytics/trend'),
          fetch('/api/admin/audit-logs'),
        ])

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json()
          setAnalytics(data)
        } else {
          setAnalytics(demoAnalytics)
        }

        if (trendRes.status === 'fulfilled' && trendRes.value.ok) {
          const data = await trendRes.value.json()
          setTrend(data)
        } else {
          setTrend(demoTrend)
        }

        if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
          const data = await auditRes.value.json()
          setAuditLogs(data)
        } else {
          setAuditLogs(demoAuditLogs)
        }

        setPlanData(demoPlanData)
      } catch {
        setAnalytics(demoAnalytics)
        setTrend(demoTrend)
        setPlanData(demoPlanData)
        setAuditLogs(demoAuditLogs)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const kpiCards = [
    {
      label: 'Total Sociétés',
      value: analytics?.totalCompanies ?? '-',
      trend: analytics?.companiesTrend ?? 0,
      icon: Building2,
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Total Utilisateurs',
      value: analytics?.totalUsers ?? '-',
      trend: analytics?.usersTrend ?? 0,
      icon: Users,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'MRR',
      value: analytics?.mrr ? `${analytics.mrr.toLocaleString('fr-FR')} €` : '-',
      trend: analytics?.mrrTrend ?? 0,
      icon: DollarSign,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Note Moyenne',
      value: analytics?.avgRating ? `${analytics.avgRating}/5` : '-',
      trend: analytics?.ratingTrend ?? 0,
      icon: Star,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme CleanCheck</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/companies">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle société
            </Button>
          </Link>
          <Link href="/admin/support">
            <Button variant="outline" className="border-gray-200">
              <Ticket className="h-4 w-4 mr-2" />
              Tickets
            </Button>
          </Link>
          <Link href="/admin/config">
            <Button variant="outline" className="border-gray-200">
              <Settings className="h-4 w-4 mr-2" />
              Config
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.trend >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(kpi.trend)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Intervention Trend */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-500" />
                Tendance des interventions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interventions"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#7C3AED', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Companies by Plan */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-violet-500" />
                Sociétés par forfait
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [`${value} sociétés`, 'Nombre']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span style={{ color: '#374151', fontSize: '13px' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan distribution bar chart */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart className="h-5 w-5 text-violet-500" />
            Distribution des forfaits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {planData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-violet-500" />
              Journal d&apos;audit récent
            </CardTitle>
            <Link href="/admin/audit">
              <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700">
                Voir tout <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead>Date</TableHead>
                  <TableHead>Administrateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type Cible</TableHead>
                  <TableHead>ID Cible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      {log.adminName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-violet-50 text-violet-700 text-xs font-medium">
                        {formatAction(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{log.targetType}</TableCell>
                    <TableCell className="text-sm font-mono text-gray-500">{log.targetId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScrollText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 3H9v7h12V5a2 2 0 0 0-2-2" />
    </svg>
  )
}
