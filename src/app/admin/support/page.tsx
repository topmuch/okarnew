'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  LifeBuoy,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
} from 'lucide-react'

interface SupportTicket {
  id: string
  subject: string
  companyName: string
  priority: string
  status: string
  assignedTo: string | null
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
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

const demoTickets: SupportTicket[] = [
  { id: 'tk-001', subject: 'Problème de connexion QR', companyName: 'CleanPro Services', priority: 'high', status: 'resolved', assignedTo: 'Super Admin', createdAt: '2025-01-10T10:00:00Z' },
  { id: 'tk-002', subject: 'Demande de changement de forfait', companyName: 'CleanPro Services', priority: 'medium', status: 'open', assignedTo: 'Super Admin', createdAt: '2025-01-14T15:30:00Z' },
  { id: 'tk-003', subject: 'Bug dans les scores qualité', companyName: 'CleanPro Services', priority: 'critical', status: 'in_progress', assignedTo: 'Super Admin', createdAt: '2025-01-15T09:00:00Z' },
  { id: 'tk-004', subject: 'Agent ne peut pas scanner le QR', companyName: 'Nettexpert', priority: 'high', status: 'open', assignedTo: null, createdAt: '2025-01-15T11:00:00Z' },
  { id: 'tk-005', subject: 'Mise à jour des informations sociétés', companyName: 'Propreté Plus', priority: 'low', status: 'closed', assignedTo: 'Super Admin', createdAt: '2025-01-12T14:00:00Z' },
  { id: 'tk-006', subject: 'Facturation incorrecte', companyName: 'MaintenPro', priority: 'high', status: 'open', assignedTo: null, createdAt: '2025-01-15T08:30:00Z' },
  { id: 'tk-007', subject: 'Nouveau modèle de checklist', companyName: 'Hygiène Services', priority: 'medium', status: 'in_progress', assignedTo: 'Super Admin', createdAt: '2025-01-13T16:00:00Z' },
  { id: 'tk-008', subject: 'Accès refusé pour un agent', companyName: 'CleanOffice', priority: 'high', status: 'resolved', assignedTo: 'Super Admin', createdAt: '2025-01-11T10:30:00Z' },
  { id: 'tk-009', subject: 'Demande de fonctionnalité export', companyName: 'Nettexpert', priority: 'low', status: 'open', assignedTo: null, createdAt: '2025-01-14T09:00:00Z' },
  { id: 'tk-010', subject: 'Erreur 500 sur le dashboard', companyName: 'Brillance SAS', priority: 'critical', status: 'in_progress', assignedTo: 'Super Admin', createdAt: '2025-01-15T12:00:00Z' },
  { id: 'tk-011', subject: 'Suppression de compte', companyName: 'CleanMax', priority: 'medium', status: 'open', assignedTo: null, createdAt: '2025-01-13T11:15:00Z' },
  { id: 'tk-012', subject: 'Intégration avec mon système CRM', companyName: 'ÉcoClean', priority: 'low', status: 'closed', assignedTo: 'Super Admin', createdAt: '2025-01-08T14:30:00Z' },
]

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', companyName: '', priority: 'medium', description: '' })
  const pageSize = 10

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch('/api/admin/support-tickets')
        if (res.ok) {
          const data = await res.json()
          setTickets(data)
        } else {
          setTickets(demoTickets)
        }
      } catch {
        setTickets(demoTickets)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const filtered = useMemo(() => {
    let result = [...tickets]
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter((t) => t.priority === priorityFilter)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [tickets, statusFilter, priorityFilter])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => { setCurrentPage(1) }, [statusFilter, priorityFilter])

  function handleCreateTicket() {
    if (!newTicket.subject) return
    const created: SupportTicket = {
      id: `tk-${Date.now()}`,
      subject: newTicket.subject,
      companyName: newTicket.companyName || 'Non assigné',
      priority: newTicket.priority,
      status: 'open',
      assignedTo: 'Super Admin',
      createdAt: new Date().toISOString(),
    }
    setTickets((prev) => [created, ...prev])
    setCreateOpen(false)
    setNewTicket({ subject: '', companyName: '', priority: 'medium', description: '' })
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
          <h1 className="text-2xl font-bold text-gray-900">Tickets Support</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} tickets</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Sujet</Label>
                <Input
                  placeholder="Sujet du ticket"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Société</Label>
                <Input
                  placeholder="Nom de la société"
                  value={newTicket.companyName}
                  onChange={(e) => setNewTicket({ ...newTicket, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Décrivez le problème..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleCreateTicket}>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'open', label: 'Ouverts', color: 'text-blue-600', bg: 'bg-blue-50' },
          { key: 'in_progress', label: 'En cours', color: 'text-amber-600', bg: 'bg-amber-50' },
          { key: 'resolved', label: 'Résolus', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { key: 'closed', label: 'Fermés', color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map((s) => {
          const count = tickets.filter((t) => t.status === s.key).length
          return (
            <Card key={s.key} className="border-0 shadow-sm rounded-xl cursor-pointer" onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}>
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{count}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
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
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <LifeBuoy className="h-8 w-8 text-gray-300" />
                        <p>Aucun ticket trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((ticket) => {
                    const status = statusConfig[ticket.status] || statusConfig.open
                    const priority = priorityConfig[ticket.priority] || priorityConfig.medium
                    return (
                      <TableRow key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-mono text-xs text-gray-500">{ticket.id}</TableCell>
                        <TableCell className="font-medium text-gray-900 max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell className="text-sm text-gray-600">{ticket.companyName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${priority.bg} ${priority.color} text-xs font-medium`}>
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${status.bg} ${status.color} text-xs font-medium`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {ticket.assignedTo || <span className="text-gray-400">Non assigné</span>}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/admin/support/${ticket.id}`)}
                          >
                            <Eye className="h-4 w-4 text-violet-500" />
                          </Button>
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
