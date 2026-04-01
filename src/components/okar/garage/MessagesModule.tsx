/**
 * OKAR - Messages Module
 * Module de messages et assistance pour les garages
 * - Contact support WhatsApp
 * - Historique des messages
 * - Notifications
 */

'use client'

import { useState } from 'react'
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
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  HeadphonesIcon,
  Bell,
} from 'lucide-react'

interface Message {
  id: string
  from: 'garage' | 'support'
  content: string
  timestamp: Date
  read: boolean
}

interface Conversation {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved'
  messages: Message[]
  lastUpdate: Date
}

const SUPPORT_WHATSAPP = '221784858226'
const SUPPORT_EMAIL = 'support@okar.sn'

export function MessagesModule() {
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const [newMessage, setNewMessage] = useState({
    subject: '',
    category: 'general',
    message: ''
  })

  // Conversations mockées
  const [conversations] = useState<Conversation[]>([
    {
      id: 'CONV-001',
      subject: 'Problème avec un QR Code',
      status: 'in_progress',
      lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messages: [
        { id: 'm1', from: 'garage', content: 'Bonjour, j\'ai un problème pour scanner le QR code OKAR-12345678', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), read: true },
        { id: 'm2', from: 'support', content: 'Bonjour, nous vérifions le problème. Le QR code a bien été activé?', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), read: true },
        { id: 'm3', from: 'garage', content: 'Oui il est activé mais ne s\'affiche pas dans ma liste', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false },
      ]
    },
    {
      id: 'CONV-002',
      subject: 'Demande de formation',
      status: 'resolved',
      lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      messages: [
        { id: 'm1', from: 'garage', content: 'Je souhaite une formation sur l\'utilisation du dashboard', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), read: true },
        { id: 'm2', from: 'support', content: 'Bonjour, nous pouvons organiser une session de formation par visio. Quels créneaux vous conviennent?', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), read: true },
      ]
    }
  ])

  const handleOpenWhatsApp = () => {
    const message = `Bonjour OKAR Support,\n\nJe suis un garage partenaire et j'ai besoin d'aide.\n\n`
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.message) return

    setIsSubmitting(true)
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setShowNewMessageDialog(false)
    setNewMessage({ subject: '', category: 'general', message: '' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-orange-100 text-orange-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert'
      case 'in_progress': return 'En cours'
      case 'resolved': return 'Résolu'
      default: return status
    }
  }

  const unreadCount = conversations.reduce((acc, conv) => 
    acc + conv.messages.filter(m => !m.read && m.from === 'support').length, 0)

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

      {/* Mes conversations */}
      <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#ff6201]" />
            Mes Conversations
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Suivez vos échanges avec le support
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#94A3B8] mb-4">Aucune conversation</p>
              <Button onClick={() => setShowNewMessageDialog(true)} variant="outline" className="border-white/10 text-[#94A3B8]">
                Démarrer une conversation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => {
                const unreadInConv = conv.messages.filter(m => !m.read && m.from === 'support').length
                return (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl hover:bg-slate-900/70 transition-colors cursor-pointer border border-white/5"
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        conv.status === 'resolved' ? 'bg-green-500/20' :
                        conv.status === 'in_progress' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                      }`}>
                        {conv.status === 'resolved' ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {conv.subject}
                          {unreadInConv > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">{unreadInConv}</Badge>
                          )}
                        </p>
                        <p className="text-sm text-[#64748B]">
                          {conv.id} • {conv.messages.length} messages
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(conv.status)}>
                        {getStatusLabel(conv.status)}
                      </Badge>
                      <span className="text-xs text-[#64748B]">
                        {new Date(conv.lastUpdate).toLocaleDateString('fr-FR')}
                      </span>
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
              Nouveau message
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
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#ff6201]" />
              {selectedConversation?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge className={getStatusColor(selectedConversation?.status || '')}>
                {getStatusLabel(selectedConversation?.status || '')}
              </Badge>
              <span className="text-xs text-[#64748B]">{selectedConversation?.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-80 overflow-y-auto">
            {selectedConversation?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'garage' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.from === 'garage'
                    ? 'bg-gradient-to-r from-[#ff6201] to-pink-500 text-white'
                    : 'bg-slate-800 text-white border border-white/10'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.from === 'garage' ? 'text-white/70' : 'text-[#64748B]'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Input placeholder="Votre message..." className="bg-slate-800 border-white/10 text-white" />
            <Button className="bg-gradient-to-r from-[#ff6201] to-pink-500 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MessagesModule
