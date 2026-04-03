'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  ClipboardList,
  Star,
  Calendar,
  Filter,
  Eye,
} from 'lucide-react'

interface Intervention {
  id: string
  clientName: string
  agentName: string
  status: string
  scheduledDate: string
  score: number | null
  type: string
}

const demoInterventions: Intervention[] = [
  { id: 'INT-001', clientName: 'Bureau Martin & Associés', agentName: 'Sophie Laurent', status: 'completed', scheduledDate: '2025-01-15 09:00', score: 5, type: 'Bureau' },
  { id: 'INT-002', clientName: 'Hôtel Riviera', agentName: 'Marc Dupont', status: 'in_progress', scheduledDate: '2025-01-15 10:30', score: null, type: 'Hôtel' },
  { id: 'INT-003', clientName: 'Clinique Santé+', agentName: 'Julie Renard', status: 'pending', scheduledDate: '2025-01-16 08:00', score: null, type: 'Clinique' },
  { id: 'INT-004', clientName: 'Restaurant Le Jardin', agentName: 'Sophie Laurent', status: 'completed', scheduledDate: '2025-01-14 14:00', score: 4, type: 'Restaurant' },
  { id: 'INT-005', clientName: 'Immeuble Tour Eiffel', agentName: 'Marc Dupont', status: 'overdue', scheduledDate: '2025-01-13 08:00', score: null, type: 'Immeuble' },
  { id: 'INT-006', clientName: 'École Primaire Victor Hugo', agentName: 'Julie Renard', status: 'completed', scheduledDate: '2025-01-13 17:00', score: 5, type: 'École' },
  { id: 'INT-007', clientName: 'Supermarché Central', agentName: 'Sophie Laurent', status: 'cancelled', scheduledDate: '2025-01-12 06:00', score: null, type: 'Commerce' },
  { id: 'INT-008', clientName: 'Salle de Sport FitZone', agentName: 'Marc Dupont', status: 'completed', scheduledDate: '2025-01-11 21:00', score: 4, type: 'Salle de sport' },
  { id: 'INT-009', clientName: 'Banque Nationale', agentName: 'Julie Renard', status: 'pending', scheduledDate: '2025-01-17 07:00', score: null, type: 'Bureau' },
  { id: 'INT-010', clientName: 'Résidence Les Pins', agentName: 'Sophie Laurent', status: 'completed', scheduledDate: '2025-01-10 10:00', score: 5, type: 'Résidence' },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Terminée', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  in_progress: { label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-100' },
  pending: { label: 'Planifiée', color: 'text-amber-700', bg: 'bg-amber-100' },
  overdue: { label: 'En retard', color: 'text-red-700', bg: 'bg-red-100' },
  cancelled: { label: 'Annulée', color: 'text-gray-600', bg: 'bg-gray-100' },
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    async function fetchInterventions() {
      try {
        const res = await fetch('/api/interventions')
        if (res.ok) {
          const data = await res.json()
          setInterventions(data)
        } else {
          setInterventions(demoInterventions)
        }
      } catch {
        setInterventions(demoInterventions)
      } finally {
        setLoading(false)
      }
    }
    fetchInterventions()
  }, [])

  const filtered = interventions.filter((item) => {
    const matchesSearch = !search ||
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.agentName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} intervention(s) trouvée(s)</p>
        </div>
        <Link href="/dashboard/interventions/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle intervention
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par client, agent ou ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">Planifiée</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Terminée</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginated.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="py-16 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-medium">Aucune intervention trouvée</h3>
              <p className="text-gray-500 text-sm mt-1">Essayez de modifier vos filtres ou créez une nouvelle intervention.</p>
              <Link href="/dashboard/interventions/new">
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle intervention
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          paginated.map((item) => {
            const status = statusConfig[item.status] || statusConfig.pending
            return (
              <Card key={item.id} className="border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <ClipboardList className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">{item.id}</span>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">{item.type}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{item.clientName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.agentName} · {item.scheduledDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {item.score !== null && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-semibold text-amber-700">{item.score}/5</span>
                        </div>
                      )}
                      <Badge variant="secondary" className={`${status.bg} ${status.color} text-xs font-medium`}>
                        {status.label}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} sur {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 rounded-lg"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
