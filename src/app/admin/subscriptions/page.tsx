'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  RefreshCw,
  XCircle,
} from 'lucide-react'

interface Subscription {
  id: string
  companyName: string
  companyId: string
  plan: string
  status: string
  periodStart: string
  periodEnd: string
  trialEnd: string | null
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  trialing: { label: 'En essai', color: 'text-blue-700', bg: 'bg-blue-100' },
  active: { label: 'Actif', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  past_due: { label: 'Paiement en retard', color: 'text-amber-700', bg: 'bg-amber-100' },
  canceled: { label: 'Annulé', color: 'text-red-700', bg: 'bg-red-100' },
  unpaid: { label: 'Non payé', color: 'text-red-700', bg: 'bg-red-100' },
  paused: { label: 'En pause', color: 'text-gray-700', bg: 'bg-gray-100' },
}

const planConfig: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Gratuit', color: 'text-gray-700', bg: 'bg-gray-100' },
  starter: { label: 'Starter', color: 'text-blue-700', bg: 'bg-blue-100' },
  pro: { label: 'Pro', color: 'text-violet-700', bg: 'bg-violet-100' },
  enterprise: { label: 'Enterprise', color: 'text-amber-700', bg: 'bg-amber-100' },
}

const demoSubscriptions: Subscription[] = [
  { id: 'sub-001', companyName: 'CleanPro Services', companyId: 'comp-001', plan: 'pro', status: 'active', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-12-31T23:59:59Z', trialEnd: null },
  { id: 'sub-002', companyName: 'Nettexpert', companyId: 'comp-002', plan: 'enterprise', status: 'active', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-12-31T23:59:59Z', trialEnd: null },
  { id: 'sub-003', companyName: 'Propreté Plus', companyId: 'comp-003', plan: 'starter', status: 'trialing', periodStart: '2025-01-10T00:00:00Z', periodEnd: '2025-07-10T23:59:59Z', trialEnd: '2025-02-10T23:59:59Z' },
  { id: 'sub-004', companyName: 'ÉcoClean', companyId: 'comp-004', plan: 'free', status: 'active', periodStart: '2024-11-01T00:00:00Z', periodEnd: '2025-11-01T23:59:59Z', trialEnd: null },
  { id: 'sub-005', companyName: 'MaintenPro', companyId: 'comp-005', plan: 'pro', status: 'past_due', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-06-30T23:59:59Z', trialEnd: null },
  { id: 'sub-006', companyName: 'Brillance SAS', companyId: 'comp-006', plan: 'starter', status: 'active', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-12-31T23:59:59Z', trialEnd: null },
  { id: 'sub-007', companyName: 'Hygiène Services', companyId: 'comp-007', plan: 'pro', status: 'active', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-12-31T23:59:59Z', trialEnd: null },
  { id: 'sub-008', companyName: 'CleanOffice', companyId: 'comp-008', plan: 'enterprise', status: 'active', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2025-12-31T23:59:59Z', trialEnd: null },
  { id: 'sub-009', companyName: 'NettoMan', companyId: 'comp-009', plan: 'free', status: 'active', periodStart: '2024-12-01T00:00:00Z', periodEnd: '2025-12-01T23:59:59Z', trialEnd: null },
  { id: 'sub-010', companyName: 'SparkleClean', companyId: 'comp-011', plan: 'pro', status: 'canceled', periodStart: '2024-05-01T00:00:00Z', periodEnd: '2025-05-01T23:59:59Z', trialEnd: null },
  { id: 'sub-011', companyName: 'CleanMax', companyId: 'comp-012', plan: 'free', status: 'paused', periodStart: '2024-11-15T00:00:00Z', periodEnd: '2025-11-15T23:59:59Z', trialEnd: null },
]

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await fetch('/api/admin/subscriptions')
        if (res.ok) {
          const data = await res.json()
          setSubscriptions(data)
        } else {
          setSubscriptions(demoSubscriptions)
        }
      } catch {
        setSubscriptions(demoSubscriptions)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptions()
  }, [])

  const filtered = useMemo(() => {
    let result = [...subscriptions]
    if (statusFilter !== 'all') result = result.filter((s) => s.status === statusFilter)
    if (planFilter !== 'all') result = result.filter((s) => s.plan === planFilter)
    return result
  }, [subscriptions, statusFilter, planFilter])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => { setCurrentPage(1) }, [statusFilter, planFilter])

  function handleCancel(id: string) {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'canceled' } : s)))
  }

  function handleReactivate(id: string) {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'active' } : s)))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">{filtered.length} abonnements</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="trialing">En essai</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="past_due">Paiement en retard</SelectItem>
                <SelectItem value="canceled">Annulé</SelectItem>
                <SelectItem value="unpaid">Non payé</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Forfait" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les forfaits</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'paused'].map((status) => {
          const count = subscriptions.filter((s) => s.status === status).length
          const config = statusConfig[status]
          return (
            <Card key={status} className="border-0 shadow-sm rounded-xl cursor-pointer" onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <Badge variant="secondary" className={`${config.bg} ${config.color} text-xs font-medium mt-1`}>
                  {config.label}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-0">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead>Société</TableHead>
                  <TableHead>Forfait</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Fin d&apos;essai</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="h-8 w-8 text-gray-300" />
                        <p>Aucun abonnement trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((sub) => {
                    const status = statusConfig[sub.status] || statusConfig.active
                    const plan = planConfig[sub.plan] || planConfig.free
                    return (
                      <TableRow key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <button
                            className="font-medium text-gray-900 hover:text-violet-600 transition-colors"
                            onClick={() => router.push(`/admin/companies/${sub.companyId}`)}
                          >
                            {sub.companyName}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${plan.bg} ${plan.color} text-xs font-medium`}>
                            {plan.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${status.bg} ${status.color} text-xs font-medium`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(sub.periodStart).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(sub.periodEnd).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {sub.trialEnd ? new Date(sub.trialEnd).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/admin/companies/${sub.companyId}`)}>
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                            {(sub.status === 'canceled' || sub.status === 'paused') && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleReactivate(sub.id)} title="Réactiver">
                                <RefreshCw className="h-4 w-4 text-emerald-500" />
                              </Button>
                            )}
                            {sub.status !== 'canceled' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCancel(sub.id)} title="Annuler">
                                <XCircle className="h-4 w-4 text-red-400" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Affichage {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} sur {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" className={`h-8 w-8 ${currentPage === i + 1 ? 'bg-violet-600' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
