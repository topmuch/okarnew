/**
 * OKAR - Clients Module
 * Module CRM pour les garages
 * - Liste des clients
 * - Rappels automatiques
 * - Communication WhatsApp
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
  Users,
  User,
  Phone,
  Mail,
  Car,
  Calendar,
  MessageCircle,
  Plus,
  Search,
  Clock,
  Bell,
  Send,
  ChevronRight,
  Star,
  DollarSign,
  Loader2,
} from 'lucide-react'

interface ClientsModuleProps {
  garageId?: string
}

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  vehicleCount: number
  lastVisitDate?: Date
  totalSpent: number
  notes?: string
  reminders?: Reminder[]
}

interface Reminder {
  id: string
  clientId?: string
  clientName?: string
  clientPhone?: string
  type: string
  message: string
  dueDate: Date
}

const REMINDER_TYPES: Record<string, { label: string; color: string }> = {
  oil_change: { label: 'Vidange', color: 'text-blue-400' },
  ct_expiry: { label: 'CT', color: 'text-violet-400' },
  insurance_expiry: { label: 'Assurance', color: 'text-amber-400' },
  custom: { label: 'Autre', color: 'text-gray-400' },
}

export function ClientsModule({ garageId }: ClientsModuleProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [addClientOpen, setAddClientOpen] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [garageId])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/garage/clients')
      const data = await res.json()
      if (data.success) {
        setClients(data.data.clients)
        setReminders(data.data.reminders)
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.phone) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/garage/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: garageId || 'demo-garage-id',
          ...newClient
        })
      })
      const data = await res.json()
      if (data.success) {
        setClients([...clients, data.data])
        setAddClientOpen(false)
        setNewClient({ name: '', phone: '', email: '', notes: '' })
      }
    } catch (error) {
      console.error('Erreur ajout client:', error)
    } finally {
      setSaving(false)
    }
  }

  const sendWhatsApp = (phone: string, message: string) => {
    const text = encodeURIComponent(message)
    window.open(`https://wa.me/${phone.replace(/\s/g, '')}?text=${text}`, '_blank')
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return `${amount}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      {/* Rappels automatiques */}
      {reminders.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-300">
              <Bell className="h-5 w-5" />
              Rappels Automatiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.map((reminder) => {
              const typeConfig = REMINDER_TYPES[reminder.type] || REMINDER_TYPES.custom
              const daysUntil = Math.ceil((new Date(reminder.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              
              return (
                <div
                  key={reminder.id}
                  className="flex items-center gap-4 p-3 bg-okar-dark-800/30 rounded-lg border border-white/5"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    daysUntil <= 7 ? 'bg-rose-500/20' : 'bg-amber-500/20'
                  }`}>
                    <Clock className={`h-5 w-5 ${daysUntil <= 7 ? 'text-rose-400' : 'text-amber-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-okar-text-primary">{reminder.clientName}</span>
                      <Badge className={`${typeConfig.color} bg-transparent border border-current text-xs`}>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-okar-text-muted">{reminder.message}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${daysUntil <= 7 ? 'text-rose-300' : 'text-amber-300'}`}>
                      {daysUntil > 0 ? `Dans ${daysUntil} jours` : 'Aujourd\'hui'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-okar-text-muted hover:text-white mt-1"
                      onClick={() => sendWhatsApp(
                        reminder.clientPhone || '',
                        `Bonjour ${reminder.clientName}, c'est ${reminder.message}. Votre garage OKAR vous rappelle...`
                      )}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Liste des clients */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-okar-text-primary">
              <Users className="h-5 w-5 text-pink-400" />
              Clients ({clients.length})
            </CardTitle>
            <Button
              onClick={() => setAddClientOpen(true)}
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {/* Recherche */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-okar-text-muted" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-okar-text-muted">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{searchQuery ? 'Aucun client trouvé' : 'Aucun client enregistré'}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-4 p-4 bg-okar-dark-800/30 rounded-xl border border-white/5 hover:bg-okar-dark-800/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-okar-text-primary">{client.name}</span>
                      {client.totalSpent > 500000 && (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-okar-text-muted">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-okar-text-secondary">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">{client.vehicleCount}</span>
                      </div>
                      <p className="text-xs text-okar-text-muted">Véhicules</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-amber-300">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{formatCurrency(client.totalSpent)}</span>
                      </div>
                      <p className="text-xs text-okar-text-muted">Total</p>
                    </div>
                    {client.lastVisitDate && (
                      <div className="text-center">
                        <p className="text-okar-text-secondary font-medium">
                          {formatDate(client.lastVisitDate)}
                        </p>
                        <p className="text-xs text-okar-text-muted">Dernière visite</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-okar-text-secondary hover:text-white"
                      onClick={() => sendWhatsApp(
                        client.phone,
                        `Bonjour ${client.name}, c'est votre garage OKAR. Comment pouvons-nous vous aider ?`
                      )}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-okar-text-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog ajout client */}
      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogContent className="bg-okar-dark-card border-white/10 text-okar-text-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-pink-400" />
              Ajouter un Client
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Enregistrez un nouveau client dans votre base
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Nom complet *</Label>
              <Input
                placeholder="Ahmed Fall"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Téléphone *</Label>
              <Input
                placeholder="77 123 45 67"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Email (optionnel)</Label>
              <Input
                type="email"
                placeholder="client@email.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Notes</Label>
              <Input
                placeholder="Client VIP, préfère les pièces d'origine..."
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setAddClientOpen(false)}
              className="flex-1 border-white/10 text-okar-text-secondary"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={!newClient.name || !newClient.phone || saving}
              className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClientsModule
