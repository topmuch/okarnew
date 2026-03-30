/**
 * OKAR - Dashboard Driver Complet
 * 
 * Design "Lumineux & Coloré": Couleurs vives, interface claire
 * Modules: Santé Véhicule, Carnet d'Entretien, Actions & Validation, Urgence, Vente & Transfert
 * 
 * Mobile-first avec animations CSS
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { ProtectedRoute } from '@/components/okar/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Car, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Wrench,
  Sparkles,
  Download,
  FileText,
  Droplets,
  Settings,
  Zap,
  QrCode,
  Loader2,
  TrendingUp,
  Award,
  ChevronRight,
  BarChart3,
  DollarSign,
  Target
} from 'lucide-react'

// Import des composants OKAR
import {
  VehicleHealthCard,
  DueDatesCard,
  ConfidenceScore,
  MaintenanceTimeline,
  ValidationCenter,
  EmergencyButton,
  NearbyGarages,
  TransferCode,
  QRCodeDisplay,
  MileageChart,
  ConfettiEffect,
  DriverSidebar,
  VehicleValueCard,
  ResaleScoreCard,
  TCOCard,
  WelcomeCard
} from '@/components/okar/driver'

// Types
type HealthStatus = 'good' | 'warning' | 'critical'

interface Vehicle {
  id: string
  plateNumber: string
  brand: string
  model: string
  year?: number | null
  color?: string | null
  mileage: number
  healthScore: number
  qrCode: string | null
  insurance: {
    expiryDate: Date | string | null
    daysRemaining: number | null
    status: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
  }
  technicalControl: {
    date: Date | string | null
    daysRemaining: number | null
    status: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
  }
  oilChange: {
    nextDate: Date | string | null
    nextMileage: number | null
    daysRemaining: number | null
    status: 'ok' | 'due_soon' | 'overdue' | 'unknown'
  }
  alerts: Array<{
    id: string
    type: string
    message: string
    severity: string
    createdAt: Date | string
  }>
}

interface Health {
  score: number
  status: HealthStatus
  message: string
  factors: Array<{
    name: string
    impact: number
    status: 'good' | 'warning' | 'critical'
  }>
  maintenanceCount: number
  recentMaintenanceCount: number
}

interface Intervention {
  id: string
  type: string
  title: string
  description?: string | null
  mileage: number
  cost?: number | null
  status: string
  isOwnerValidated: boolean
  createdAt: Date | string
  garage: {
    id: string
    businessName: string
    address: string
    city: string
  }
  oilType?: string | null
  oilQuantity?: string | null
  parts: Array<{ name: string; brand?: string; price?: number }>
  photos: string[]
  invoiceUrl?: string | null
}

interface NearbyGarage {
  id: string
  name: string
  address: string
  city: string
  phone: string
  rating: number
  distance: number | null
  callUrl: string | null
  googleMapsUrl: string | null
  isTopRated: boolean
}

// Interface pour les stats
interface VehicleStats {
  estimatedValue: number
  valueBreakdown: {
    base: number
    mileageDeduction: number
    historyBonus: number
    accidentMalus: number
    alertMalus: number
  }
  valueHistory: Array<{ date: Date | string; value: number; reason?: string | null }>
  valueMessage: string
  valueBonusMessage?: string
  resaleScore: number
  resaleFactors: Array<{ name: string; impact: number; status: 'positive' | 'negative' | 'neutral' }>
  actionItems: Array<{
    id: string
    category: 'critical' | 'recommended' | 'strength'
    title: string
    description: string
    impact: number
    action?: string
    deadline?: string
  }>
  tco: {
    totalCost12Months: number
    totalCostAllTime: number
    averageMonthlyCost: number
    costBreakdown: Array<{ category: string; amount: number; percentage: number; color: string }>
    comparisonPercent: number
  }
}

// Données mockées pour le développement
const mockVehicle: Vehicle = {
  id: '1',
  plate: 'AA-1234-AA',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2019,
  color: 'Blanc',
  mileage: 125000,
  healthScore: 78,
  qrCode: 'OKAR-AA1234AA-XYZ',
  insurance: {
    expiryDate: '2024-12-31',
    daysRemaining: 30,
    status: 'valid'
  },
  technicalControl: {
    date: '2025-06-15',
    daysRemaining: 180,
    status: 'valid'
  },
  oilChange: {
    nextDate: '2024-12-15',
    nextMileage: 130000,
    daysRemaining: 15,
    status: 'due_soon'
  },
  alerts: [
    { id: '1', type: 'insurance', message: 'Assurance expire dans 30 jours', severity: 'warning' },
    { id: '2', type: 'oil', message: 'Vidange recommandée (125 000 km)', severity: 'info' },
  ]
}

const mockHealth: Health = {
  score: 78,
  status: 'good',
  message: 'Votre véhicule est en bon état. Continuez à l\'entretenir régulièrement!',
  factors: [
    { name: 'Assurance', impact: 0, status: 'good' },
    { name: 'Contrôle Technique', impact: 0, status: 'good' },
    { name: 'Vidange', impact: -5, status: 'warning' },
    { name: 'Entretien régulier', impact: 5, status: 'good' },
  ],
  maintenanceCount: 8,
  recentMaintenanceCount: 3
}

const mockInterventions: Intervention[] = [
  { 
    id: '1', 
    type: 'oil_change', 
    title: 'Vidange complète', 
    description: 'Vidange huile moteur + filtre à huile',
    mileage: 120000,
    cost: 25000, 
    status: 'validated',
    isOwnerValidated: true,
    createdAt: '2024-10-15', 
    garage: { id: 'g1', name: 'Auto Service Express', address: 'Dakar, Plateau', city: 'Dakar' },
    oil: { brand: 'Total', viscosity: '5W-30', quantity: 4 },
    parts: [{ name: 'Filtre à huile', brand: 'Mann', price: 5000 }],
  },
  { 
    id: '2', 
    type: 'major_repair', 
    title: 'Remplacement freins avant', 
    description: 'Plaquettes et disques de frein avant',
    mileage: 115000,
    cost: 85000, 
    status: 'validated',
    isOwnerValidated: true,
    createdAt: '2024-08-20', 
    garage: { id: 'g2', name: 'Garage Moderne', address: 'Dakar, Médina', city: 'Dakar' },
    parts: [
      { name: 'Plaquettes de frein', brand: 'Bosch', price: 35000 },
      { name: 'Disques de frein', brand: 'Brembo', price: 50000 },
    ],
  },
  { 
    id: '3', 
    type: 'oil_change', 
    title: 'Vidange', 
    mileage: 105000,
    cost: 22000, 
    status: 'validated',
    isOwnerValidated: true,
    createdAt: '2024-05-10', 
    garage: { id: 'g1', name: 'Auto Service Express', address: 'Dakar, Plateau', city: 'Dakar' },
    oil: { brand: 'Shell', viscosity: '10W-40', quantity: 4 },
  },
  { 
    id: '4', 
    type: 'accident', 
    title: 'Réparation pare-chocs arrière', 
    description: 'Accident mineur - pare-chocs remplacé',
    mileage: 98000,
    cost: 150000, 
    status: 'validated',
    isOwnerValidated: true,
    createdAt: '2024-02-28', 
    garage: { id: 'g3', name: 'Carrosserie Plus', address: 'Dakar, Liberté', city: 'Dakar' },
    photos: ['/accident1.jpg', '/accident2.jpg'],
  },
]

const mockPendingInterventions: Intervention[] = [
  { 
    id: 'p1', 
    type: 'oil_change', 
    title: 'Vidange + Filtre à air', 
    description: 'Huile 5W-40 + filtre à air remplacé',
    mileage: 126500,
    cost: 35000, 
    status: 'pending',
    isOwnerValidated: false,
    createdAt: '2025-01-15', 
    garage: { id: 'g1', name: 'Auto Service Express', address: 'Dakar, Plateau', city: 'Dakar' },
  },
]

const mockGarages: NearbyGarage[] = [
  { id: 'g1', name: 'Auto Service Express', address: '123 Rue X', city: 'Dakar', phone: '+221 77 123 45 67', rating: 4.8, distance: 0.8, callUrl: 'tel:+221771234567', googleMapsUrl: 'https://maps.google.com', isTopRated: true },
  { id: 'g2', name: 'Garage Moderne', address: '456 Ave Y', city: 'Dakar', phone: '+221 77 987 65 43', rating: 4.6, distance: 1.2, callUrl: 'tel:+221779876543', googleMapsUrl: 'https://maps.google.com', isTopRated: false },
  { id: 'g3', name: 'Auto Plus Sénégal', address: '789 Blvd Z', city: 'Dakar', phone: '+221 77 456 78 90', rating: 4.9, distance: 2.5, callUrl: 'tel:+221774567890', googleMapsUrl: 'https://maps.google.com', isTopRated: true },
]

// Stats mockées
const mockStats: VehicleStats = {
  estimatedValue: 5200000,
  valueBreakdown: {
    base: 6500000,
    mileageDeduction: 1500000,
    historyBonus: 400000,
    accidentMalus: 0,
    alertMalus: 200000
  },
  valueHistory: [
    { date: new Date('2024-01-15'), value: 4800000, reason: 'Création du dossier' },
    { date: new Date('2024-04-20'), value: 5000000, reason: 'Validation vidange' },
    { date: new Date('2024-07-10'), value: 5100000, reason: 'Bon entretien' },
    { date: new Date('2024-10-05'), value: 5200000, reason: 'Historique certifié' },
    { date: new Date(), value: 5200000, reason: 'Calcul actuel' }
  ],
  valueMessage: 'Basé sur 8 entretiens certifiés, 125 000 km, État excellent',
  valueBonusMessage: 'Ma voiture vaut 400 000 FCFA de plus grâce à mon historique prouvé',
  resaleScore: 88,
  resaleFactors: [
    { name: 'Historique riche (8 interventions)', impact: 5, status: 'positive' },
    { name: 'Historique 100% certifié', impact: 10, status: 'positive' },
    { name: 'Vidange récente (< 6 mois)', impact: 5, status: 'positive' },
    { name: 'Aucun accident déclaré', impact: 10, status: 'positive' },
    { name: 'Documents à jour', impact: 5, status: 'positive' },
    { name: 'Kilométrage modéré (>100 000 km)', impact: -10, status: 'negative' },
    { name: 'Vidange dans 5000 km', impact: 0, status: 'neutral' }
  ],
  actionItems: [
    { id: 'oil_soon', category: 'recommended', title: 'Vidange dans 5 000 km', description: '+5 pts après validation', impact: 5 },
    { id: 'no_accident', category: 'strength', title: 'Aucun accident déclaré', description: '+10 pts', impact: 10 },
    { id: 'oil_history', category: 'strength', title: 'Historique de vidanges parfait', description: '+15 pts', impact: 15 },
    { id: 'docs_valid', category: 'strength', title: 'Documents à jour', description: '+5 pts', impact: 5 }
  ],
  tco: {
    totalCost12Months: 435000,
    totalCostAllTime: 1250000,
    averageMonthlyCost: 36250,
    costBreakdown: [
      { category: 'Entretien courant', amount: 320000, percentage: 74, color: '#22c55e' },
      { category: 'Réparations majeures', amount: 115000, percentage: 26, color: '#f97316' }
    ],
    comparisonPercent: 15
  }
}

export default function DriverDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('vehicle')
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [validatedItems, setValidatedItems] = useState<string[]>([])
  
  // États pour les données
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [nearbyGarages, setNearbyGarages] = useState<NearbyGarage[]>([])
  const [transferCode, setTransferCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<VehicleStats | null>(null)

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true)
      // Dans une vraie implémentation, ces données viendraient de l'API
      // Pour l'instant, on simule un utilisateur sans véhicule pour montrer l'état vide
      // Pour tester le dashboard complet, décommenter les lignes suivantes:
      // setVehicle(mockVehicle as unknown as Vehicle)
      // setHealth(mockHealth)
      // setInterventions(mockInterventions)
      // setStats(mockStats)
      
      // État vide pour les nouveaux utilisateurs
      setVehicle(null)
      setHealth(null)
      setInterventions([])
      setStats(null)
      setLoading(false)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  const handleValidate = async (id: string, approve: boolean, _notes?: string) => {
    // Simuler la validation
    setShowConfetti(true)
    setValidatedItems(prev => [...prev, id])
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleFindGarages = useCallback(async (lat: number, lng: number) => {
    console.log('Finding garages near:', lat, lng)
    return mockGarages
  }, [])

  const handleGenerateTransferCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setTransferCode(code)
    return { code, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
  }

  const getHealthStatus = (score: number): HealthStatus => {
    if (score >= 70) return 'good'
    if (score >= 40) return 'warning'
    return 'critical'
  }

  const healthStatus = health ? getHealthStatus(health.score) : 'good'

  // Données dérivées
  const pendingInterventions = interventions.filter(
    i => i.status === 'pending' && !validatedItems.includes(i.id)
  )
  
  const mileageHistory = interventions
    .filter(i => i.mileage > 0)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(i => ({
      date: i.createdAt,
      mileage: i.mileage,
      type: i.type
    }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
        {/* Confetti Effect */}
        <ConfettiEffect show={showConfetti} />
        
        {/* Header & Navigation */}
        <DriverSidebar
          user={user || { name: 'Utilisateur', email: '' }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingInterventions.length}
          alertCount={vehicle?.alerts.length || 0}
          onLogout={handleLogout}
        />

        {/* Contenu principal */}
        <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
          {/* État vide - Nouvel utilisateur sans QR Code */}
          {!vehicle && activeTab === 'vehicle' && (
            <WelcomeCard userName={user?.name} />
          )}

          {/* Tab: Véhicule - Dashboard complet */}
          {vehicle && activeTab === 'vehicle' && (
            <div className="space-y-6 animate-fade-in">
              {/* Carte Santé Véhicule */}
              {vehicle && (
                <VehicleHealthCard
                  vehicle={vehicle}
                  healthStatus={healthStatus}
                  alerts={vehicle.alerts}
                />
              )}

              {/* Échéances */}
              {vehicle && (
                <DueDatesCard
                  insurance={vehicle.insurance}
                  technicalControl={vehicle.technicalControl}
                  oilChange={vehicle.oilChange}
                />
              )}

              {/* Score de Confiance */}
              {health && (
                <ConfidenceScore
                  score={health.score}
                  status={health.status}
                  message={health.message}
                  factors={health.factors}
                  maintenanceCount={health.maintenanceCount}
                />
              )}

              {/* Actions rapides */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {vehicle && (
                      <QRCodeDisplay
                        qrCode={vehicle.qrCode}
                        vehicle={{
                          plateNumber: vehicle.plateNumber,
                          brand: vehicle.brand,
                          model: vehicle.model,
                          year: vehicle.year,
                          healthScore: vehicle.healthScore
                        }}
                      />
                    )}
                    <Button 
                      variant="outline" 
                      className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl"
                      onClick={() => setActiveTab('transfer')}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Transférer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dernières interventions */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Dernières Interventions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {interventions.slice(0, 3).map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setActiveTab('history')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            item.type === 'oil_change' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                            item.type === 'major_repair' ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                            'bg-gradient-to-br from-red-500 to-rose-500'
                          }`}>
                            {item.type === 'oil_change' ? (
                              <Droplets className="h-5 w-5 text-white" />
                            ) : item.type === 'major_repair' ? (
                              <Settings className="h-5 w-5 text-white" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-gray-500 text-sm">{item.garage.businessName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-sm font-medium">
                            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-gray-400 text-xs">{item.mileage.toLocaleString()} km</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl"
                    onClick={() => setActiveTab('history')}
                  >
                    Voir tout l'historique
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab: Historique */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in">
              <MaintenanceTimeline interventions={interventions} />
              <MileageChart 
                mileageHistory={mileageHistory}
                anomalies={[]}
              />
            </div>
          )}

          {/* Tab: Validations */}
          {activeTab === 'validations' && (
            <div className="animate-fade-in">
              <ValidationCenter
                pendingInterventions={pendingInterventions}
                onValidate={handleValidate}
              />
            </div>
          )}

          {/* Tab: Urgence */}
          {activeTab === 'emergency' && (
            <div className="space-y-6 animate-fade-in">
              <EmergencyButton
                onFindGarages={handleFindGarages}
                onGaragesFound={setNearbyGarages}
              />
              {nearbyGarages.length > 0 && (
                <NearbyGarages garages={nearbyGarages} />
              )}
            </div>
          )}

          {/* Tab: Transfert */}
          {activeTab === 'transfer' && (
            <div className="space-y-6 animate-fade-in">
              <TransferCode
                hasActiveCode={!!transferCode}
                code={transferCode}
                onGenerateCode={handleGenerateTransferCode}
              />
              
              {vehicle && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-500" />
                      Informations Transférées
                    </CardTitle>
                    <CardDescription>
                      Ce que l'acheteur recevra lors du transfert
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Véhicule</span>
                        <span className="font-medium text-gray-900">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Plaque</span>
                        <span className="font-mono font-bold text-gray-900">{vehicle.plateNumber}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Score OKAR</span>
                        <Badge className={`${
                          vehicle.healthScore >= 70 ? 'bg-green-100 text-green-700' :
                          vehicle.healthScore >= 40 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {vehicle.healthScore}/100
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Interventions</span>
                        <span className="font-medium text-gray-900">{interventions.length} enregistrées</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Kilométrage</span>
                        <span className="font-medium text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tab: Bilan Auto (Nouveau) */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6 animate-fade-in">
              {/* Titre de section */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                  Mon Bilan Auto
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Vos statistiques et analyses en temps réel
                </p>
              </div>
              
              {/* 3 Cartes principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Valeur estimée */}
                <VehicleValueCard
                  estimatedValue={stats.estimatedValue}
                  valueMessage={stats.valueMessage}
                  valueBonusMessage={stats.valueBonusMessage}
                  valueBreakdown={stats.valueBreakdown}
                  valueHistory={stats.valueHistory}
                />
                
                {/* 2. Score de revente */}
                <ResaleScoreCard
                  resaleScore={stats.resaleScore}
                  resaleFactors={stats.resaleFactors}
                  actionItems={stats.actionItems}
                />
                
                {/* 3. Coût total de possession */}
                <TCOCard tco={stats.tco} />
              </div>
              
              {/* Section comparaison */}
              <Card className="bg-gradient-to-r from-orange-50 via-pink-50 to-blue-50 border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        Votre véhicule a de la valeur !
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Grâce à votre historique d'entretien certifié, votre {vehicle?.brand} {vehicle?.model} 
                        {vehicle?.year ? ` ${vehicle.year}` : ''} est estimé à 
                        <span className="font-bold text-green-600"> {stats.estimatedValue.toLocaleString()} FCFA</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab: Rapport */}
          {activeTab === 'report' && (
            <div className="space-y-6 animate-fade-in">
              {/* Preview gratuit */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Rapport Véhicule
                  </CardTitle>
                  <CardDescription>
                    Générer un rapport PDF complet de votre véhicule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Aperçu */}
                  <div className="p-6 bg-gradient-to-r from-orange-50 via-pink-50 to-blue-50 rounded-2xl mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm">Véhicule</p>
                        <p className="font-bold text-gray-900">{vehicle?.brand} {vehicle?.model}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Plaque</p>
                        <p className="font-bold text-gray-900 font-mono">{vehicle?.plateNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Score OKAR</p>
                        <p className="font-bold text-orange-600">{health?.score}/100</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Interventions</p>
                        <p className="font-bold text-gray-900">{interventions.length}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Options */}
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Version gratuite</span>
                        <Badge className="bg-green-100 text-green-700">Gratuit</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">
                        Résumé basique: modèle, année, score, nombre d'entretiens
                      </p>
                      <Button variant="outline" className="w-full rounded-xl">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger l'aperçu
                      </Button>
                    </div>

                    <div className="p-4 border-2 border-orange-200 rounded-xl bg-orange-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Version complète</span>
                        <Badge className="bg-orange-500 text-white">1 500 FCFA</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">
                        Historique détaillé, graphiques, score de confiance, recommandations
                      </p>
                      <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <Award className="h-4 w-4 mr-2" />
                        Acheter le rapport complet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <p className="text-3xl font-bold text-green-600">
                        {interventions.filter(i => i.type === 'oil_change').length}
                      </p>
                      <p className="text-gray-600 text-sm">Vidanges</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                      <p className="text-3xl font-bold text-orange-600">
                        {interventions.filter(i => i.type === 'major_repair').length}
                      </p>
                      <p className="text-gray-600 text-sm">Réparations</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl">
                      <p className="text-3xl font-bold text-red-600">
                        {interventions.filter(i => i.type === 'accident').length}
                      </p>
                      <p className="text-gray-600 text-sm">Accidents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Animations CSS */}
        <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  )
}
