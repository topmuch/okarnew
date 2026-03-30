/**
 * OKAR - Page de Paiement Rapport
 * 
 * Redirection WhatsApp pour paiement manuel
 * Design "Wahoo Multicolor" avec boutons Orange Money et Wave
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  Shield,
  CheckCircle,
  Phone,
  Loader2,
  FileText,
  Gauge,
  Battery,
  ArrowLeft,
  Lock,
  MessageCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

// Types
type PaymentMethod = 'orange' | 'wave'
type PaymentStep = 'summary' | 'pending'

// Données mockées du véhicule
const mockVehicleData = {
  plate: 'AA-1234-AA',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2019,
  color: 'Blanc',
  mileage: 125000,
  healthScore: 78,
  firstRegistration: '2019-03-15',
  owners: 2,
  ctStatus: 'valid',
  ctExpiry: '2025-06-15',
  lastInspection: '2024-06-15',
  history: [
    { date: '2024-10-15', type: 'Vidange', mileage: 120000, garage: 'Auto Service Express' },
    { date: '2024-08-20', type: 'Freins', mileage: 115000, garage: 'Garage Moderne' },
    { date: '2024-05-10', type: 'Vidange', mileage: 105000, garage: 'Auto Service Express' },
    { date: '2024-02-28', type: 'Carrosserie', mileage: 98000, garage: 'Carrosserie Plus' },
    { date: '2023-11-15', type: 'Pneus', mileage: 90000, garage: 'Pneus Express' },
  ],
  issues: [],
}

// Configuration WhatsApp
const WHATSAPP_NUMBER = '221784858226'

function ReportPageContent() {
  const searchParams = useSearchParams()
  const plate = searchParams.get('plate') || 'AA-1234-AA'
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange')
  const [step, setStep] = useState<PaymentStep>('summary')
  const [mounted, setMounted] = useState(false)
  const [redirectTime, setRedirectTime] = useState(5)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Compte à rebours pour la redirection automatique
  useEffect(() => {
    if (step === 'pending' && redirectTime > 0) {
      const timer = setTimeout(() => setRedirectTime(redirectTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, redirectTime])

  /**
   * Fonction de redirection vers WhatsApp
   * Construit l'URL WhatsApp avec message pré-rempli
   */
  const handlePaymentRedirect = (plateNumber: string, method: PaymentMethod) => {
    const paymentMethodName = method === 'orange' ? 'Orange Money' : 'Wave'
    
    // Construire le message
    const message = `Bonjour OKAR, je souhaite acheter le rapport historique pour le véhicule immatriculé ${plateNumber}. Je souhaite payer via ${paymentMethodName}. Merci de me confirmer la procédure.`
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message)
    
    // Construire l'URL WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank')
    
    // Passer à l'étape "en attente"
    setStep('pending')
  }

  // Gérer le clic sur le bouton de paiement
  const handlePaymentClick = () => {
    handlePaymentRedirect(plate, paymentMethod)
  }

  // État: En attente de validation (après redirection WhatsApp)
  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
          <CardContent className="p-8 text-center">
            {/* Icône WhatsApp animée */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Message envoyé sur WhatsApp!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Notre équipe vous répondra dans les plus brefs délais pour finaliser votre paiement 
              et vous envoyer votre rapport pour le véhicule <span className="font-mono font-bold">{plate}</span>.
            </p>

            {/* Info box */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-green-800 font-medium">Délai de réponse</p>
                  <p className="text-green-600 text-sm">Généralement moins de 30 minutes pendant les heures ouvrées</p>
                </div>
              </div>
            </div>

            {/* Infos de contact */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-gray-500 text-sm mb-2">Contact WhatsApp OKAR</p>
              <p className="text-gray-900 font-mono font-bold">+221 78 485 82 26</p>
            </div>

            {/* Boutons */}
            <div className="space-y-3">
              <Button 
                onClick={() => setStep('summary')}
                variant="outline"
                className="w-full rounded-2xl h-12 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Link href="/" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 hover:opacity-90 text-white h-12 rounded-2xl shadow-lg"
                >
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // État: Résumé et sélection du mode de paiement
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
          <Badge className="bg-green-100 text-green-700 border-0">
            <MessageCircle className="h-3 w-3 mr-1" />
            Paiement via WhatsApp
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Résumé du véhicule */}
        <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 font-serif">Rapport Complet</CardTitle>
                <CardDescription>Véhicule {plate}</CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 text-lg px-4 py-2">
                1 000 FCFA
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Infos véhicule */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Car className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{mockVehicleData.brand} {mockVehicleData.model}</h3>
                    <p className="text-gray-600">{mockVehicleData.year} • {mockVehicleData.color}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm font-medium">Kilométrage</span>
                    </div>
                    <p className="text-green-700 font-bold mt-1">{mockVehicleData.mileage.toLocaleString()} km</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Battery className="h-4 w-4" />
                      <span className="text-sm font-medium">Score Santé</span>
                    </div>
                    <p className="text-blue-700 font-bold mt-1">{mockVehicleData.healthScore}/100</p>
                  </div>
                </div>
              </div>
              
              {/* Ce que contient le rapport */}
              <div className="p-4 bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Ce rapport contient:
                </h4>
                <ul className="space-y-2">
                  {[
                    'Historique complet des interventions',
                    'Graphique d\'évolution du kilométrage',
                    'Photos des interventions certifiées',
                    'Score de confiance OKAR',
                    'Liste des propriétaires précédents',
                    'Alertes et recommandations',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Méthodes de paiement */}
        <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden ${mounted ? 'animate-slide-up animation-delay-200' : 'opacity-0'}`}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Choisir le mode de paiement
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Vous serez redirigé vers WhatsApp pour finaliser le paiement
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Orange Money */}
            <button
              onClick={() => setPaymentMethod('orange')}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                paymentMethod === 'orange' 
                  ? 'border-[#FF7900] bg-orange-50 shadow-lg shadow-orange-500/10' 
                  : 'border-gray-200 hover:border-[#FF7900]/50'
              }`}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #E65C00 100%)' }}
              >
                OM
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-900">Orange Money</h4>
                <p className="text-gray-500 text-sm">Payez avec Orange Money via WhatsApp</p>
              </div>
              {paymentMethod === 'orange' && (
                <CheckCircle className="h-6 w-6" style={{ color: '#FF7900' }} />
              )}
            </button>

            {/* Wave */}
            <button
              onClick={() => setPaymentMethod('wave')}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                paymentMethod === 'wave' 
                  ? 'border-[#1DC4F5] bg-cyan-50 shadow-lg shadow-cyan-500/10' 
                  : 'border-gray-200 hover:border-[#1DC4F5]/50'
              }`}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1DC4F5 0%, #0095D9 100%)' }}
              >
                W
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-900">Wave</h4>
                <p className="text-gray-500 text-sm">Payez avec Wave via WhatsApp</p>
              </div>
              {paymentMethod === 'wave' && (
                <CheckCircle className="h-6 w-6" style={{ color: '#1DC4F5' }} />
              )}
            </button>

            {/* Info WhatsApp */}
            <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-green-800 font-medium">Paiement via WhatsApp</p>
                  <p className="text-green-600 text-sm">Un message pré-rempli sera envoyé à notre équipe</p>
                </div>
              </div>
            </div>

            {/* Bouton de paiement */}
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handlePaymentClick}
                className={`w-full h-14 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
                  paymentMethod === 'orange'
                    ? 'bg-gradient-to-r from-[#FF7900] to-[#E65C00] hover:from-[#E65C00] hover:to-[#CC5200] shadow-orange-500/25'
                    : 'bg-gradient-to-r from-[#1DC4F5] to-[#0095D9] hover:from-[#0095D9] hover:to-[#0077B5] shadow-cyan-500/25'
                } text-white`}
              >
                <MessageCircle className="h-5 w-5" />
                <span>
                  Payer 1 000 FCFA via {paymentMethod === 'orange' ? 'Orange Money' : 'Wave'}
                </span>
              </Button>
              
              <Link href="/" className="w-full">
                <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900 rounded-2xl h-12">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Annuler et retour
                </Button>
              </Link>
            </div>

            {/* Sécurité */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="h-5 w-5 text-green-500" />
                <div className="text-sm">
                  <span className="font-medium">Paiement 100% sécurisé</span>
                  <span className="text-gray-500 ml-1">• Transaction validée manuellement par OKAR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Animations CSS */}
      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  )
}
