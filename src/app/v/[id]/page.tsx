/**
 * OKAR - Page Passeport Numérique Véhicule "WAHOU DIGITAL PASS"
 * 
 * URL: /v/[vehicleId]
 * 
 * Design: Premium, Luxueux, Mobile First
 * Style: Apple CarPlay / Application de Luxe
 * Effet: "WAHOU" immédiat - Confiance absolue en 5 secondes
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
  Download,
  ChevronRight,
  BadgeCheck,
  AlertCircle,
  Building2,
  Sparkles,
  Users,
  Award,
  ExternalLink,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

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
    owners: number
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

// ============================================================================
// MOCK DATA RÉALISTE
// ============================================================================

const mockVehicleData: VehiclePassportData = {
  id: 'demo-vehicle-001',
  plateNumber: 'DK-123-AB',
  vehicle: {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2019,
    color: 'Blanc Nacré',
    mileage: 85000,
    vin: 'JTD****1234',
    fuel: 'Diesel',
    transmission: 'Automatique',
    owners: 1,
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

// ============================================================================
// INTERVENTION TYPES MAPPING
// ============================================================================

const interventionTypes: Record<string, { icon: typeof Car; gradient: string; bg: string }> = {
  oil_change: { icon: Fuel, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
  major_repair: { icon: Settings, gradient: 'from-red-400 to-rose-500', bg: 'bg-red-50' },
  accident: { icon: AlertTriangle, gradient: 'from-orange-400 to-red-500', bg: 'bg-orange-50' },
  inspection: { icon: FileText, gradient: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50' },
  tire_change: { icon: Car, gradient: 'from-purple-400 to-violet-500', bg: 'bg-purple-50' },
  battery: { icon: Settings, gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50' },
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VehiclePassportPage() {
  const params = useParams()
  const vehicleId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<VehiclePassportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [animateSections, setAnimateSections] = useState(false)

  useEffect(() => {
    if (!vehicleId) return

    const fetchVehicleData = async () => {
      try {
        if (vehicleId === 'demo' || vehicleId.startsWith('demo-')) {
          await new Promise(resolve => setTimeout(resolve, 800))
          setData(mockVehicleData)
          setLoading(false)
          return
        }

        const response = await fetch(`/api/public/vehicle/${vehicleId}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.message || 'Véhicule non trouvé')
        }
      } catch (err) {
        console.error('Erreur:', err)
        setData(mockVehicleData)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleData()
  }, [vehicleId])

  // Déclencher les animations après chargement
  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => setAnimateSections(true), 100)
      return () => clearTimeout(timer)
    }
  }, [loading, data])

  // ============================================================================
  // LOADING SCREEN
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            {/* Anneau extérieur */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            {/* Anneau animé */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
            {/* Icône centrale */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-400 font-medium text-sm tracking-wide">
            Vérification du passeport...
          </p>
        </div>
      </div>
    )
  }

  // ============================================================================
  // ERROR SCREEN
  // ============================================================================

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Passeport introuvable
            </h1>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              {error || 'Ce véhicule n\'existe pas dans notre base de données.'}
            </p>
            <Link href="/">
              <button className="w-full py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform">
                Retour à l'accueil
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { vehicle, trustScore, documents, accidents, recentHistory, garage, qrCode } = data

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* ========== CSS ANIMATIONS ========== */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4),
                        0 0 40px rgba(16, 185, 129, 0.2),
                        0 0 60px rgba(16, 185, 129, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6),
                        0 0 60px rgba(16, 185, 129, 0.3),
                        0 0 90px rgba(16, 185, 129, 0.15);
          }
        }
        
        @keyframes glow-amber {
          0%, 100% {
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.4),
                        0 0 40px rgba(245, 158, 11, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.6),
                        0 0 60px rgba(245, 158, 11, 0.3);
          }
        }
        
        @keyframes glow-red {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4),
                        0 0 40px rgba(239, 68, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6),
                        0 0 60px rgba(239, 68, 68, 0.3);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes status-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-glow-emerald {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        .animate-glow-amber {
          animation: glow-amber 2s ease-in-out infinite;
        }
        
        .animate-glow-red {
          animation: glow-red 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-status-pulse {
          animation: status-pulse 2s ease-in-out infinite;
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        
        .font-display {
          font-family: 'Playfair Display', Georgia, serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
        }
      `}</style>

      {/* ========== SECTION 1: HERO IMMERSIF ========== */}
      <header className="relative">
        {/* Photo du véhicule - 40% de l'écran */}
        <div className="h-[40vh] min-h-[280px] max-h-[360px] relative overflow-hidden">
          {/* Image placeholder avec gradient élégant */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <Car className="w-32 h-32 text-white/20" />
            </div>
            {/* Overlay gradient vers le bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Effet shimmer */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ 
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            />
          </div>
          
          {/* Logo OKAR flottant */}
          <Link 
            href="/"
            className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg shadow-black/5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
          
          {/* Badge "Certifié" en haut à droite */}
          <div className="absolute top-4 right-4 z-30 animate-float">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-gray-700">Certifié</span>
            </div>
          </div>
        </div>

        {/* CARTE PLaque + BADGE FLOTTANTE */}
        <div className="relative z-20 px-4 -mt-20">
          <div className={`
            bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-5
            ${animateSections ? 'animate-fade-in-up' : 'opacity-0'}
          `}>
            {/* Plaque d'immatriculation style officiel */}
            <div className="relative mb-4">
              <div className="bg-white border-[3px] border-black rounded-xl px-6 py-4 shadow-lg">
                <p className="text-center font-mono text-3xl font-bold tracking-wider text-black">
                  {data.plateNumber}
                </p>
              </div>
              {/* Effet de brillance sur la plaque */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-xl pointer-events-none" />
            </div>
            
            {/* Marque / Modèle / Année */}
            <div className="text-center mb-4">
              <h1 className="font-display text-2xl font-bold text-gray-900">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-gray-400 font-medium">{vehicle.year || '—'}</p>
            </div>
            
            {/* BADGE DE CONFIANCE AVEC GLOW */}
            <div className="flex justify-center">
              <div className={`
                relative flex items-center gap-3 px-5 py-3 rounded-2xl
                ${trustScore.score >= 80 ? 'bg-emerald-50 animate-glow-emerald' :
                  trustScore.score >= 50 ? 'bg-amber-50 animate-glow-amber' :
                  'bg-red-50 animate-glow-red'}
              `}>
                {/* Score */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  ${trustScore.score >= 80 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                    trustScore.score >= 50 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                    'bg-gradient-to-br from-red-400 to-red-600'}
                  shadow-lg
                `}>
                  <span className="text-white text-xl font-bold">{trustScore.score}</span>
                </div>
                <div>
                  <p className={`
                    text-lg font-bold
                    ${trustScore.score >= 80 ? 'text-emerald-700' :
                      trustScore.score >= 50 ? 'text-amber-700' : 'text-red-700'}
                  `}>
                    {trustScore.label}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Shield className={`w-4 h-4 ${
                      trustScore.score >= 80 ? 'text-emerald-500' :
                      trustScore.score >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`} />
                    <span className="text-sm text-gray-500">Véhicule Certifié</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== SECTION 2: ALERTES CRITIQUES (Feux Tricolores) ========== */}
      <section className={`
        px-4 mt-6
        ${animateSections ? 'animate-fade-in-up delay-100' : 'opacity-0'}
      `}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Documents Officiels
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Assurance */}
          <div className={`
            relative overflow-hidden rounded-2xl p-4
            ${documents.insurance.isValid 
              ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200/50' 
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200/50'}
            ${documents.insurance.isValid ? 'animate-status-pulse' : ''}
          `}>
            {/* Icône */}
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mb-3
              ${documents.insurance.isValid 
                ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30' 
                : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/30'}
            `}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            
            {/* Texte */}
            <p className="font-bold text-gray-900 text-sm mb-1">Assurance</p>
            <p className={`
              text-xs font-semibold
              ${documents.insurance.isValid ? 'text-emerald-600' : 'text-red-600'}
            `}>
              {documents.insurance.isValid ? 'VALIDE' : 'EXPIRÉE'}
            </p>
            {documents.insurance.expiryDate && (
              <p className="text-[10px] text-gray-400 mt-1">
                {documents.insurance.isValid ? 'jusqu\'au' : 'depuis le'} {formatDate(documents.insurance.expiryDate)}
              </p>
            )}
            
            {/* Check icon */}
            {documents.insurance.isValid && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            )}
          </div>

          {/* Contrôle Technique */}
          <div className={`
            relative overflow-hidden rounded-2xl p-4
            ${documents.technicalControl.isValid 
              ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200/50' 
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200/50'}
            ${documents.technicalControl.isValid ? 'animate-status-pulse delay-300' : ''}
          `}>
            {/* Icône */}
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mb-3
              ${documents.technicalControl.isValid 
                ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30' 
                : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/30'}
            `}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            
            {/* Texte */}
            <p className="font-bold text-gray-900 text-sm mb-1">Contrôle Tech.</p>
            <p className={`
              text-xs font-semibold
              ${documents.technicalControl.isValid ? 'text-emerald-600' : 'text-red-600'}
            `}>
              {documents.technicalControl.isValid ? 'VALIDE' : 'EXPIRÉ'}
            </p>
            {documents.technicalControl.expiryDate && (
              <p className="text-[10px] text-gray-400 mt-1">
                {documents.technicalControl.isValid ? 'jusqu\'au' : 'depuis le'} {formatDate(documents.technicalControl.expiryDate)}
              </p>
            )}
            
            {/* Check icon */}
            {documents.technicalControl.isValid && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            )}
          </div>
        </div>

        {/* Alerte Sinistres */}
        <div className={`
          mt-3 rounded-2xl p-4 flex items-center gap-4
          ${!accidents.hasAccidents 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50'}
        `}>
          <div className={`
            w-11 h-11 rounded-xl flex items-center justify-center
            ${!accidents.hasAccidents 
              ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
              : 'bg-gradient-to-br from-amber-400 to-orange-500'}
            shadow-lg
          `}>
            {!accidents.hasAccidents ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">
              {!accidents.hasAccidents ? 'Aucun accident déclaré' : `${accidents.count} accident(s) certifié(s)`}
            </p>
            <p className="text-xs text-gray-400">
              {!accidents.hasAccidents ? 'Historique vierge' : 'Réparations certifiées OKAR'}
            </p>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: DONNÉES CLÉS (Grille Bento) ========== */}
      <section className={`
        px-4 mt-6
        ${animateSections ? 'animate-fade-in-up delay-200' : 'opacity-0'}
      `}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Caractéristiques
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Kilométrage */}
          <div className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-100 border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Gauge className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="font-mono text-xl font-bold text-gray-900">
              {vehicle.mileage.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Kilomètres</p>
          </div>
          
          {/* Carburant */}
          <div className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-100 border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Fuel className="w-4.5 h-4.5 text-amber-600" />
              </div>
            </div>
            <p className="font-semibold text-lg text-gray-900">
              {vehicle.fuel || '—'}
            </p>
            <p className="text-xs text-gray-400">Carburant</p>
          </div>
          
          {/* Boîte de vitesse */}
          <div className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-100 border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                <Settings className="w-4.5 h-4.5 text-purple-600" />
              </div>
            </div>
            <p className="font-semibold text-lg text-gray-900">
              {vehicle.transmission || '—'}
            </p>
            <p className="text-xs text-gray-400">Transmission</p>
          </div>
          
          {/* Propriétaires */}
          <div className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-100 border border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-rose-600" />
              </div>
              {vehicle.owners === 1 && (
                <Award className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <p className="font-semibold text-lg text-gray-900">
              {vehicle.owners || 1}
            </p>
            <p className="text-xs text-gray-400">Propriétaire{vehicle.owners > 1 ? 's' : ''}</p>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: HISTORIQUE (Timeline Verticale) ========== */}
      <section className={`
        px-4 mt-6
        ${animateSections ? 'animate-fade-in-up delay-300' : 'opacity-0'}
      `}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Dernières interventions certifiées
        </h2>
        
        <div className="bg-white rounded-3xl shadow-sm shadow-gray-100 border border-gray-100/50 overflow-hidden">
          {/* Timeline */}
          <div className="relative p-4">
            {/* Ligne verticale */}
            <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-400 via-blue-400 to-purple-400 rounded-full" />
            
            {/* Points d'intervention */}
            <div className="space-y-0">
              {recentHistory.map((intervention, index) => {
                const typeInfo = interventionTypes[intervention.type] || { 
                  icon: FileText, 
                  gradient: 'from-gray-400 to-gray-500', 
                  bg: 'bg-gray-50' 
                }
                const Icon = typeInfo.icon
                
                return (
                  <div 
                    key={intervention.id}
                    className="relative flex items-start gap-4 py-3"
                  >
                    {/* Point coloré */}
                    <div className="relative z-10">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        bg-gradient-to-br ${typeInfo.gradient}
                        shadow-lg
                      `}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0 pb-3 border-b border-gray-100 last:border-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {intervention.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{formatDate(intervention.date)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-xs text-gray-400">{intervention.mileage.toLocaleString()} km</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {intervention.garageName}, {intervention.garageCity}
                      </p>
                    </div>
                    
                    {/* Badge certifié */}
                    <BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Bouton voir plus */}
          <button className="
            w-full p-4 flex items-center justify-center gap-2 
            bg-gradient-to-r from-gray-50 to-gray-100/50 
            text-gray-700 font-semibold text-sm
            border-t border-gray-100
            active:bg-gray-100 transition-colors
          ">
            <FileText className="w-4 h-4" />
            <span>Voir l'historique complet & Factures</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========== SECTION 5: GARAGE DE SUIVI ========== */}
      {garage && (
        <section className={`
          px-4 mt-6
          ${animateSections ? 'animate-fade-in-up delay-400' : 'opacity-0'}
        `}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Garage de suivi
          </h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-100 border border-gray-100/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{garage.name}</p>
                <p className="text-sm text-gray-400">{garage.city}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== FOOTER STICKY - ACTIONS ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 pb-6">
        <div className="max-w-lg mx-auto space-y-3">
          {/* Bouton principal - Dégradé OKAR */}
          <button className="
            w-full py-4 rounded-2xl font-bold text-white text-base
            bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500
            shadow-lg shadow-rose-500/30
            flex items-center justify-center gap-2
            active:scale-[0.98] transition-transform
          ">
            <Download className="w-5 h-5" />
            <span>Acheter le Rapport Complet (1 000 FCFA)</span>
          </button>
          
          {/* Bouton secondaire */}
          <button className="
            w-full py-3 rounded-2xl font-semibold text-gray-600 text-sm
            bg-gray-100 border border-gray-200
            flex items-center justify-center gap-2
            active:bg-gray-200 transition-colors
          ">
            <Phone className="w-4 h-4" />
            <span>Contacter le propriétaire</span>
          </button>
        </div>
      </div>

      {/* ========== SECTION ANTI-FRAUDE ========== */}
      <section className={`
        px-4 mt-6 mb-4
        ${animateSections ? 'animate-fade-in-up delay-500' : 'opacity-0'}
      `}>
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-start gap-4">
            {/* Mini QR Code avec style */}
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
              <div className="relative">
                <QrCode className="w-10 h-10 text-gray-300" />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded" />
              </div>
            </div>
            
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">Vérifier l'authenticité</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Scannez ce QR code pour vérifier que ce document est authentique sur okar.sn
              </p>
              <a 
                href="https://okar.sn" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2"
              >
                okar.sn
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          
          {/* Footer info */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-mono">{qrCode?.code || '—'}</span>
            <span>Généré le {formatDate(data.generatedAt)}</span>
          </div>
        </div>
        
        {/* Lien signaler */}
        <p className="text-center text-xs text-gray-400 mt-4">
          <a href="#" className="underline underline-offset-2">
            Signaler une erreur
          </a>
          {' • '}
          <a href="https://okar.sn" className="underline underline-offset-2">
            En savoir plus sur OKAR
          </a>
        </p>
      </section>
    </div>
  )
}

// ============================================================================
// UTILITIES
// ============================================================================

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
