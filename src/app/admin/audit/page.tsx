'use client'

import { useEffect, useState, useMemo } from 'react'
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ScrollText,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  adminName: string
  action: string
  targetType: string
  targetId: string
  ipAddress: string
  details: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
  }
}

const actionColors: Record<string, string> = {
  created: 'bg-emerald-100 text-emerald-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
  suspended: 'bg-amber-100 text-amber-700',
  activated: 'bg-emerald-100 text-emerald-700',
  toggled: 'bg-violet-100 text-violet-700',
}

const demoAuditLogs: AuditLog[] = [
  { id: 'al-001', timestamp: '2025-01-15T14:30:00Z', adminName: 'Super Admin', action: 'company.created', targetType: 'Company', targetId: 'comp-001', ipAddress: '192.168.1.100', details: { after: { name: 'CleanPro Services', slug: 'cleanpro-services', tier: 'pro' } } },
  { id: 'al-002', timestamp: '2025-01-15T13:15:00Z', adminName: 'Super Admin', action: 'user.role_changed', targetType: 'User', targetId: 'user-012', ipAddress: '192.168.1.100', details: { before: { role: 'agent' }, after: { role: 'manager' } } },
  { id: 'al-003', timestamp: '2025-01-15T11:45:00Z', adminName: 'Super Admin', action: 'subscription.upgraded', targetType: 'Subscription', targetId: 'sub-005', ipAddress: '192.168.1.100', details: { before: { plan: 'starter' }, after: { plan: 'pro' } } },
  { id: 'al-004', timestamp: '2025-01-15T10:20:00Z', adminName: 'Super Admin', action: 'config.updated', targetType: 'Config', targetId: 'scoring', ipAddress: '192.168.1.100', details: { before: { score_weights_punctuality: 20 }, after: { score_weights_punctuality: 25 } } },
  { id: 'al-005', timestamp: '2025-01-14T16:00:00Z', adminName: 'Super Admin', action: 'company.suspended', targetType: 'Company', targetId: 'comp-003', ipAddress: '192.168.1.100', details: { before: { isActive: true }, after: { isActive: false } } },
  { id: 'al-006', timestamp: '2025-01-14T14:30:00Z', adminName: 'Super Admin', action: 'user.activated', targetType: 'User', targetId: 'user-007', ipAddress: '192.168.1.100', details: { before: { isActive: false }, after: { isActive: true } } },
  { id: 'al-007', timestamp: '2025-01-14T12:00:00Z', adminName: 'Super Admin', action: 'ticket.resolved', targetType: 'Ticket', targetId: 'tk-015', ipAddress: '192.168.1.100', details: { before: { status: 'in_progress' }, after: { status: 'resolved' } } },
  { id: 'al-008', timestamp: '2025-01-14T09:30:00Z', adminName: 'Super Admin', action: 'feature_flag.toggled', targetType: 'FeatureFlag', targetId: 'qr_v2', ipAddress: '192.168.1.100', details: { before: { enabled: false }, after: { enabled: true } } },
  { id: 'al-009', timestamp: '2025-01-13T17:00:00Z', adminName: 'Super Admin', action: 'company.created', targetType: 'Company', targetId: 'comp-000', ipAddress: '192.168.1.101', details: { after: { name: 'NettoMan', slug: 'netto-man', tier: 'free' } } },
  { id: 'al-010', timestamp: '2025-01-13T15:15:00Z', adminName: 'Super Admin', action: 'user.password_reset', targetType: 'User', targetId: 'user-003', ipAddress: '192.168.1.100', details: {} },
  { id: 'al-011', timestamp: '2025-01-13T10:00:00Z', adminName: 'Super Admin', action: 'config.updated', targetType: 'Config', targetId: 'qrcode', ipAddress: '192.168.1.100', details: { before: { qr_expiry_hours: 12 }, after: { qr_expiry_hours: 24 } } },
  { id: 'al-012', timestamp: '2025-01-12T14:00:00Z', adminName: 'Super Admin', action: 'subscription.canceled', targetType: 'Subscription', targetId: 'sub-010', ipAddress: '192.168.1.100', details: { before: { status: 'active' }, after: { status: 'canceled' } } },
  { id: 'al-013', timestamp: '2025-01-12T11:30:00Z', adminName: 'Super Admin', action: 'user.deleted', targetType: 'User', targetId: 'user-099', ipAddress: '192.168.1.100', details: { before: { firstName: 'Test', lastName: 'User', email: 'test@test.fr' } } },
  { id: 'al-014', timestamp: '2025-01-11T16:45:00Z', adminName: 'Super Admin', action: 'company.updated', targetType: 'Company', targetId: 'comp-002', ipAddress: '192.168.1.101', details: { before: { maxAgents: 20 }, after: { maxAgents: 25 } } },
  { id: 'al-015', timestamp: '2025-01-11T09:00:00Z', adminName: 'Super Admin', action: 'feature_flag.toggled', targetType: 'FeatureFlag', targetId: 'ai_scoring', ipAddress: '192.168.1.100', details: { before: { enabled: true }, after: { enabled: false } } },
]

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')
  const [targetFilter, setTargetFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/admin/audit-logs')
        if (res.ok) {
          const data = await res.json()
          setLogs(data)
        } else {
          setLogs(demoAuditLogs)
        }
      } catch {
        setLogs(demoAuditLogs)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const actionTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.action.split('.')[1] || l.action))
    return Array.from(types).sort()
  }, [logs])

  const targetTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.targetType))
    return Array.from(types).sort()
  }, [logs])

  const filtered = useMemo(() => {
    let result = [...logs]
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (l) =>
          l.adminName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.targetId.toLowerCase().includes(q) ||
          l.targetType.toLowerCase().includes(q) ||
          l.ipAddress.toLowerCase().includes(q)
      )
    }
    if (actionFilter !== 'all') {
      result = result.filter((l) => l.action.includes(actionFilter))
    }
    if (targetFilter !== 'all') {
      result = result.filter((l) => l.targetType === targetFilter)
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, debouncedSearch, actionFilter, targetFilter])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => { setCurrentPage(1) }, [debouncedSearch, actionFilter, targetFilter])

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getActionColor(action: string): string {
    const verb = action.split('.')[1] || ''
    for (const [key, color] of Object.entries(actionColors)) {
      if (verb.includes(key)) return color
    }
    return 'bg-gray-100 text-gray-700'
  }

  function formatAction(action: string): string {
    return action.split('.').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('.')
  }

  function exportLogs() {
    const headers = ['Horodatage', 'Administrateur', 'Action', 'Type Cible', 'ID Cible', 'Adresse IP']
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toLocaleString('fr-FR'),
      l.adminName,
      l.action,
      l.targetType,
      l.targetId,
      l.ipAddress,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-logs.csv'
    a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="text-2xl font-bold text-gray-900">Journal d&apos;audit</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} entrées</p>
        </div>
        <Button variant="outline" className="border-gray-200" onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {actionTypes.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Type cible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {targetTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
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
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Horodatage</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type Cible</TableHead>
                  <TableHead>ID Cible</TableHead>
                  <TableHead>Adresse IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <ScrollText className="h-8 w-8 text-gray-300" />
                        <p>Aucune entrée trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((log) => {
                    const isExpanded = expandedRows.has(log.id)
                    const hasDetails = log.details && (log.details.before || log.details.after)
                    return (
                      <>
                        <TableRow
                          key={log.id}
                          className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() => hasDetails && toggleRow(log.id)}
                        >
                          <TableCell className="w-8">
                            {hasDetails && (
                              isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-900">{log.adminName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${getActionColor(log.action)} text-xs font-medium`}>
                              {formatAction(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{log.targetType}</TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">{log.targetId}</TableCell>
                          <TableCell className="font-mono text-xs text-gray-400">{log.ipAddress}</TableCell>
                        </TableRow>
                        {isExpanded && hasDetails && (
                          <TableRow key={`${log.id}-detail`} className="bg-violet-50/30">
                            <TableCell colSpan={7} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.details.before && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Avant</p>
                                    <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs font-mono text-red-800 overflow-x-auto max-h-40">
                                      {JSON.stringify(log.details.before, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.details.after && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Après</p>
                                    <pre className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs font-mono text-emerald-800 overflow-x-auto max-h-40">
                                      {JSON.stringify(log.details.after, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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
