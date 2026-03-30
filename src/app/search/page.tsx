/**
 * OKAR - Page de Recherche Publique
 * 
 * Permet de rechercher un véhicule par plaque et d'acheter un rapport complet.
 * - Résultat "Teasing" gratuit
 * - Paiement Orange Money / Wave
 * - Génération PDF du rapport
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Car,
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Loader2,
  ExternalLink,
  Clock,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  found: boolean
  plate?: string
  brand?: string
  model?: string
  year?: number
  color?: string
  mileage?: number
  healthScore?: number
  lastCTDate?: string
  insuranceValid?: boolean
  totalInterventions?: number
  ownerHistory?: number
  technicalControlStatus?: string
  insuranceStatus?: string
  followedByGarage?: boolean
  garageCity?: string
  trackedSince?: string
  estimatedValue?: number
  resaleScore?: number
  qrType?: string
}

export default function SearchPage() {
  const [plate, setPlate] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'orange' | 'wave' | 'card' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plate.trim()) return

    setIsSearching(true)
    setResult(null)

    try {
      const response = await fetch(`/api/public/search?plate=${encodeURIComponent(plate)}`)
      const data = await response.json()

      if (data.found) {
        setResult({
          found: true,
          plate: data.plate,
          brand: data.brand,
          model: data.model,
          year: data.year,
          color: data.color,
          mileage: data.mileage,
          healthScore: data.healthScore,
          lastCTDate: data.technicalControlStatus === 'valid' ? 'Valide' : 'À vérifier',
          insuranceValid: data.insuranceStatus === 'valid',
          totalInterventions: data.totalInterventions || 0,
          ownerHistory: (data.previousOwners || 0) + 1,
          followedByGarage: data.followedByGarage,
          garageCity: data.garageCity,
          trackedSince: data.trackedSince,
          estimatedValue: data.estimatedValue,
          resaleScore: data.resaleScore,
          qrType: data.qrType,
        })
      } else {
        setResult({ found: false })
      }
    } catch (error) {
      console.error('Erreur de recherche:', error)
      setResult({ found: false })
    } finally {
      setIsSearching(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentMethod) return

    setIsProcessing(true)
    // Simulation de paiement
    setTimeout(() => {
      setIsProcessing(false)
      setShowPayment(false)
      // Ici on téléchargerait le PDF
      alert('Paiement réussi! Le rapport PDF sera téléchargé.')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                Inscription
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vérifiez un Véhicule
            </h1>
            <p className="text-gray-600">
              Entrez un numéro de plaque pour obtenir des informations sur le véhicule.
              Résultat teaser gratuit, rapport complet à 1 000 FCFA.
            </p>
          </div>

          {/* Formulaire de recherche */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Entrez la plaque (ex: AA-1234-AA)"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="h-12 text-lg flex-1"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Résultat */}
          {result && (
            <div className="mt-8">
              {result.found ? (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                  {/* Header coloré */}
                  <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{result.plate}</CardTitle>
                        <CardDescription className="text-lg">
                          {result.brand} {result.model} ({result.year})
                        </CardDescription>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          (result.healthScore || 0) >= 70 ? 'text-green-500' :
                          (result.healthScore || 0) >= 40 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {result.healthScore}
                        </div>
                        <p className="text-gray-500 text-sm">Score Santé</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Infos teasing */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">Couleur</p>
                        <p className="font-medium text-gray-900">{result.color}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">Kilométrage</p>
                        <p className="font-medium text-gray-900">{result.mileage?.toLocaleString()} km</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">Interventions</p>
                        <p className="font-medium text-gray-900">{result.totalInterventions}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">Propriétaires</p>
                        <p className="font-medium text-gray-900">{result.ownerHistory}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Suivi par OKAR
                      </Badge>
                      {result.insuranceValid ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          <Shield className="h-3 w-3 mr-1" />
                          Assurance valide
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Assurance expirée
                        </Badge>
                      )}
                      <Badge className="bg-purple-100 text-purple-700">
                        <Clock className="h-3 w-3 mr-1" />
                        CT: {result.lastCTDate}
                      </Badge>
                    </div>

                    <Separator />

                    {/* CTA Rapport complet */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Rapport Complet Style Carfax
                          </h3>
                          <ul className="space-y-1 text-gray-600 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Historique complet des interventions
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Graphique d'évolution du kilométrage
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Preuves photos et factures
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Historique des propriétaires
                            </li>
                          </ul>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">1 000</p>
                          <p className="text-gray-500">FCFA</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowPayment(true)}
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Acheter le Rapport Complet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Aucun véhicule trouvé
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Le numéro de plaque <strong>{plate}</strong> n'est pas enregistré dans notre base de données.
                    </p>
                    <p className="text-gray-500 text-sm">
                      Ce véhicule n'a peut-être jamais été suivi par un garage OKAR partenaire.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Paiement */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Paiement du Rapport</DialogTitle>
            <DialogDescription>
              Choisissez votre méthode de paiement pour le rapport complet de {result?.plate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={paymentMethod === 'orange' ? 'default' : 'outline'}
                className={`h-20 flex-col ${paymentMethod === 'orange' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                onClick={() => setPaymentMethod('orange')}
              >
                <span className="text-2xl mb-1">🟠</span>
                Orange Money
              </Button>
              <Button
                variant={paymentMethod === 'wave' ? 'default' : 'outline'}
                className={`h-20 flex-col ${paymentMethod === 'wave' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                onClick={() => setPaymentMethod('wave')}
              >
                <span className="text-2xl mb-1">🔵</span>
                Wave
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className={`h-20 flex-col ${paymentMethod === 'card' ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <span className="text-2xl mb-1">💳</span>
                Carte
              </Button>
            </div>

            {paymentMethod && (
              <div className="space-y-4">
                <Separator />
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rapport complet</span>
                    <span className="font-bold">1 000 FCFA</span>
                  </div>
                </div>
                <Button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Payer et Télécharger
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
