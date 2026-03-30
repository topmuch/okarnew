/**
 * OKAR - Page En Attente de Validation
 * 
 * Affichée après l'inscription pour informer l'utilisateur
 * que son compte est en cours de validation par le SuperAdmin.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle, Mail, MessageCircle, ArrowLeft, Car } from 'lucide-react'
import Link from 'next/link'

export default function PendingValidationPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-200 rounded-2xl" />
          <div className="w-32 h-4 bg-orange-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
        </div>

        {/* Carte principale */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* En-tête coloré */}
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 p-6 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-10 w-10 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-white">Inscription réussie !</h1>
            <p className="text-white/90 mt-2">Votre compte est en attente de validation</p>
          </div>

          <CardContent className="p-8">
            {/* Message principal */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Merci pour votre inscription ! Notre équipe examine votre demande et vous recevrez 
                une notification par email dès que votre compte sera validé.
              </p>
            </div>

            {/* Étapes du processus */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Demande envoyée</p>
                  <p className="text-gray-500 text-sm">Votre demande a bien été reçue</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">En cours de vérification</p>
                  <p className="text-gray-500 text-sm">Notre équipe examine votre dossier</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Notification par email</p>
                  <p className="text-gray-500 text-sm">Vous serez informé de la décision</p>
                </div>
              </div>
            </div>

            {/* Temps estimé */}
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Délai de traitement estimé : <span className="text-orange-600 font-bold">24 à 48 heures</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/')}
                className="w-full h-12 bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 hover:from-orange-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>

              <Button
                variant="outline"
                asChild
                className="w-full h-12 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-semibold"
              >
                <a 
                  href="https://wa.me/221784858226?text=Bonjour%20OKAR%2C%20je%20souhaite%20connaitre%20le%20statut%20de%20ma%20demande%20d%27inscription." 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter le support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Des questions ? Contactez-nous à{' '}
            <a href="mailto:support@okar.sn" className="text-orange-600 hover:text-orange-700 font-medium">
              support@okar.sn
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
