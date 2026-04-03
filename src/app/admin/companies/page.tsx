'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Search,
  Plus,
  Eye,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  ArrowUpDown,
} from 'lucide-react'

interface Company {
  id: string
  name: string
  slug: string
  subscriptionTier: string
  agentCount: number
  interventionCount: number
  createdAt: string
  isActive: boolean
}

const planConfig: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Gratuit', color: 'text-gray-700', bg: 'bg-gray-100' },
  starter: { label: 'Starter', color: 'text-blue-700', bg: 'bg-blue-100' },
  pro: { label: 'Pro', color: 'text-violet-700', bg: 'bg-violet-100' },
  enterprise: { label: 'Enterprise', color: 'text-amber-700', bg: 'bg-amber-100' },
}

const demoCompanies: Company[] = [
  { id: 'comp-001', name: 'CleanPro Services', slug: 'cleanpro-services', subscriptionTier: 'pro', agentCount: 12, interventionCount: 156, createdAt: '2024-06-15T10:00:00Z', isActive: true },
  { id: 'comp-002', name: 'Nettexpert', slug: 'nettexpert', subscriptionTier: 'enterprise', agentCount: 25, interventionCount: 342, createdAt: '2024-04-20T08:30:00Z', isActive: true },
  { id: 'comp-003', name: 'Propreté Plus', slug: 'proprete-plus', subscriptionTier: 'starter', agentCount: 5, interventionCount: 78, createdAt: '2024-08-10T14:00:00Z', isActive: true },
  { id: 'comp-004', name: 'ÉcoClean', slug: 'ecoclean', subscriptionTier: 'free', agentCount: 2, interventionCount: 15, createdAt: '2024-11-01T09:00:00Z', isActive: true },
  { id: 'comp-005', name: 'MaintenPro', slug: 'maintenpro', subscriptionTier: 'pro', agentCount: 8, interventionCount: 120, createdAt: '2024-07-22T16:00:00Z', isActive: false },
  { id: 'comp-006', name: 'Brillance SAS', slug: 'brillance-sas', subscriptionTier: 'starter', agentCount: 4, interventionCount: 45, createdAt: '2024-09-05T11:30:00Z', isActive: true },
  { id: 'comp-007', name: 'Hygiène Services', slug: 'hygiene-services', subscriptionTier: 'pro', agentCount: 15, interventionCount: 210, createdAt: '2024-03-18T07:45:00Z', isActive: true },
  { id: 'comp-008', name: 'CleanOffice', slug: 'cleanoffice', subscriptionTier: 'enterprise', agentCount: 30, interventionCount: 450, createdAt: '2024-01-10T12:00:00Z', isActive: true },
  { id: 'comp-009', name: 'NettoMan', slug: 'netto-man', subscriptionTier: 'free', agentCount: 1, interventionCount: 8, createdAt: '2024-12-01T10:30:00Z', isActive: true },
  { id: 'comp-010', name: 'ServicesPropres', slug: 'services-propres', subscriptionTier: 'starter', agentCount: 6, interventionCount: 65, createdAt: '2024-10-20T15:15:00Z', isActive: true },
  { id: 'comp-011', name: 'SparkleClean', slug: 'sparkle-clean', subscriptionTier: 'pro', agentCount: 10, interventionCount: 145, createdAt: '2024-05-12T09:00:00Z', isActive: true },
  { id: 'comp-012', name: 'CleanMax', slug: 'cleanmax', subscriptionTier: 'free', agentCount: 2, interventionCount: 20, createdAt: '2024-11-15T13:00:00Z', isActive: false },
]

type SortKey = 'name' | 'createdAt' | 'subscriptionTier'

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [newCompany, setNewCompany] = useState({ name: '', slug: '', tier: 'free' })
  const pageSize = 10

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch('/api/admin/companies')
        if (res.ok) {
          const data = await res.json()
          setCompanies(data)
        } else {
          setCompanies(demoCompanies)
        }
      } catch {
        setCompanies(demoCompanies)
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const filteredCompanies = useMemo(() => {
    let result = [...companies]

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      )
    }

    if (planFilter !== 'all') {
      result = result.filter((c) => c.subscriptionTier === planFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      else if (sortKey === 'subscriptionTier') cmp = a.subscriptionTier.localeCompare(b.subscriptionTier)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [companies, debouncedSearch, planFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filteredCompanies.length / pageSize)
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, planFilter])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleCreateCompany() {
    if (!newCompany.name) return
    const slug = newCompany.slug || newCompany.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const created: Company = {
      id: `comp-${Date.now()}`,
      name: newCompany.name,
      slug,
      subscriptionTier: newCompany.tier,
      agentCount: 0,
      interventionCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    }
    setCompanies((prev) => [created, ...prev])
    setCreateOpen(false)
    setNewCompany({ name: '', slug: '', tier: 'free' })
  }

  function handleToggleSuspend(id: string) {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    )
  }

  function handleDelete(id: string) {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sociétés</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredCompanies.length} sociétés enregistrées</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer une société
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle société</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom de la société</Label>
                <Input
                  placeholder="Ex: CleanPro Services"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (identifiant URL)</Label>
                <Input
                  placeholder="Ex: cleanpro-services"
                  value={newCompany.slug}
                  onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Forfait</Label>
                <Select
                  value={newCompany.tier}
                  onValueChange={(v) => setNewCompany({ ...newCompany, tier: v })}
                >
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleCreateCompany}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filtrer par forfait" />
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

      {/* Table */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-0">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead>
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                      Société <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('subscriptionTier')} className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                      Forfait <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="text-center">Agents</TableHead>
                  <TableHead className="text-center">Interventions</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                      Créée le <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-gray-300" />
                        <p>Aucune société trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCompanies.map((company) => {
                    const plan = planConfig[company.subscriptionTier] || planConfig.free
                    return (
                      <TableRow key={company.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{company.name}</TableCell>
                        <TableCell className="font-mono text-sm text-gray-500">{company.slug}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${plan.bg} ${plan.color} text-xs font-medium`}>
                            {plan.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{company.agentCount}</TableCell>
                        <TableCell className="text-center">{company.interventionCount}</TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={company.isActive ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
                            {company.isActive ? 'Active' : 'Suspendue'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => router.push(`/admin/companies/${company.id}`)}
                            >
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleSuspend(company.id)}
                            >
                              <Ban className={`h-4 w-4 ${company.isActive ? 'text-amber-500' : 'text-emerald-500'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(company.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
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
            Affichage {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredCompanies.length)} sur {filteredCompanies.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="icon"
                  className={`h-8 w-8 ${currentPage === i + 1 ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
