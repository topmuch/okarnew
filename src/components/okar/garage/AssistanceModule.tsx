/**
 * OKAR - Garage Assistance Module
 * UI for garages to create and view support tickets
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
  Plus,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  ChevronRight,
  Building2,
  User,
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

interface AssistanceModuleProps {
  garageId?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Ouvert', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  in_progress: { label: 'En cours', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle },
  resolved: { label: 'Résolu', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  closed: { label: 'Fermé', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: CheckCircle },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'text-gray-400' },
  normal: { label: 'Normale', color: 'text-blue-400' },
  high: { label: 'Haute', color: 'text-orange-400' },
  urgent: { label: 'Urgente', color: 'text-red-400' },
}

export function AssistanceModule({ garageId }: AssistanceModuleProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [saving, setSaving] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const { toast } = useToast()

  // New ticket form
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  })

  useEffect(() => {
    fetchTickets()
  }, [garageId])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/garage/assistance')
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

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.message) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/garage/assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: garageId || 'demo-garage-id',
          ...formData
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Ticket créé',
          description: 'Votre demande a été envoyée avec succès',
        })
        setCreateOpen(false)
        setFormData({ subject: '', message: '', priority: 'normal' })
        fetchTickets()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le ticket',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
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
      const res = await fetch('/api/garage/assistance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          reply: replyMessage,
          userId: 'demo-user-id'
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Réponse envoyée',
          description: 'Votre réponse a été envoyée avec succès',
        })
        setReplyMessage('')
        fetchTickets()
        // Update selected ticket
        if (selectedTicket) {
          setSelectedTicket({
            ...selectedTicket,
            replies: [...selectedTicket.replies, {
              id: 'new',
              userId: 'demo-user-id',
              userRole: 'garage',
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
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Headphones className="h-6 w-6 text-pink-400" />
            Assistance
          </h2>
          <p className="text-[#94A3B8] mt-1">
            Besoin d'aide ? Créez un ticket de support
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{openTickets.length}</p>
                <p className="text-sm text-[#94A3B8]">Tickets ouverts</p>
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
                <p className="text-2xl font-bold text-white">{resolvedTickets.length}</p>
                <p className="text-sm text-[#94A3B8]">Tickets résolus</p>
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
                <p className="text-sm text-[#94A3B8]">Total tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Mes tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              <Headphones className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun ticket créé</p>
              <Button
                onClick={() => setCreateOpen(true)}
                variant="outline"
                className="mt-4 border-white/10 text-[#94A3B8]"
              >
                Créer un ticket
              </Button>
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
                    className="flex items-center gap-4 p-4 bg-okar-dark-800/30 rounded-xl border border-white/5 hover:bg-okar-dark-800/50 transition-colors cursor-pointer"
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
                        <span>Créé le {formatDate(ticket.createdAt)}</span>
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

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-okar-dark-card border-white/10 text-okar-text-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-pink-400" />
              Nouveau ticket de support
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Décrivez votre problème ou votre demande
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Sujet *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Résumé de votre demande"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-okar-dark-800 border-white/10">
                  <SelectItem value="low" className="text-white hover:bg-white/5">Basse</SelectItem>
                  <SelectItem value="normal" className="text-white hover:bg-white/5">Normale</SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-white/5">Haute</SelectItem>
                  <SelectItem value="urgent" className="text-white hover:bg-white/5">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Message *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Décrivez votre problème en détail..."
                rows={5}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="flex-1 border-white/10 text-okar-text-secondary"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-okar-dark-card border-white/10 text-okar-text-primary">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_CONFIG[selectedTicket.status]?.color || STATUS_CONFIG.open.color}>
                    {STATUS_CONFIG[selectedTicket.status]?.label || 'Ouvert'}
                  </Badge>
                  <span className={`text-sm ${PRIORITY_CONFIG[selectedTicket.priority]?.color || 'text-blue-400'}`}>
                    Priorité: {PRIORITY_CONFIG[selectedTicket.priority]?.label || 'Normale'}
                  </span>
                </div>
                <DialogTitle className="text-white mt-2">{selectedTicket.subject}</DialogTitle>
                <DialogDescription className="text-okar-text-muted">
                  Créé le {formatDate(selectedTicket.createdAt)}
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
                    <span className="text-sm font-medium text-blue-400">Vous</span>
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
                        ? 'bg-pink-500/10 border border-pink-500/20'
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
                        {reply.userRole === 'superadmin' ? 'Support OKAR' : 'Vous'}
                      </span>
                      <span className="text-xs text-[#64748B]">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-white text-sm">{reply.message}</p>
                  </div>
                ))}

                {/* Reply input */}
                {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
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

export default AssistanceModule
