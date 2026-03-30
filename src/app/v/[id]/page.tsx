/**
 * OKAR - Page Publique Passeport Numérique Véhicule
 * 
 * URL: /v/[vehicleId]
 * 
 * Cette page s'affiche quand on scanne un QR Code OKAR collé sur une voiture.
 * Accessible SANS CONNEXION, ultra-rapide, inspire une confiance absolue.
 * 
 * Design: Mobile First, professionnel, rassurant, transparent.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Car,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  FileText,
  Clock,
  MapPin,
  QrCode,
  Phone,
  MessageCircle,
  Download,
  ChevronRight,
  Loader2,
  BadgeCheck,
  AlertCircle,
  Building2,
} from 'lucide-react'

// Types pour les données du passeport
interface VehiclePassportData {
  id: string
  plateNumber: string
  vehicle: {
    brand: string
    model: string
    year: number | null
    color: string | null
    mileage: number
    vin: string | null
    fuel: string | null
    transmission: string | null
  }
  trustScore: {
    score: number
    label: string
    color: string
  }
  documents: {
    insurance: {
      status: string
      expiryDate: string | null
      daysRemaining: number | null
      isValid: boolean
    }
    technicalControl: {
      status: string
      expiryDate: string | null
      daysRemaining: number | null
      isValid: boolean
    }
  }
  accidents: {
    count: number
    hasAccidents: boolean
    lastAccidentDate: string | null
  }
  recentHistory: Array<{
    id: string
    type: string
    title: string
    date: string
    mileage: number
    garageName: string
    garageCity: string
  }>
  garage: {
    name: string
    city: string
    address: string
  } | null
  qrCode: {
    code: string
    activatedAt: string | null
  } | null
  stats: {
    estimatedValue: number
    resaleScore: number
  } | null
  generatedAt: string
  pageUrl: string
}

// Données mock pour la démo
const mockVehicleData: VehiclePassportData = {
  id: 'demo-vehicle-001',
  plateNumber: 'AA-1234-BB',
  vehicle: {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2019,
    color: 'Blanc',
    mileage: 85000,
    vin: 'JTD****1234',
    fuel: 'Diesel',
    transmission: 'Automatique',
  },
  trustScore: {
    score: 92,
    label: 'Excellent',
    color: 'emerald',
  },
  documents: {
    insurance: {
      status: 'valid',
      expiryDate: '2025-12-15',
      daysRemaining: 260,
      isValid: true,
    },
    technicalControl: {
      status: 'valid',
      expiryDate: '2025-06-20',
      daysRemaining: 82,
      isValid: true,
    },
  },
  accidents: {
    count: 0,
    hasAccidents: false,
    lastAccidentDate: null,
  },
  recentHistory: [
    {
      id: '1',
      type: 'oil_change',
      title: 'Vidange moteur complète',
      date: '2024-03-15',
      mileage: 83500,
      garageName: 'Auto Service Plus',
      garageCity: 'Dakar',
    },
    {
      id: '2',
      type: 'inspection',
      title: 'Contrôle périodique',
      date: '2024-01-20',
      mileage: 81200,
      garageName: 'Auto Service Plus',
      garageCity: 'Dakar',
    },
    {
      id: '3',
      type: 'tire_change',
      title: 'Remplacement pneus avant',
      date: '2023-11-10',
      mileage: 78500,
      garageName: 'Pneu Service Dakar',
      garageCity: 'Dakar',
    },
  ],
  garage: {
    name: 'Auto Service Plus',
    city: 'Dakar',
    address: 'Route de Rufisque, Dakar',
  },
  qrCode: {
    code: 'OKAR-2024-DEMO',
    activatedAt: '2023-01-15',
  },
  stats: {
    estimatedValue: 8500000,
    resaleScore: 88,
  },
  generatedAt: new Date().toISOString(),
  pageUrl: 'https://okar.sn/v/demo-vehicle-001',
}

// Mapping des types d'intervention vers les icônes et couleurs
const interventionTypes: Record<string, { icon: typeof Car; color: string; label: string }> = {
  oil_change: { icon: Fuel, color: 'text-amber-500', label: 'Vidange' },
  major_repair: { icon: Settings, color: 'text-red-500', label: 'Réparation' },
  accident: { icon: AlertTriangle, color: 'text-orange-500', label: 'Accident' },
  inspection: { icon: FileText, color: 'text-blue-500', label: 'Contrôle' },
  tire_change: { icon: Car, color: 'text-purple-500', label: 'Pneus' },
  battery: { icon: Settings, color: 'text-green-500', label: 'Batterie' },
}

export default function VehiclePassportPage() {
  const params = useParams()
  const vehicleId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<VehiclePassportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFullHistory, setShowFullHistory] = useState(false)

  useEffect(() => {
    if (!vehicleId) return

    const fetchVehicleData = async () => {
      try {
        // En mode démo, utiliser les données mock
        if (vehicleId === 'demo' || vehicleId.startsWith('demo-')) {
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 500))
          setData(mockVehicleData)
          setLoading(false)
          return
        }

        // Sinon, appeler l'API
        const response = await fetch(`/api/public/vehicle/${vehicleId}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.message || 'Véhicule non trouvé')
        }
      } catch (err) {
        console.error('Erreur:', err)
        // En cas d'erreur, utiliser les données mock pour la démo
        setData(mockVehicleData)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleData()
  }, [vehicleId])

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-emerald-100 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
            <Shield className="absolute inset-0 m-auto h-6 w-6 text-emerald-500" />
          </div>
          <p className="mt-4 text-gray-500 font-medium">Vérification du passeport...</p>
        </div>
      </div>
    )
  }

  // Écran d'erreur
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Passeport introuvable</h1>
          <p className="text-gray-500 mb-6">{error || 'Ce véhicule n\'existe pas dans notre base.'}</p>
          <Link href="/">
            <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl">
              Retour à l'accueil
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const { vehicle, trustScore, documents, accidents, recentHistory, garage, qrCode, stats } = data

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* ========== HEADER VISUEL ========== */}
      <header className="relative">
        {/* Logo OKAR */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/" className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
        </div>

        {/* Image de couverture simulée */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-24 h-24 text-slate-400/50" />
          </div>
          {/* Overlay gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900/60 to-transparent" />
        </div>

        {/* Carte Plaque + Badge (sur l'image) */}
        <div className="absolute bottom-0 left-4 right-4 transform translate-y-1/2 z-10">
          <div className="bg-white rounded-2xl shadow-xl p-4">
            {/* Plaque d'immatriculation */}
            <div className="bg-white border-3 border-black rounded-lg px-4 py-3 mb-3">
              <p className="text-center font-mono text-2xl md:text-3xl font-bold tracking-wider text-black">
                {data.plateNumber}
              </p>
            </div>

            {/* Badge de confiance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  trustScore.color === 'emerald' ? 'bg-emerald-100' :
                  trustScore.color === 'green' ? 'bg-green-100' :
                  trustScore.color === 'amber' ? 'bg-amber-100' :
                  trustScore.color === 'orange' ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <span className={`text-lg font-bold ${
                    trustScore.color === 'emerald' ? 'text-emerald-600' :
                    trustScore.color === 'green' ? 'text-green-600' :
                    trustScore.color === 'amber' ? 'text-amber-600' :
                    trustScore.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {trustScore.score}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-bold ${
                    trustScore.color === 'emerald' ? 'text-emerald-600' :
                    trustScore.color === 'green' ? 'text-green-600' :
                    trustScore.color === 'amber' ? 'text-amber-600' :
                    trustScore.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    Score {trustScore.score}/100
                  </p>
                  <p className="text-xs text-gray-500">{trustScore.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">Certifié OKAR</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== CONTENU PRINCIPAL ========== */}
      <main className="pt-28 pb-8 px-4 max-w-lg mx-auto">
        
        {/* ========== FICHE TECHNIQUE ========== */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Fiche technique
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
              {/* Marque / Modèle */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Véhicule</span>
                </div>
                <p className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</p>
              </div>
              
              {/* Année */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Année</span>
                </div>
                <p className="font-semibold text-gray-900">{vehicle.year || '—'}</p>
              </div>
              
              {/* Kilométrage */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Kilométrage</span>
                </div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>
              
              {/* Carburant / Boîte */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Fuel className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Carburant</span>
                </div>
                <p className="font-semibold text-gray-900">{vehicle.fuel || '—'}</p>
              </div>
            </div>
            
            {/* Couleur et Transmission */}
            <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
              <div className="p-4">
                <span className="text-xs text-gray-400">Couleur</span>
                <p className="font-semibold text-gray-900 mt-1">{vehicle.color || '—'}</p>
              </div>
              <div className="p-4">
                <span className="text-xs text-gray-400">Transmission</span>
                <p className="font-semibold text-gray-900 mt-1">{vehicle.transmission || '—'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== ALERTES CRITIQUES ========== */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Documents officiels
          </h2>
          
          <div className="space-y-3">
            {/* Assurance */}
            <div className={`rounded-2xl p-4 border-2 ${
              documents.insurance.isValid 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    documents.insurance.isValid ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      documents.insurance.isValid ? 'text-emerald-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Assurance</p>
                    <p className={`text-sm ${
                      documents.insurance.isValid ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {documents.insurance.status === 'valid' && documents.insurance.expiryDate && (
                        <>Valide jusqu'au {formatDate(documents.insurance.expiryDate)}</>
                      )}
                      {documents.insurance.status === 'expiring_soon' && documents.insurance.expiryDate && (
                        <>Expire le {formatDate(documents.insurance.expiryDate)} ({documents.insurance.daysRemaining}j)</>
                      )}
                      {documents.insurance.status === 'expired' && (
                        <>EXPIRÉE</>
                      )}
                      {documents.insurance.status === 'unknown' && (
                        <>Non renseignée</>
                      )}
                    </p>
                  </div>
                </div>
                {documents.insurance.isValid ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>

            {/* Contrôle Technique */}
            <div className={`rounded-2xl p-4 border-2 ${
              documents.technicalControl.isValid 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    documents.technicalControl.isValid ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      documents.technicalControl.isValid ? 'text-emerald-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Contrôle Technique</p>
                    <p className={`text-sm ${
                      documents.technicalControl.isValid ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {documents.technicalControl.status === 'valid' && documents.technicalControl.expiryDate && (
                        <>Valide jusqu'au {formatDate(documents.technicalControl.expiryDate)}</>
                      )}
                      {documents.technicalControl.status === 'expiring_soon' && documents.technicalControl.expiryDate && (
                        <>Expire le {formatDate(documents.technicalControl.expiryDate)} ({documents.technicalControl.daysRemaining}j)</>
                      )}
                      {documents.technicalControl.status === 'expired' && (
                        <>EXPIRÉ</>
                      )}
                      {documents.technicalControl.status === 'unknown' && (
                        <>Non renseigné</>
                      )}
                    </p>
                  </div>
                </div>
                {documents.technicalControl.isValid ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>

            {/* Sinistres */}
            <div className={`rounded-2xl p-4 border-2 ${
              !accidents.hasAccidents 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    !accidents.hasAccidents ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      !accidents.hasAccidents ? 'text-emerald-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sinistres</p>
                    <p className={`text-sm ${
                      !accidents.hasAccidents ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {!accidents.hasAccidents 
                        ? 'Aucun accident déclaré' 
                        : `${accidents.count} accident${accidents.count > 1 ? 's' : ''} réparé${accidents.count > 1 ? 's' : ''} certifié${accidents.count > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                </div>
                {!accidents.hasAccidents ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========== HISTORIQUE RÉCENT ========== */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Dernières interventions certifiées
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Timeline */}
            <div className="divide-y divide-gray-100">
              {recentHistory.map((intervention, index) => {
                const typeInfo = interventionTypes[intervention.type] || { icon: FileText, color: 'text-gray-500', label: 'Intervention' }
                const Icon = typeInfo.icon
                
                return (
                  <div key={intervention.id} className="p-4 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{intervention.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <span>{formatDate(intervention.date)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{intervention.mileage.toLocaleString()} km</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {intervention.garageName}, {intervention.garageCity}
                      </p>
                    </div>
                    <BadgeCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  </div>
                )
              })}
            </div>
            
            {/* Bouton voir plus */}
            <button 
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="w-full p-4 flex items-center justify-center gap-2 text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors border-t border-gray-100"
            >
              <FileText className="w-4 h-4" />
              <span>Voir l'historique complet & Factures</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ========== GARAGE DE SUIVI ========== */}
        {garage && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Garage de suivi
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{garage.name}</p>
                  <p className="text-sm text-gray-500">{garage.city}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========== PIED DE PAGE - ACTIONS ========== */}
        <section className="space-y-3">
          {/* Bouton principal - Achat rapport */}
          <button className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:shadow-xl transition-shadow">
            <Download className="w-5 h-5" />
            <span>Acheter le rapport complet (1 000 FCFA)</span>
          </button>
          
          {/* Bouton secondaire - Contacter */}
          <button className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <Phone className="w-4 h-4" />
            <span>Contacter le propriétaire</span>
          </button>
        </section>

        {/* ========== SECTION ANTI-FRAUDE ========== */}
        <section className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              {/* Mini QR Code */}
              <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Vérifier l'authenticité</p>
                <p className="text-xs text-gray-500 mt-1">
                  Scannez ce QR code pour vérifier que ce document est authentique sur okar.sn
                </p>
                <Link href="https://okar.sn" className="text-xs text-emerald-600 font-medium mt-1 inline-block">
                  okar.sn →
                </Link>
              </div>
            </div>
            
            {/* Infos de génération */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
              <span>Code: {qrCode?.code || '—'}</span>
              <span>Généré le {formatDate(data.generatedAt)}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}
