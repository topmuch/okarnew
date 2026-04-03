'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  Users,
  ClipboardList,
  Star,
  Calendar,
  Shield,
  Ticket,
  Search,
} from 'lucide-react'

interface CompanyDetail {
  id: string
  name: string
  slug: string
  subscriptionTier: string
  createdAt: string
  isActive: boolean
  stats: {
    agents: number
    interventions: number
    clients: number
    avgScore: number
  }
  subscription: {
    status: string
    periodStart: string
    periodEnd: string
    trialEnd: string | null
  }
  users: CompanyUser[]
  interventions: CompanyIntervention[]
  tickets: CompanyTicket[]
}

interface CompanyUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
}

interface CompanyIntervention {
  id: string
  clientName: string
  agentName: string
  status: string
  scheduledStart: string
  score: number | null
}

interface CompanyTicket {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
}

const planConfig: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Gratuit', color: 'text-gray-700', bg: 'bg-gray-100' },
  starter: { label: 'Starter', color: 'text-blue-700', bg: 'bg-blue-100' },
  pro: { label: 'Pro', color: 'text-violet-700', bg: 'bg-violet-100' },
  enterprise: { label: 'Enterprise', color: 'text-amber-700', bg: 'bg-amber-100' },
}

const demoCompany: CompanyDetail = {
  id: 'comp-001',
  name: 'CleanPro Services',
  slug: 'cleanpro-services',
  subscriptionTier: 'pro',
  createdAt: '2024-06-15T10:00:00Z',
  isActive: true,
  stats: { agents: 12, interventions: 156, clients: 48, avgScore: 4.6 },
  subscription: {
    status: 'active',
    periodStart: '2025-01-01T00:00:00Z',
    periodEnd: '2025-12-31T23:59:59Z',
    trialEnd: null,
  },
  users: [
    { id: 'u1', firstName: 'Marie', lastName: 'Dupont', email: 'marie@cleanpro.fr', role: 'manager', isActive: true, lastLoginAt: '2025-01-15T08:30:00Z' },
    { id: 'u2', firstName: 'Sophie', lastName: 'Laurent', email: 'sophie@cleanpro.fr', role: 'agent', isActive: true, lastLoginAt: '2025-01-15T07:45:00Z' },
    { id: 'u3', firstName: 'Marc', lastName: 'Dubois', email: 'marc@cleanpro.fr', role: 'agent', isActive: true, lastLoginAt: '2025-01-14T16:00:00Z' },
    { id: 'u4', firstName: 'Julie', lastName: 'Robert', email: 'julie@cleanpro.fr', role: 'agent', isActive: false, lastLoginAt: '2025-01-10T09:00:00Z' },
    { id: 'u5', firstName: 'Pierre', lastName: 'Martin', email: 'pierre@cleanpro.fr', role: 'agent', isActive: true, lastLoginAt: '2025-01-15T06:30:00Z' },
  ],
  interventions: [
    { id: 'i1', clientName: 'Bureau Martin', agentName: 'Sophie L.', status: 'completed', scheduledStart: '2025-01-15T09:00:00Z', score: 5 },
    { id: 'i2', clientName: 'Hôtel Riviera', agentName: 'Marc D.', status: 'in_progress', scheduledStart: '2025-01-15T14:00:00Z', score: null },
    { id: 'i3', clientName: 'Clinique Santé+', agentName: 'Julie R.', status: 'scheduled', scheduledStart: '2025-01-16T10:00:00Z', score: null },
    { id: 'i4', clientName: 'Restaurant Le Jardin', agentName: 'Sophie L.', status: 'completed', scheduledStart: '2025-01-14T08:00:00Z', score: 4 },
    { id: 'i5', clientName: 'Immeuble Tour Eiffel', agentName: 'Pierre M.', status: 'completed', scheduledStart: '2025-01-13T11:00:00Z', score: 5 },
  ],
  tickets: [
    { id: 'tk-001', subject: 'Problème de connexion QR', status: 'resolved', priority: 'high', createdAt: '2025-01-10T10:00:00Z' },
    { id: 'tk-002', subject: 'Demande de changement de forfait', status: 'open', priority: 'medium', createdAt: '2025-01-14T15:30:00Z' },
    { id: 'tk-003', subject: 'Bug dans les scores', status: 'in_progress', priority: 'high', createdAt: '2025-01-15T09:00:00Z' },
  ],
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Planifiée', color: 'text-blue-700', bg: 'bg-blue-100' },
  in_progress: { label: 'En cours', color: 'text-amber-700', bg: 'bg-amber-100' },
  completed: { label: 'Terminée', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  cancelled: { label: 'Annulée', color: 'text-gray-700', bg: 'bg-gray-100' },
}

const ticketStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Ouvert', color: 'text-blue-700', bg: 'bg-blue-100' },
  in_progress: { label: 'En cours', color: 'text-amber-700', bg: 'bg-amber-100' },
  resolved: { label: 'Résolu', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  closed: { label: 'Fermé', color: 'text-gray-700', bg: 'bg-gray-100' },
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Basse', color: 'text-gray-700', bg: 'bg-gray-100' },
  medium: { label: 'Moyenne', color: 'text-blue-700', bg: 'bg-blue-100' },
  high: { label: 'Haute', color: 'text-amber-700', bg: 'bg-amber-100' },
  critical: { label: 'Critique', color: 'text-red-700', bg: 'bg-red-100' },
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('')

  useEffect(() => {
    async function fetchCompany() {
      try {
        const id = params.id as string
        const res = await fetch(`/api/admin/companies/${id}`)
        if (res.ok) {
          const data = await res.json()
          setCompany(data)
          setSelectedPlan(data.subscriptionTier)
        } else {
          setCompany({ ...demoCompany, id })
          setSelectedPlan(demoCompany.subscriptionTier)
        }
      } catch {
        setCompany({ ...demoCompany, id: params.id as string })
        setSelectedPlan(demoCompany.subscriptionTier)
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [params.id])

  if (loading || !company) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const plan = planConfig[company.subscriptionTier] || planConfig.free
  const filteredUsers = userFilter === 'all' ? company.users : company.users.filter((u) => u.role === userFilter)

  const statsCards = [
    { label: 'Agents', value: company.stats.agents, icon: Users, bg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { label: 'Interventions', value: company.stats.interventions, icon: ClipboardList, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Clients', value: company.stats.clients, icon: Building2, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Score Moyen', value: `${company.stats.avgScore}/5`, icon: Star, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/companies')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <Badge variant="secondary" className={`${plan.bg} ${plan.color} text-xs font-medium`}>
              {plan.label}
            </Badge>
            <Badge variant="secondary" className={company.isActive ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
              {company.isActive ? 'Active' : 'Suspendue'}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Slug : <span className="font-mono">{company.slug}</span> · Créée le {new Date(company.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Management */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" />
            Gestion de l&apos;abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Forfait actuel</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Statut</label>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-sm">
                {company.subscription.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Période</label>
              <p className="text-sm text-gray-600">
                <Calendar className="h-3.5 w-3.5 inline mr-1" />
                {new Date(company.subscription.periodStart).toLocaleDateString('fr-FR')} → {new Date(company.subscription.periodEnd).toLocaleDateString('fr-FR')}
              </p>
              {company.subscription.trialEnd && (
                <p className="text-xs text-gray-500 mt-1">
                  Fin d&apos;essai : {new Date(company.subscription.trialEnd).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white text-sm">
              Sauvegarder les modifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Users, Interventions, Tickets */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="users" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs ({company.users.length})
          </TabsTrigger>
          <TabsTrigger value="interventions" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <ClipboardList className="h-4 w-4 mr-2" />
            Interventions ({company.interventions.length})
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <Ticket className="h-4 w-4 mr-2" />
            Tickets ({company.tickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex gap-2 mb-4">
                {['all', 'manager', 'agent'].map((role) => (
                  <Button
                    key={role}
                    variant={userFilter === role ? 'default' : 'outline'}
                    size="sm"
                    className={userFilter === role ? 'bg-violet-600 hover:bg-violet-700' : ''}
                    onClick={() => setUserFilter(role)}
                  >
                    {role === 'all' ? 'Tous' : role === 'manager' ? 'Gérants' : 'Agents'}
                  </Button>
                ))}
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={
                            user.role === 'manager' ? 'bg-violet-100 text-violet-700 text-xs' : 'bg-blue-100 text-blue-700 text-xs'
                          }>
                            {user.role === 'manager' ? 'Gérant' : 'Agent'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={user.isActive ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead>Client</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.interventions.map((intervention) => {
                      const status = statusConfig[intervention.status] || statusConfig.scheduled
                      return (
                        <TableRow key={intervention.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{intervention.clientName}</TableCell>
                          <TableCell className="text-sm text-gray-500">{intervention.agentName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${status.bg} ${status.color} text-xs font-medium`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(intervention.scheduledStart).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {intervention.score !== null ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-medium">{intervention.score}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead>ID</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Créé le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.tickets.map((ticket) => {
                      const tStatus = ticketStatusConfig[ticket.status] || ticketStatusConfig.open
                      const tPriority = priorityConfig[ticket.priority] || priorityConfig.medium
                      return (
                        <TableRow key={ticket.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/support/${ticket.id}`)}>
                          <TableCell className="font-mono text-sm text-gray-500">{ticket.id}</TableCell>
                          <TableCell className="font-medium text-gray-900">{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${tStatus.bg} ${tStatus.color} text-xs font-medium`}>
                              {tStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${tPriority.bg} ${tPriority.color} text-xs font-medium`}>
                              {tPriority.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
