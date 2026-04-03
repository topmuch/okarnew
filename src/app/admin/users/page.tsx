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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Eye,
  Shield,
  Power,
  KeyRound,
  Download,
  ArrowUpDown,
} from 'lucide-react'

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  companyName: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  superadmin: { label: 'SuperAdmin', color: 'text-violet-700', bg: 'bg-violet-100' },
  manager: { label: 'Gérant', color: 'text-blue-700', bg: 'bg-blue-100' },
  agent: { label: 'Agent', color: 'text-emerald-700', bg: 'bg-emerald-100' },
}

const demoUsers: AdminUser[] = [
  { id: 'u1', firstName: 'Super', lastName: 'Admin', email: 'superadmin@cleancheck.fr', role: 'superadmin', companyName: 'CleanCheck', isActive: true, lastLoginAt: '2025-01-15T08:00:00Z', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'u2', firstName: 'Marie', lastName: 'Dupont', email: 'marie@cleanpro.fr', role: 'manager', companyName: 'CleanPro Services', isActive: true, lastLoginAt: '2025-01-15T08:30:00Z', createdAt: '2024-06-15T10:00:00Z' },
  { id: 'u3', firstName: 'Sophie', lastName: 'Laurent', email: 'sophie@cleanpro.fr', role: 'agent', companyName: 'CleanPro Services', isActive: true, lastLoginAt: '2025-01-15T07:45:00Z', createdAt: '2024-06-20T14:00:00Z' },
  { id: 'u4', firstName: 'Marc', lastName: 'Dubois', email: 'marc@cleanpro.fr', role: 'agent', companyName: 'CleanPro Services', isActive: true, lastLoginAt: '2025-01-14T16:00:00Z', createdAt: '2024-07-01T09:00:00Z' },
  { id: 'u5', firstName: 'Julie', lastName: 'Robert', email: 'julie@cleanpro.fr', role: 'agent', companyName: 'CleanPro Services', isActive: false, lastLoginAt: '2025-01-10T09:00:00Z', createdAt: '2024-07-10T11:00:00Z' },
  { id: 'u6', firstName: 'Pierre', lastName: 'Martin', email: 'pierre@nettexpert.fr', role: 'manager', companyName: 'Nettexpert', isActive: true, lastLoginAt: '2025-01-15T09:15:00Z', createdAt: '2024-04-20T08:30:00Z' },
  { id: 'u7', firstName: 'Claire', lastName: 'Lefevre', email: 'claire@nettexpert.fr', role: 'agent', companyName: 'Nettexpert', isActive: true, lastLoginAt: '2025-01-15T06:00:00Z', createdAt: '2024-04-25T10:00:00Z' },
  { id: 'u8', firstName: 'Thomas', lastName: 'Garcia', email: 'thomas@proprete.fr', role: 'manager', companyName: 'Propreté Plus', isActive: true, lastLoginAt: '2025-01-14T17:00:00Z', createdAt: '2024-08-10T14:00:00Z' },
  { id: 'u9', firstName: 'Emma', lastName: 'Moreau', email: 'emma@ecoclean.fr', role: 'manager', companyName: 'ÉcoClean', isActive: true, lastLoginAt: '2025-01-13T10:30:00Z', createdAt: '2024-11-01T09:00:00Z' },
  { id: 'u10', firstName: 'Lucas', lastName: 'Petit', email: 'lucas@brillance.fr', role: 'manager', companyName: 'Brillance SAS', isActive: true, lastLoginAt: '2025-01-15T10:00:00Z', createdAt: '2024-09-05T11:30:00Z' },
  { id: 'u11', firstName: 'Léa', lastName: 'Roux', email: 'lea@hygiene.fr', role: 'manager', companyName: 'Hygiène Services', isActive: true, lastLoginAt: '2025-01-12T14:00:00Z', createdAt: '2024-03-18T07:45:00Z' },
  { id: 'u12', firstName: 'Hugo', lastName: 'Simon', email: 'hugo@cleanoffice.fr', role: 'manager', companyName: 'CleanOffice', isActive: true, lastLoginAt: '2025-01-15T11:30:00Z', createdAt: '2024-01-10T12:00:00Z' },
  { id: 'u13', firstName: 'Camille', lastName: 'Bernard', email: 'camille@sparkle.fr', role: 'agent', companyName: 'SparkleClean', isActive: true, lastLoginAt: '2025-01-15T05:30:00Z', createdAt: '2024-05-12T09:00:00Z' },
  { id: 'u14', firstName: 'Nathan', lastName: 'Leroy', email: 'nathan@cleanmax.fr', role: 'agent', companyName: 'CleanMax', isActive: false, lastLoginAt: '2024-12-20T08:00:00Z', createdAt: '2024-11-15T13:00:00Z' },
]

