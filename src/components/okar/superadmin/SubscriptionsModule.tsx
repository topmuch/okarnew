/**
 * OKAR - Subscriptions Module
 * Superadmin interface for managing subscriptions
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Building,
  Calendar,
  Crown,
  Gift,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Subscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string | null
  userRole: string
  subscriptionStatus: string
  subscriptionPlan: string
  subscriptionStartDate: string | null
  subscriptionEndDate: string | null
  garage: {
    id: string
    name: string
    city: string
  } | null
  stats: {
    vehicles: number
    maintenanceRecords: number
  }
  createdAt: string
}

interface SubscriptionStats {
  total: number
  active: number
  expired: number
  free: number
  premium: number
  byType: {
    garage: number
    driver: number
  }
}

const PLANS = [
  { value: 'free', label: 'Gratuit', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'basic', label: 'Basique', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'enterprise', label: 'Entreprise', color: 'bg-amber-500/20 text-amber-400' },
]

const STATUSES = [
  { value: 'inactive', label: 'Inactif', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'active', label: 'Actif', color: 'bg-green-500/20 text-green-400' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'expired', label: 'Expiré', color: 'bg-red-500/20 text-red-400' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-orange-500/20 text-orange-400' },
]

export function SubscriptionsModule() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    plan: 'free',
    status: 'active',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchSubscriptions()
  }, [statusFilter, typeFilter])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)

      const res = await fetch(`/api/superadmin/subscriptions?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setSubscriptions(data.subscriptions)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur chargement abonnements:', error)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setFormData({
      plan: subscription.subscriptionPlan || 'free',
      status: subscription.subscriptionStatus || 'inactive',
      startDate: subscription.subscriptionStartDate 
        ? new Date(subscription.subscriptionStartDate).toISOString().split('T')[0] 
        : '',
      endDate: subscription.subscriptionEndDate 
        ? new Date(subscription.subscriptionEndDate).toISOString().split('T')[0] 
        : '',
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedSubscription) return

    setSaving(true)
    try {
      const res = await fetch('/api/superadmin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedSubscription.userId,
          plan: formData.plan,
          status: formData.status,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Abonnement mis à jour',
          description: `L'abonnement de ${selectedSubscription.userName} a été mis à jour`,
        })
        setEditDialogOpen(false)
        fetchSubscriptions()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getPlanBadge = (plan: string) => {
    const found = PLANS.find(p => p.value === plan)
    return (
      <Badge className={found?.color || 'bg-gray-500/20 text-gray-400'}>
        {found?.label || plan}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const found = STATUSES.find(s => s.value === status)
    return (
      <Badge className={found?.color || 'bg-gray-500/20 text-gray-400'}>
        {found?.label || status}
      </Badge>
    )
  }

  const filteredSubscriptions = subscriptions.filter(sub =>
    searchQuery
      ? sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.garage?.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-400" />
            Abonnements
          </h2>
          <p className="text-[#94A3B8] mt-1">
            Gérez les abonnements des garages et conducteurs
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                <p className="text-sm text-[#94A3B8]">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.active || 0}</p>
                <p className="text-sm text-[#94A3B8]">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.premium || 0}</p>
                <p className="text-sm text-[#94A3B8]">Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.expired || 0}</p>
                <p className="text-sm text-[#94A3B8]">Expirés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <Gift className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.free || 0}</p>
                <p className="text-sm text-[#94A3B8]">Gratuits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            placeholder="Rechercher par nom, email ou garage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/40 border-white/10 text-white placeholder:text-[#64748B]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-slate-800/40 border-white/10 text-white">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/5">Tous</SelectItem>
            <SelectItem value="active" className="text-white hover:bg-white/5">Actifs</SelectItem>
            <SelectItem value="expired" className="text-white hover:bg-white/5">Expirés</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] bg-slate-800/40 border-white/10 text-white">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/5">Tous</SelectItem>
            <SelectItem value="garage" className="text-white hover:bg-white/5">Garages</SelectItem>
            <SelectItem value="driver" className="text-white hover:bg-white/5">Conducteurs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <Card className="bg-slate-800/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Tous les abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun abonnement trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-xl border border-white/5 hover:bg-slate-900/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    sub.userRole === 'garage_certified' 
                      ? 'bg-amber-500/20' 
                      : 'bg-blue-500/20'
                  }`}>
                    {sub.userRole === 'garage_certified' ? (
                      <Building className="h-6 w-6 text-amber-400" />
                    ) : (
                      <User className="h-6 w-6 text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">{sub.userName}</h3>
                      {getPlanBadge(sub.subscriptionPlan)}
                      {getStatusBadge(sub.subscriptionStatus)}
                    </div>
                    <p className="text-sm text-[#94A3B8] truncate">{sub.userEmail}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-[#64748B]">
                      {sub.garage && (
                        <span>{sub.garage.name} - {sub.garage.city}</span>
                      )}
                      <span>{sub.stats.vehicles} véhicule(s)</span>
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-[#64748B]">
                      <Calendar className="h-3 w-3" />
                      <span>Fin: {formatDate(sub.subscriptionEndDate)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(sub)}
                    className="border-white/10 text-[#94A3B8] hover:text-white"
                  >
                    Modifier
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-slate-800 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
              Modifier l'abonnement
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              {selectedSubscription?.userName} - {selectedSubscription?.userEmail}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#94A3B8]">Plan</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {PLANS.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value} className="text-white hover:bg-white/5">
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#94A3B8]">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-white hover:bg-white/5">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Date de début</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-slate-900/50 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Date de fin</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-slate-900/50 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="flex-1 border-white/10 text-[#94A3B8]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SubscriptionsModule
