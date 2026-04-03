'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  User,
  Shield,
} from 'lucide-react'

interface TicketMessage {
  id: string
  senderName: string
  senderRole: 'admin' | 'user'
  content: string
  createdAt: string
}

interface TicketDetail {
  id: string
  subject: string
  status: string
  priority: string
  companyName: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
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

const demoTicket: TicketDetail = {
  id: 'tk-001',
  subject: 'Problème de connexion QR',
  status: 'in_progress',
  priority: 'high',
  companyName: 'CleanPro Services',
  assignedTo: 'Super Admin',
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-15T09:00:00Z',
  messages: [
    { id: 'm1', senderName: 'Marie Dupont', senderRole: 'user', content: 'Bonjour, nos agents ne peuvent plus scanner les QR codes depuis ce matin. L\'application affiche "Code invalide" pour tous les codes.', createdAt: '2025-01-10T10:00:00Z' },
    { id: 'm2', senderName: 'Super Admin', senderRole: 'admin', content: 'Bonjour Marie, merci pour votre signalement. Je vais vérifier le système de QR codes immédiatement. Pouvez-vous me confirmer la version de l\'application que vous utilisez ?', createdAt: '2025-01-10T10:30:00Z' },
    { id: 'm3', senderName: 'Marie Dupont', senderRole: 'user', content: 'Nous utilisons la version 2.3.1. Le problème est survenu après la mise à jour d\'hier.', createdAt: '2025-01-10T11:00:00Z' },
    { id: 'm4', senderName: 'Super Admin', senderRole: 'admin', content: 'Merci pour cette information. Nous avons identifié un problème dans la génération des tokens QR après la mise à jour. Nous déployons un correctif qui sera actif d\'ici 2 heures.', createdAt: '2025-01-10T14:00:00Z' },
    { id: 'm5', senderName: 'Super Admin', senderRole: 'admin', content: 'Le correctif a été déployé. Pouvez-vous tester à nouveau les QR codes et me confirmer que tout fonctionne ?', createdAt: '2025-01-10T16:00:00Z' },
    { id: 'm6', senderName: 'Marie Dupont', senderRole: 'user', content: 'C\'est parfait, tout fonctionne à nouveau ! Merci pour la réactivité.', createdAt: '2025-01-10T16:30:00Z' },
    { id: 'm7', senderName: 'Super Admin', senderRole: 'admin', content: 'Excellent ! Je marque le ticket comme résolu. N\'hésitez pas à nous contacter si le problème réapparaît.', createdAt: '2025-01-10T16:45:00Z' },
  ],
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [ticketStatus, setTicketStatus] = useState('')
  const [resolution, setResolution] = useState('')
  const [showResolution, setShowResolution] = useState(false)

  useEffect(() => {
    async function fetchTicket() {
      try {
        const id = params.id as string
        const res = await fetch(`/api/admin/support-tickets/${id}`)
        if (res.ok) {
          const data = await res.json()
          setTicket(data)
          setTicketStatus(data.status)
        } else {
          setTicket({ ...demoTicket, id })
          setTicketStatus(demoTicket.status)
        }
      } catch {
        setTicket({ ...demoTicket, id: params.id as string })
        setTicketStatus(demoTicket.status)
      } finally {
        setLoading(false)
      }
    }
    fetchTicket()
  }, [params.id])

  function handleSendMessage() {
    if (!newMessage || !ticket) return
    const msg: TicketMessage = {
      id: `m-${Date.now()}`,
      senderName: 'Super Admin',
      senderRole: 'admin',
      content: newMessage,
      createdAt: new Date().toISOString(),
    }
    setTicket((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev)
    setNewMessage('')
  }

  function handleResolve() {
    if (!resolution || !ticket) return
    setTicket((prev) => prev ? { ...prev, status: 'resolved' } : prev)
    setTicketStatus('resolved')
    setShowResolution(false)
    setResolution('')
    const msg: TicketMessage = {
      id: `m-${Date.now()}`,
      senderName: 'Super Admin',
      senderRole: 'admin',
      content: `Ticket résolu : ${resolution}`,
      createdAt: new Date().toISOString(),
    }
    setTicket((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev)
  }

  if (loading || !ticket) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  const status = statusConfig[ticket.status] || statusConfig.open
  const priority = priorityConfig[ticket.priority] || priorityConfig.medium

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/support')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            <Badge variant="secondary" className={`${priority.bg} ${priority.color} text-xs font-medium`}>
              {priority.label}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {ticket.companyName} · <span className="font-mono">{ticket.id}</span> · Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-500" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {ticket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={`text-xs font-semibold ${
                          msg.senderRole === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {msg.senderName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] ${msg.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{msg.senderName}</span>
                          {msg.senderRole === 'admin' && (
                            <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-[10px] px-1 py-0">
                              Admin
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className={`rounded-xl p-3 ${
                          msg.senderRole === 'admin'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              {/* New Message */}
              <div className="flex gap-3">
                <Textarea
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="flex-1 resize-none"
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <div>
                  {ticketStatus !== 'resolved' && ticketStatus !== 'closed' && (
                    <Button
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => setShowResolution(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquer comme résolu
                    </Button>
                  )}
                </div>
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={handleSendMessage}
                  disabled={!newMessage}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>

              {/* Resolution Input */}
              {showResolution && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Label className="text-sm font-medium text-emerald-800">Résolution</Label>
                  <Textarea
                    placeholder="Décrivez comment le problème a été résolu..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                    className="mt-2 bg-white border-emerald-200"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => { setShowResolution(false); setResolution('') }}>
                      Annuler
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleResolve} disabled={!resolution}>
                      Confirmer la résolution
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Détails du ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Statut</Label>
                <Select value={ticketStatus} onValueChange={setTicketStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouvert</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="resolved">Résolu</SelectItem>
                    <SelectItem value="closed">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Priorité</Label>
                <Badge variant="secondary" className={`${priority.bg} ${priority.color} text-sm`}>
                  {priority.label}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Société</Label>
                <p className="text-sm text-gray-900">{ticket.companyName}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Assigné à</Label>
                <p className="text-sm text-gray-900">{ticket.assignedTo || 'Non assigné'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Créé le</Label>
                <p className="text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Dernière mise à jour</Label>
                <p className="text-sm text-gray-500">
                  {new Date(ticket.updatedAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from(new Set(ticket.messages.map((m) => m.senderName))).map((name) => (
                <div key={name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-semibold bg-gray-100 text-gray-700">
                      {name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">
                      {ticket.messages.find((m) => m.senderName === name)?.senderRole === 'admin' ? 'Admin' : 'Utilisateur'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