type SortKey = 'firstName' | 'lastName' | 'createdAt'

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('firstName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState('')
  const pageSize = 10

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        } else {
          setUsers(demoUsers)
        }
      } catch {
        setUsers(demoUsers)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const companies = useMemo(() => {
    const map = new Map<string, string>()
    users.forEach((u) => map.set(u.companyName, u.companyName))
    return Array.from(map.keys()).sort()
  }, [users])

  const filteredUsers = useMemo(() => {
    let result = [...users]

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.companyName.toLowerCase().includes(q)
      )
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter)
    }

    if (companyFilter !== 'all') {
      result = result.filter((u) => u.companyName === companyFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'firstName') cmp = a.firstName.localeCompare(b.firstName)
      else if (sortKey === 'lastName') cmp = a.lastName.localeCompare(b.lastName)
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [users, debouncedSearch, roleFilter, companyFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  useEffect(() => { setCurrentPage(1) }, [debouncedSearch, roleFilter, companyFilter])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleToggleActive(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)))
  }

  function handleChangeRole() {
    if (!selectedUser || !newRole) return
    setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u)))
    setRoleDialogOpen(false)
    setSelectedUser(null)
    setNewRole('')
  }

  function exportCSV() {
    const headers = ['Nom', 'Email', 'Rôle', 'Société', 'Statut', 'Dernière connexion', 'Créé le']
    const rows = filteredUsers.map((u) => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.role,
      u.companyName,
      u.isActive ? 'Actif' : 'Inactif',
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('fr-FR') : '',
      new Date(u.createdAt).toLocaleDateString('fr-FR'),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'utilisateurs.csv'
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
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredUsers.length} utilisateurs enregistrés</p>
        </div>
        <Button variant="outline" className="border-gray-200" onClick={exportCSV}>
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
                placeholder="Rechercher par nom, email ou société..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="superadmin">SuperAdmin</SelectItem>
                <SelectItem value="manager">Gérant</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Société" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sociétés</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
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
                  <TableHead>
                    <button onClick={() => handleSort('firstName')} className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                      Nom <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-300" />
                        <p>Aucun utilisateur trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const role = roleConfig[user.role] || roleConfig.agent
                    return (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${role.bg} ${role.color} text-xs font-medium`}>
                            {role.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{user.companyName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={user.isActive ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir détails">
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Changer le rôle"
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setRoleDialogOpen(true)
                              }}
                            >
                              <Shield className="h-4 w-4 text-violet-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={user.isActive ? 'Désactiver' : 'Activer'}
                              onClick={() => handleToggleActive(user.id)}
                            >
                              <Power className={`h-4 w-4 ${user.isActive ? 'text-amber-500' : 'text-emerald-500'}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Réinitialiser le mot de passe">
                              <KeyRound className="h-4 w-4 text-blue-500" />
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

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Utilisateur : <span className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</span>
              </p>
              <div className="space-y-2">
                <Label>Nouveau rôle</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">SuperAdmin</SelectItem>
                    <SelectItem value="manager">Gérant</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Annuler</Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleChangeRole}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Affichage {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredUsers.length)} sur {filteredUsers.length}
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
