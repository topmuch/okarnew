/**
 * OKAR - Page Publique QR Code
 * 
 * URL: /q/OKAR-XXXXXXXX
 * 
 * Cette page est accessible publiquement en scannant un QR code OKAR.
 * Elle affiche:
 * - Si QR en stock: Formulaire d'activation (nouveau véhicule)
 * - Si QR actif: Informations du véhicule (teasing) + bouton pour voir plus
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  QrCode,
  Car,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Gauge,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

interface QRCodeData {
  found: boolean
  code: string
  type: 'garage' | 'particulier'
  status: 'stock' | 'active' | 'lost'
  vehicle?: {
    plateNumber: string
    brand: string
    model: string
    year: number | null
    color: string | null
    mileage: number
    healthScore: number
  }
  garage?: {
    id: string
    businessName: string
    city: string
  }
}

export default function QRCodePublicPage() {
  const params = useParams()
  const router = useRouter()
  const code = params?.code as string

  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Formulaire d'activation
  const [activating, setActivating] = useState(false)
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    plateNumber: '',
    brand: '',
    model: '',
    year: '',
  })

  // Charger les infos du QR code
  useEffect(() => {
    if (!code) return

    const fetchQRData = async () => {
      try {
        const response = await fetch(`/api/public/qrcode?code=${encodeURIComponent(code)}`)
        const data = await response.json()

        if (data.found) {
          setQrData(data)
        } else {
          setError(data.message || 'QR code non trouvé')
        }
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur lors de la vérification du QR code')
      } finally {
        setLoading(false)
      }
    }

    fetchQRData()
  }, [code])

  // Activer le QR code (nouveau véhicule)
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setActivating(true)

    try {
      const response = await fetch('/api/public/qrcode/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          ...formData,
          year: formData.year ? parseInt(formData.year) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Rediriger vers l'inscription pour créer un compte
        router.push(`/register?vehicleId=${data.vehicleId}&qrCode=${code}`)
      } else {
        setError(data.error || 'Erreur lors de l\'activation')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors de l\'activation')
    } finally {
      setActivating(false)
    }
  }

  // Spinner de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-pink-200 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500 rounded-full border-t-transparent animate-spin" />
            <QrCode className="absolute inset-0 m-auto h-8 w-8 text-pink-500" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Vérification du QR code...</p>
        </div>
      </div>
    )
  }

  // Erreur
  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">QR Code Invalide</h1>
            <p className="text-gray-600 mb-6">{error || 'Ce QR code n\'existe pas ou a été désactivé.'}</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // QR Code actif - Afficher infos véhicule
  if (qrData.status === 'active' && qrData.vehicle) {
    const v = qrData.vehicle
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                OKAR
              </span>
            </Link>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Certifié OKAR
            </Badge>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Badge QR Code */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              {qrData.code}
            </div>
          </div>

          {/* Carte véhicule */}
          <Card className="border-0 shadow-xl overflow-hidden">
            {/* Header coloré selon score santé */}
            <div className={`h-2 ${
              v.healthScore >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              v.healthScore >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
              'bg-gradient-to-r from-red-400 to-rose-500'
            }`} />

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{v.plateNumber}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {v.brand} {v.model} {v.year ? `(${v.year})` : ''}
                  </CardDescription>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    v.healthScore >= 70 ? 'text-green-500' :
                    v.healthScore >= 40 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {v.healthScore}
                  </div>
                  <p className="text-xs text-gray-500">Score Santé</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Infos */}
              <div className="grid grid-cols-2 gap-4">
                {v.color && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span>{v.color}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Gauge className="h-4 w-4 text-gray-400" />
                  <span>{v.mileage.toLocaleString()} km</span>
                </div>
              </div>

              <Separator />

              {/* Garage */}
              {qrData.garage && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Suivi par</p>
                  <p className="font-semibold text-gray-900">{qrData.garage.businessName}</p>
                  <p className="text-sm text-gray-500">{qrData.garage.city}</p>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Historique complet</h3>
                    <p className="text-sm text-gray-600">Voir toutes les interventions</p>
                  </div>
                  <Link href="/login">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Lock className="h-4 w-4 mr-2" />
                      Accéder
                    </Button>
                  </Link>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Ce véhicule est suivi par OKAR depuis sa création
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // QR Code en stock - Formulaire d'activation
  if (qrData.status === 'stock') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                OKAR
              </span>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-xl">
          {/* Badge */}
          <div className="text-center mb-6">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-base px-4 py-1">
              <QrCode className="h-4 w-4 mr-2" />
              {qrData.code}
            </Badge>
            <p className="mt-2 text-gray-500 text-sm">
              QR Code {qrData.type === 'garage' ? 'Garage' : 'Particulier'} • En attente d'activation
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Activer votre véhicule</CardTitle>
              <CardDescription>
                Créez le passeport numérique de votre véhicule en quelques minutes
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleActivate} className="space-y-4">
                {/* Infos propriétaire */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Vos informations
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-sm text-gray-600">Nom complet *</Label>
                      <Input
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="Amadou Diouf"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Email *</Label>
                      <Input
                        type="email"
                        value={formData.ownerEmail}
                        onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                        placeholder="email@exemple.com"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Téléphone *</Label>
                      <Input
                        value={formData.ownerPhone}
                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                        placeholder="77 123 45 67"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Infos véhicule */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Informations du véhicule
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-sm text-gray-600">Numéro de plaque *</Label>
                      <Input
                        value={formData.plateNumber}
                        onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                        placeholder="AA-1234-AA"
                        required
                        className="mt-1 font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Marque *</Label>
                      <Input
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Toyota"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Modèle *</Label>
                      <Input
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="Corolla"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Année</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="2019"
                        min="1900"
                        max={new Date().getFullYear()}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={activating}
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-lg font-semibold shadow-lg"
                >
                  {activating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Activation en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Activer mon véhicule
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  En activant ce QR code, vous acceptez les conditions d'utilisation OKAR
                </p>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // QR Code perdu
  if (qrData.status === 'lost') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">QR Code Signalé Perdu</h1>
            <p className="text-gray-600 mb-6">
              Ce QR code a été signalé comme perdu. Si vous l'avez retrouvé, contactez le support.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
