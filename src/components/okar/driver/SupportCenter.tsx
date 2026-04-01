/**
 * OKAR - Support Center Component
 * 
 * Centre d'assistance pour les conducteurs
 * - Chat avec le support
 * - Création de tickets
 * - FAQ
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
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  MessageSquare,
  HeadphonesIcon,
  ChevronRight
} from 'lucide-react'
import { generateWhatsAppUrl } from '@/lib/mapsHelper'

interface Ticket {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  lastUpdate: Date
  messages: Array<{
    id: string
    from: 'user' | 'support'
    content: string
    timestamp: Date
  }>
}

interface SupportCenterProps {
  user?: {
    name?: string | null
    email?: string | null
    phone?: string | null
  }
}

// Numéro WhatsApp du support OKAR
const SUPPORT_WHATSAPP = '221784858226'

export function SupportCenter({ user }: SupportCenterProps) {
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // Formulaire nouveau ticket
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  })

  // Tickets mockés pour la démo
  const [tickets] = useState<Ticket[]>([
    {
      id: 'TKT-001',
      subject: 'Problème de validation d\'intervention',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
      messages: [
        { id: 'm1', from: 'user', content: 'Je n\'arrive pas à valider la dernière intervention de mon garage.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { id: 'm2', from: 'support', content: 'Bonjour, nous vérifions le problème. Pouvez-vous nous donner l\'ID de l\'intervention ?', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000) },
      ]
    },
    {
      id: 'TKT-002',
      subject: 'Question sur mon QR Code',
      status: 'resolved',
      priority: 'low',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      messages: [
        { id: 'm1', from: 'user', content: 'Comment puis-je télécharger mon QR Code ?', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { id: 'm2', from: 'support', content: 'Allez dans l\'onglet "Mon Véhicule" puis cliquez sur "Mon QR Code". Vous trouverez un bouton "Télécharger".', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) },
      ]
    }
  ])

  const handleCreateTicket = async () => {
    setIsSubmitting(true)
    
    // Simuler la création
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setShowNewTicketDialog(false)
    setTicketForm({ subject: '', category: 'general', priority: 'medium', message: '' })
    
    // TODO: Appel API pour créer le ticket
  }

  const handleOpenWhatsApp = () => {
    const message = `Bonjour OKAR Support,\n\nJe suis ${user?.name || 'un utilisateur'} et j'ai besoin d'aide.\n\n`
    const url = generateWhatsAppUrl(SUPPORT_WHATSAPP, message)
    window.open(url, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-orange-100 text-orange-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert'
      case 'in_progress': return 'En cours'
      case 'resolved': return 'Résolu'
      case 'closed': return 'Fermé'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-orange-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeadphonesIcon className="h-6 w-6 text-orange-500" />
            Centre d'Assistance
          </h2>
          <p className="text-gray-500 mt-1">Besoin d'aide ? Notre équipe est là pour vous.</p>
        </div>
        
        {/* Boutons d'action principaux */}
        <div className="flex gap-3">
          <Button 
            onClick={handleOpenWhatsApp}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Discuter avec le Support
          </Button>
          <Button 
            onClick={() => setShowNewTicketDialog(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Ticket
          </Button>
        </div>
      </div>

      {/* Bouton flottant mobile */}
      <div className="fixed bottom-24 right-4 z-40 md:hidden">
        <Button
          onClick={handleOpenWhatsApp}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl shadow-green-500/30"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Contact rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-500">Réponse en 5 min</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-green-700 hover:bg-green-100 rounded-xl"
              onClick={handleOpenWhatsApp}
            >
              Démarrer une conversation
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-sm text-gray-500">support@okar.sn</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-blue-700 hover:bg-blue-100 rounded-xl"
              onClick={() => window.open('mailto:support@okar.sn')}
            >
              Envoyer un email
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Téléphone</p>
                <p className="text-sm text-gray-500">+221 78 485 82 26</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-orange-700 hover:bg-orange-100 rounded-xl"
              onClick={() => window.open('tel:+221784858226')}
            >
              Appeler
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mes tickets */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            Mes Tickets
          </CardTitle>
          <CardDescription>
            Suivez l'avancement de vos demandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Aucun ticket en cours</p>
              <Button onClick={() => setShowNewTicketDialog(true)} variant="outline" className="rounded-xl">
                Créer mon premier ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setShowChatDialog(true)
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      ticket.status === 'resolved' ? 'bg-green-100' :
                      ticket.status === 'in_progress' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {ticket.status === 'resolved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">
                        {ticket.id} • {ticket.messages.length} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(ticket.lastUpdate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-orange-500" />
            Questions Fréquentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { q: 'Comment activer mon QR Code ?', a: 'Présentez votre QR Code à un garage partenaire OKAR lors de votre première intervention.' },
              { q: 'Comment transférer mon véhicule ?', a: 'Allez dans l\'onglet "Transfert" et générez un code de transfert à communiquer à l\'acheteur.' },
              { q: 'Comment télécharger mon passeport ?', a: 'Dans "Mon Véhicule", cliquez sur "Mon QR Code" puis sur le bouton "Télécharger".' },
            ].map((faq, index) => (
              <details key={index} className="group p-4 bg-gray-50 rounded-xl">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-gray-600 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Nouveau Ticket */}
      <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-500" />
              Créer un nouveau ticket
            </DialogTitle>
            <DialogDescription>
              Décrivez votre problème et notre équipe vous répondra rapidement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sujet</Label>
              <Input
                placeholder="Ex: Problème de validation d'intervention"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <select 
                className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              >
                <option value="general">Question générale</option>
                <option value="technical">Problème technique</option>
                <option value="validation">Validation d'intervention</option>
                <option value="account">Compte / Profil</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Priorité</Label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                    className={`flex-1 py-2 px-4 rounded-xl border-2 transition-all ${
                      ticketForm.priority === p
                        ? p === 'high' ? 'border-red-500 bg-red-50 text-red-700' :
                          p === 'medium' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                          'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {p === 'high' ? 'Haute' : p === 'medium' ? 'Moyenne' : 'Basse'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Décrivez votre problème en détail..."
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                rows={4}
                className="rounded-xl"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowNewTicketDialog(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl"
                onClick={handleCreateTicket}
                disabled={isSubmitting || !ticketForm.subject || !ticketForm.message}
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

      {/* Dialog Chat Ticket */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge className={getStatusColor(selectedTicket?.status || '')}>
                {getStatusLabel(selectedTicket?.status || '')}
              </Badge>
              <span className="text-xs">{selectedTicket?.id}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-80 overflow-y-auto">
            {selectedTicket?.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.from === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.from === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Input placeholder="Votre message..." className="rounded-xl" />
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SupportCenter
