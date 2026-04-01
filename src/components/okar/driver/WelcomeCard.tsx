/**
 * OKAR - Carte de Bienvenue pour Nouveaux Utilisateurs
 * 
 * Affichée quand l'utilisateur n'a pas encore de QR Code actif.
 * Invite l'utilisateur à acheter son premier QR Code.
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Sparkles, 
  CheckCircle, 
  Shield, 
  TrendingUp, 
  MessageCircle,
  ArrowRight,
  Star
} from 'lucide-react'

interface WelcomeCardProps {
  userName?: string | null
  onBuyQRCode?: () => void
}

export function WelcomeCard({ userName, onBuyQRCode }: WelcomeCardProps) {
  const firstName = userName?.split(' ')[0] || 'cher utilisateur'

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      `Bonjour OKAR, je souhaite acheter un QR Code pour mon véhicule. Merci de m'indiquer la procédure.`
    )
    window.open(`https://wa.me/221784858226?text=${message}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Carte principale de bienvenue */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        {/* En-tête coloré */}
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 p-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Bienvenue, {firstName} ! 🎉
          </h1>
          <p className="text-white/90">
            Commencez votre aventure OKAR
          </p>
        </div>

        <CardContent className="p-6">
          {/* Message explicatif */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg leading-relaxed">
              Pour profiter de tous les services OKAR et créer le passeport numérique 
              de votre véhicule, vous devez d'abord acquérir votre <strong>Pass QR Code</strong>.
            </p>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Historique Certifié</p>
                <p className="text-gray-500 text-xs">Traçabilité complète</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Valeur Optimisée</p>
                <p className="text-gray-500 text-xs">Meilleure revente</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Confiance</p>
                <p className="text-gray-500 text-xs">Acheteurs rassurés</p>
              </div>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="bg-gradient-to-r from-orange-50 via-pink-50 to-blue-50 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <QrCode className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-500 text-white border-0 animate-pulse">
                    <Star className="h-3 w-3 mr-1" />
                    Nouveau
                  </Badge>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Acheter mon QR Code
            </h2>
            <p className="text-gray-600 mb-4">
              Obtenez votre passeport numérique automobile en quelques minutes
            </p>

            <Button
              onClick={handleWhatsAppRedirect}
              className="h-14 px-8 bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 hover:from-orange-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg text-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Commander via WhatsApp
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <p className="text-gray-500 text-sm mt-4">
              Paiement sécurisé via <span className="text-[#FF7900] font-medium">Orange Money</span> ou{' '}
              <span className="text-[#1DC4F5] font-medium">Wave</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section FAQ */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Comment ça marche ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Commandez votre QR Code</p>
                <p className="text-gray-500 text-sm">Contactez-nous via WhatsApp pour passer votre commande</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Effectuez le paiement</p>
                <p className="text-gray-500 text-sm">Payez facilement via Orange Money ou Wave</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Activez votre véhicule</p>
                <p className="text-gray-500 text-sm">Scannez votre QR Code et enregistrez votre véhicule</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">Profitez d'OKAR !</p>
                <p className="text-gray-500 text-sm">Historique certifié, suivi d'entretien, valeur optimisée</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WelcomeCard
