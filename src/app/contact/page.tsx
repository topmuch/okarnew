/**
 * OKAR - Page Contact
 * 
 * Formulaire de contact et informations
 * Design cohérent avec la landing page
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Wrench,
} from 'lucide-react'
import { BackToHomeButton } from '@/components/okar/BackToHomeButton'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const contactMethods = [
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+221 78 485 82 26',
      description: 'Du lundi au samedi, 8h-20h',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@okar.sn',
      description: 'Réponse sous 24h',
      gradient: 'from-rose-400 to-pink-500',
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: 'Dakar, Sénégal',
      description: 'Siège social',
      gradient: 'from-sky-400 to-blue-500',
    },
    {
      icon: Clock,
      title: 'Horaires',
      value: 'Lun-Sam: 8h-20h',
      description: 'Support disponible',
      gradient: 'from-violet-400 to-purple-500',
    },
  ]

  const subjects = [
    { icon: MessageSquare, label: 'Question générale', value: 'general' },
    { icon: Users, label: 'Compte / Inscription', value: 'account' },
    { icon: Wrench, label: 'Partenariat Garage', value: 'garage' },
    { icon: Car, label: 'Signaler un problème', value: 'issue' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
          <BackToHomeButton />
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-12">
        {/* Titre */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 text-amber-700 border border-amber-200/50 px-4 py-2 rounded-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Nous Contacter
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Une question ? Contactez-nous
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question ou suggestion.
          </p>
        </div>

        {/* Infos de contact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="border-0 shadow-xl shadow-gray-200/40 bg-white rounded-2xl overflow-hidden group hover:shadow-2xl transition-shadow">
              <CardContent className="p-5 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${method.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                <p className="text-amber-600 font-medium mb-1">{method.value}</p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formulaire */}
        <Card className="max-w-2xl mx-auto border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="text-center border-b border-gray-100 pb-6">
            <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
            <CardDescription>
              Nous vous répondrons dans les plus brefs délais
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                <p className="text-gray-600 mb-6">
                  Merci de nous avoir contacté. Nous vous répondrons très bientôt.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="rounded-full"
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      required
                      className="h-12 rounded-xl border-gray-200 focus:border-amber-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean@email.com"
                      required
                      className="h-12 rounded-xl border-gray-200 focus:border-amber-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    className="h-12 rounded-xl border-gray-200 focus:border-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sujet</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects.map((subject) => (
                      <label
                        key={subject.value}
                        className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors"
                      >
                        <input type="radio" name="subject" value={subject.value} className="text-amber-500" />
                        <subject.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{subject.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre question ou votre demande..."
                    rows={5}
                    required
                    className="rounded-xl border-gray-200 focus:border-amber-300 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white rounded-xl font-semibold shadow-lg"
                >
                  {isSubmitting ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="container mx-auto px-4 lg:px-8 py-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 OKAR - Le passeport numérique automobile au Sénégal 🇸🇳
          </p>
        </div>
      </footer>
    </div>
  )
}
