/**
 * OKAR - Messages Module
 * Module de messages et assistance pour les garages
 * - Contact support WhatsApp
 * - Tickets de support via API
 * - Notifications
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  HeadphonesIcon,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Reply {
  id: string
  userId: string | null
  userRole: string
  message: string
  createdAt: Date | string
}

interface Ticket {
  id: string
  garageId: string
  userId: string | null
  subject: string
  message: string
  status: string
  priority: string
  createdAt: Date | string
  updatedAt: Date | string
  resolvedAt: Date | string | null
  replies: Reply[]
}

const SUPPORT_WHATSAPP = '221784858226'
const SUPPORT_EMAIL = 'support@okar.sn'

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

export function MessagesModule() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  const [newMessage, setNewMessage] = useState({
    subject: '',
    category: 'general',
    message: '',
    priority: 'normal'
  })

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets()
  }, [])

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

  const handleOpenWhatsApp = () => {
    const message = `Bonjour OKAR Support,\n\nJe suis un garage partenaire et j'ai besoin d'aide.\n\n`
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.message) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/garage/assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: user?.garage?.id || 'demo-garage-id',
          userId: user?.id,
          subject: newMessage.subject,
          message: newMessage.message,
          priority: newMessage.priority
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Message envoyé',
          description: 'Votre demande a été envoyée au support',
        })
        setNewMessage({ subject: '', category: 'general', message: '', priority: 'normal' })
        setShowNewMessageDialog(false)
        fetchTickets()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return

    try {
      const res = await fetch('/api/garage/assistance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          reply: replyMessage,
          userId: user?.id
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Réponse envoyée',
          description: 'Votre réponse a été envoyée',
        })
        setReplyMessage('')
        fetchTickets()
        // Update selected ticket
        setSelectedTicket({
          ...selectedTicket,
          status: 'in_progress',
          replies: [...selectedTicket.replies, {
            id: 'new',
            userId: user?.id || null,
            userRole: 'garage',
            message: replyMessage,
            createdAt: new Date()
          }]
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la réponse',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unreadCount = tickets.reduce((acc, ticket) => {
    // Count replies from superadmin that haven't been read
    return acc + ticket.replies.filter(r => r.userRole === 'superadmin').length
  }, 0)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HeadphonesIcon className="h-6 w-6 text-[#ff6201]" />
            Messages & Support
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{unreadCount} nouveaux</Badge>
            )}
          </h2>
          <p className="text-[#94A3B8] mt-1">Contactez notre équipe support</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleOpenWhatsApp}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={() => setShowNewMessageDialog(true)}
            className="bg-gradient-to-r from-[#ff6201] to-pink-500 hover:from-[#ff8533] hover:to-pink-600 text-white rounded-xl"
          >
            <Send className="h-4 w-4 mr-2" />
            Nouveau message
          </Button>
        </div>
      </div>

      {/* Contact rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white">WhatsApp</p>
                <p className="text-sm text-[#94A3B8]">Réponse en 5 min</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-green-400 hover:bg-green-500/10 rounded-xl"
              onClick={handleOpenWhatsApp}
            >
              Démarrer une conversation
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Email</p>
                <p className="text-sm text-[#94A3B8]">{SUPPORT_EMAIL}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-blue-400 hover:bg-blue-500/10 rounded-xl"
              onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`)}
            >
              Envoyer un email
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Phone className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Téléphone</p>
                <p className="text-sm text-[#94A3B8]">+221 78 485 82 26</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-orange-400 hover:bg-orange-500/10 rounded-xl"
              onClick={() => window.open('tel:+221784858226')}
            >
              Appeler
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mes tickets */}
      <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#ff6201]" />
            Mes Demandes
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Suivez vos échanges avec le support
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff6201]" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#94A3B8] mb-4">Aucune demande</p>
              <Button onClick={() => setShowNewMessageDialog(true)} variant="outline" className="border-white/10 text-[#94A3B8]">
                Créer une demande
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
                const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl hover:bg-slate-900/70 transition-colors cursor-pointer border border-white/5"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.color.split(' ')[0]}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {ticket.subject}
                          {ticket.replies.length > 0 && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {ticket.replies.length} réponse(s)
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-[#64748B] truncate max-w-md">
                          {ticket.message.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                      <span className={`text-xs ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nouveau Message */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#ff6201]" />
              Nouvelle demande
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Décrivez votre demande et notre équipe vous répondra rapidement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#94A3B8]">Sujet</Label>
              <Input
                placeholder="Ex: Problème avec un QR Code"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#94A3B8]">Catégorie</Label>
              <select
                className="w-full p-3 rounded-xl border border-white/10 bg-slate-800 text-white"
                value={newMessage.category}
                onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
              >
                <option value="general">Question générale</option>
                <option value="technical">Problème technique</option>
                <option value="qrcode">QR Code</option>
                <option value="billing">Facturation</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#94A3B8]">Priorité</Label>
              <select
                className="w-full p-3 rounded-xl border border-white/10 bg-slate-800 text-white"
                value={newMessage.priority}
                onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#94A3B8]">Message</Label>
              <Textarea
                placeholder="Décrivez votre demande en détail..."
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                rows={4}
                className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-[#94A3B8]"
                onClick={() => setShowNewMessageDialog(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#ff6201] to-pink-500 text-white"
                onClick={handleSendMessage}
                disabled={isSubmitting || !newMessage.subject || !newMessage.message}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Conversation */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg rounded-2xl max-h-[80vh] overflow-y-auto">
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
                <DialogTitle className="text-white mt-2 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[#ff6201]" />
                  {selectedTicket.subject}
                </DialogTitle>
                <DialogDescription className="text-[#64748B]">
                  Créé le {formatDate(selectedTicket.createdAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Conversation */}
              <div className="space-y-4 py-4">
                {/* Original message */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <MessageCircle className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-400">Votre message</span>
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
                        <MessageCircle className={`h-3 w-3 ${
                          reply.userRole === 'superadmin' ? 'text-pink-400' : 'text-blue-400'
                        }`} />
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
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <Label className="text-[#94A3B8]">Répondre</Label>
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      rows={3}
                      className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] resize-none"
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="bg-gradient-to-r from-[#ff6201] to-pink-500 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
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

export default MessagesModule
