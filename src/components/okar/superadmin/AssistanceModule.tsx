/**
 * OKAR - Superadmin Assistance Module
 * UI for superadmins to manage support tickets
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
  Headphones,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  ChevronRight,
  Building2,
  User,
  Phone,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Reply {
  id: string
  userId: string
  userRole: string
  message: string
  createdAt: Date
}

interface Ticket {
  id: string
  garageId: string
  garageName?: string
  garagePhone?: string
  userId: string
  subject: string
  message: string
  status: string
  priority: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  replies: Reply[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Ouvert', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  in_progress: { label: 'En cours', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle },
  resolved: { label: 'Résolu', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  closed: { label: 'Fermé', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'text-gray-400' },
  normal: { label: 'Normale', color: 'text-blue-400' },
  high: { label: 'Haute', color: 'text-orange-400' },
  urgent: { label: 'Urgente', color: 'text-red-400' },
}

export function SuperadminAssistanceModule() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchTickets()
  }, [filterStatus])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const url = filterStatus !== 'all' 
        ? `/api/superadmin/assistance?status=${filterStatus}`
        : '/api/superadmin/assistance'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setTickets(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setDetailsOpen(true)
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return

    setSendingReply(true)
    try {
      const res = await fetch('/api/superadmin/assistance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          reply: replyMessage,
          userId: 'admin-1',
          status: 'in_progress'
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Réponse envoyée',
          description: 'Votre réponse a été envoyée au garage',
        })
        setReplyMessage('')
        fetchTickets()
        // Update selected ticket
        if (selectedTicket) {
          setSelectedTicket({
            ...selectedTicket,
            status: 'in_progress',
            replies: [...selectedTicket.replies, {
              id: 'new',
              userId: 'admin-1',
              userRole: 'superadmin',
              message: replyMessage,
              createdAt: new Date()
            }]
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la réponse',
        variant: 'destructive',
      })
    } finally {
      setSendingReply(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return

    try {
      const res = await fetch('/api/superadmin/assistance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Statut mis à jour',
          description: `Le ticket est maintenant ${STATUS_CONFIG[status]?.label || status}`,
        })
        setSelectedTicket({ ...selectedTicket, status })
        fetchTickets()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress')
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && (t.status === 'open' || t.status === 'in_progress'))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Headphones className="h-6 w-6 text-pink-400" />
            Support
          </h2>
          <p className="text-[#94A3B8] mt-1">
            Gérez les demandes d'assistance des garages
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{urgentTickets.length}</p>
                <p className="text-sm text-[#94A3B8]">Urgents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{openTickets.length}</p>
                <p className="text-sm text-[#94A3B8]">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'resolved').length}</p>
                <p className="text-sm text-[#94A3B8]">Résolus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tickets.length}</p>
                <p className="text-sm text-[#94A3B8]">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#94A3B8]">Filtrer par statut:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-okar-dark-800/50 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-okar-dark-800 border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/5">Tous</SelectItem>
            <SelectItem value="open" className="text-white hover:bg-white/5">Ouverts</SelectItem>
            <SelectItem value="in_progress" className="text-white hover:bg-white/5">En cours</SelectItem>
            <SelectItem value="resolved" className="text-white hover:bg-white/5">Résolus</SelectItem>
            <SelectItem value="closed" className="text-white hover:bg-white/5">Fermés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Tickets de support</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              <Headphones className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun ticket trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
                const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={ticket.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                      ticket.priority === 'urgent' && (ticket.status === 'open' || ticket.status === 'in_progress')
                        ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                        : 'bg-okar-dark-800/30 border-white/5 hover:bg-okar-dark-800/50'
                    }`}
                    onClick={() => handleViewTicket(ticket)}
                  >
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color.split(' ')[0]}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">{ticket.subject}</h3>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <span className={`text-xs ${priorityConfig.color}`}>
                          {priorityConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#94A3B8] truncate mt-1">{ticket.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {ticket.garageName || 'Garage inconnu'}
                        </span>
                        {ticket.garagePhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {ticket.garagePhone}
                          </span>
                        )}
                        <span>{formatDate(ticket.createdAt)}</span>
                        {ticket.replies.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {ticket.replies.length} réponse(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-okar-dark-card border-white/10 text-okar-text-primary">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_CONFIG[selectedTicket.status]?.color || STATUS_CONFIG.open.color}>
                      {STATUS_CONFIG[selectedTicket.status]?.label || 'Ouvert'}
                    </Badge>
                    <span className={`text-sm ${PRIORITY_CONFIG[selectedTicket.priority]?.color || 'text-blue-400'}`}>
                      Priorité: {PRIORITY_CONFIG[selectedTicket.priority]?.label || 'Normale'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => handleUpdateStatus(value)}
                    >
                      <SelectTrigger className="w-32 bg-okar-dark-800/50 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-okar-dark-800 border-white/10">
                        <SelectItem value="open" className="text-white hover:bg-white/5 text-xs">Ouvert</SelectItem>
                        <SelectItem value="in_progress" className="text-white hover:bg-white/5 text-xs">En cours</SelectItem>
                        <SelectItem value="resolved" className="text-white hover:bg-white/5 text-xs">Résolu</SelectItem>
                        <SelectItem value="closed" className="text-white hover:bg-white/5 text-xs">Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogTitle className="text-white mt-2">{selectedTicket.subject}</DialogTitle>
                <DialogDescription className="text-okar-text-muted">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {selectedTicket.garageName || 'Garage inconnu'}
                    </span>
                    {selectedTicket.garagePhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedTicket.garagePhone}
                      </span>
                    )}
                    <span>• Créé le {formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {/* Conversation */}
              <div className="space-y-4 py-4">
                {/* Original message */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-400">Garage</span>
                    <span className="text-xs text-[#64748B]">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                  <p className="text-white text-sm">{selectedTicket.message}</p>
                </div>

                {/* Replies */}
                {selectedTicket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-lg ${
                      reply.userRole === 'superadmin'
                        ? 'bg-pink-500/10 border border-pink-500/20 ml-8'
                        : 'bg-blue-500/10 border border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        reply.userRole === 'superadmin' ? 'bg-pink-500/20' : 'bg-blue-500/20'
                      }`}>
                        {reply.userRole === 'superadmin' ? (
                          <Building2 className="h-3 w-3 text-pink-400" />
                        ) : (
                          <User className="h-3 w-3 text-blue-400" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        reply.userRole === 'superadmin' ? 'text-pink-400' : 'text-blue-400'
                      }`}>
                        {reply.userRole === 'superadmin' ? 'Support OKAR' : 'Garage'}
                      </span>
                      <span className="text-xs text-[#64748B]">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-white text-sm">{reply.message}</p>
                  </div>
                ))}

                {/* Reply input */}
                {selectedTicket.status !== 'closed' && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <Label className="text-okar-text-secondary">Répondre</Label>
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      rows={3}
                      className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary resize-none"
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || sendingReply}
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      {sendingReply ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Envoyer
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SuperadminAssistanceModule
