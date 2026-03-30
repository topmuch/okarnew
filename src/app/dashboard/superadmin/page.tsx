/**
 * OKAR - Dashboard Superadmin Complet
 * 
 * Design "Luminous Dark & Glassmorphism Premium"
 * Fond: Bleu Nuit Profond (#0F172A) avec dégradé radial et bruit subtil
 * Cartes: Verre semi-transparent (bg-slate-800/60) avec backdrop-blur
 * Accents: Dégradé Violet (#8B5CF6) -> Rose Fuchsia (#EC4899)
 * KPIs: Effet Néon Soft avec ombres colorées
 * 
 * Fonctionnalités:
 * - Sidebar fixe avec navigation luminous
 * - KPIs en temps réel avec glow
 * - Grilles de cartes pour Utilisateurs, Garages, Véhicules, QR Codes
 * - Carte interactive avec Leaflet/CartoDB
 * - Audit complet des véhicules avec infos client
 */

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Search, RefreshCw, Plus, Sparkles, Users, UserPlus, Eye, Key, CheckCircle, XCircle, QrCode } from 'lucide-react'

// Composants OKAR
import { SuperAdminSidebar } from '@/components/okar/superadmin/SuperAdminSidebar'
import { StatCard } from '@/components/okar/superadmin/StatCard'
import { GarageValidationTable, Garage } from '@/components/okar/superadmin/GarageValidationTable'
import { QRCodeGenerator, QRCodeLot } from '@/components/okar/superadmin/QRCodeGenerator'
import { MyQRCodes, QRCodeItem } from '@/components/okar/superadmin/MyQRCodes'
import { InteractiveMap, MapMarker } from '@/components/okar/superadmin/InteractiveMap'
import { VehicleAuditView, VehicleAuditData } from '@/components/okar/superadmin/VehicleAuditView'
import { AddGarageDialog, GarageFormData } from '@/components/okar/superadmin/AddGarageDialog'
import { AddUserDialog, UserFormData } from '@/components/okar/superadmin/AddUserDialog'
import { SettingsPanel } from '@/components/okar/superadmin/SettingsPanel'

// Nouveaux composants de cartes - Design Dark Luxe
import { UserCard, UserCardData } from '@/components/okar/superadmin/UserCard'
import { GarageCard, GarageCardData } from '@/components/okar/superadmin/GarageCard'
import { VehicleCard, VehicleCardData } from '@/components/okar/superadmin/VehicleCard'
import { QRCodeCard, QRCodeCardData } from '@/components/okar/superadmin/QRCodeCard'
import { RequestCard, RequestData } from '@/components/okar/superadmin/RequestCard'

// Types
interface Stats {
  vehicles: { total: number; thisMonth: number; growth: number }
  garages: { total: number; active: number; pending: number; suspended: number }
  users: { total: number; drivers: number }
  qrCodes: { total: number; stock: number; active: number; lost: number; garage: number; particulier: number }
  revenue: { total: number; currency: string }
}

interface Vehicle {
  id: string
  plateNumber: string
  brand: string
  model: string
  year: number | null
  owner: string
  ownerEmail?: string
  ownerPhone?: string
  healthScore: number
  mileage: number
  qrCode: string
  qrType?: 'garage' | 'particulier'
  createdAt: string
  ctStatus?: 'valid' | 'expiring_soon' | 'expired' | 'unknown'
  ctExpiryDate?: string
}

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  details: any
  ipAddress: string | null
  user: { name: string; email: string; role: string } | null
  createdAt: string
}

interface UserItem {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  isApproved: boolean
  subscriptionStatus: string
  createdAt: string
  updatedAt: string
  _count?: {
    vehicles: number
    maintenanceRecords: number
  }
  garage?: {
    id: string
    businessName: string
    city: string
    isActive: boolean
  } | null
}

function SuperAdminDashboardContent() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [garages, setGarages] = useState<Garage[]>([])
  const [garageFilter, setGarageFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all')
  const [qrLots, setQrLots] = useState<QRCodeLot[]>([])
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([])
  const [qrStockStats, setQrStockStats] = useState({ total: 0, inStock: 0, active: 0, lost: 0 })
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [usersFilter, setUsersFilter] = useState<'all' | 'driver' | 'garage_certified' | 'garage_pending' | 'superadmin'>('all')
  const [usersStats, setUsersStats] = useState<Record<string, number>>({})
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  
  // Demandes en attente
  const [pendingRequests, setPendingRequests] = useState<RequestData[]>([])
  const [pendingRequestsStats, setPendingRequestsStats] = useState({ total: 0, drivers: 0, garages: 0 })
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleAuditData | null>(null)
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [addGarageDialogOpen, setAddGarageDialogOpen] = useState(false)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingGarages, setIsLoadingGarages] = useState(true)
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(false)

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/superadmin/stats', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Charger les garages
  const loadGarages = useCallback(async () => {
    try {
      const response = await fetch('/api/superadmin/garages', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setGarages(data.garages)
        
        // Créer les marqueurs pour la carte - garages avec coordonnées
        const garageMarkers: MapMarker[] = data.garages
          .filter((g: Garage) => g.latitude && g.longitude)
          .map((g: Garage) => ({
            id: g.id,
            type: 'garage' as const,
            name: g.businessName,
            latitude: g.latitude!,
            longitude: g.longitude!,
            details: {
              address: g.address,
              phone: g.phone,
              status: g.status,
              rating: g.rating,
            },
          }))
        
        setMapMarkers(garageMarkers)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des garages:', error)
    } finally {
      setIsLoadingGarages(false)
    }
  }, [])

  // Charger les QR codes (lots)
  const loadQRCodes = useCallback(async () => {
    try {
      const response = await fetch('/api/superadmin/qrcodes?type=lots', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setQrLots(data.lots)
        
        // Calculer les stats
        let total = 0, inStock = 0, active = 0, lost = 0
        data.lots.forEach((lot: any) => {
          total += lot.count
          inStock += lot.statusCounts.stock || 0
          active += lot.statusCounts.active || 0
          lost += lot.statusCounts.lost || 0
        })
        setQrStockStats({ total, inStock, active, lost })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des QR codes:', error)
    }
  }, [])

  // Charger tous les QR codes (pour l'onglet Mes QR Codes)
  const loadAllQRCodes = useCallback(async () => {
    setIsLoadingQRCodes(true)
    try {
      const response = await fetch('/api/superadmin/qrcodes?type=all', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data.qrcodes || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des QR codes:', error)
    } finally {
      setIsLoadingQRCodes(false)
    }
  }, [])

  // Charger les véhicules
  const loadVehicles = useCallback(async () => {
    try {
      const response = await fetch('/api/superadmin/vehicles', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error)
    }
  }, [])

  // Charger les logs d'audit
  const loadAuditLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/superadmin/audit', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error)
    }
  }, [])

  // Charger les utilisateurs
  const loadUsers = useCallback(async (filter?: string, search?: string) => {
    setIsLoadingUsers(true)
    try {
      const params = new URLSearchParams()
      if (filter && filter !== 'all') params.set('role', filter)
      if (search) params.set('search', search)
      
      const response = await fetch(`/api/superadmin/users?${params.toString()}`, { 
        credentials: 'include' 
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setUsersStats(data.stats || {})
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  // Charger les demandes en attente
  const loadPendingRequests = useCallback(async () => {
    setIsLoadingRequests(true)
    try {
      const response = await fetch('/api/superadmin/requests', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.requests)
        setPendingRequestsStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error)
    } finally {
      setIsLoadingRequests(false)
    }
  }, [])

  // Valider une demande d'inscription
  const handleValidateRequest = useCallback(async (userId: string) => {
    const response = await fetch('/api/superadmin/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'validate', userId }),
    })
    if (response.ok) {
      loadPendingRequests()
      loadStats()
      loadUsers()
    }
  }, [loadPendingRequests, loadStats, loadUsers])

  // Rejeter une demande d'inscription
  const handleRejectRequest = useCallback(async (userId: string, reason?: string) => {
    const response = await fetch('/api/superadmin/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'reject', userId, reason }),
    })
    if (response.ok) {
      loadPendingRequests()
      loadStats()
    }
  }, [loadPendingRequests, loadStats])

  // Synchroniser l'onglet actif avec l'URL
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview'
    setActiveTab(tab)
  }, [searchParams])

  // Charger toutes les données au montage
  useEffect(() => {
    if (user?.role === 'superadmin') {
      loadStats()
      loadGarages()
      loadQRCodes()
      loadAllQRCodes()
      loadVehicles()
      loadAuditLogs()
      loadUsers()
      loadPendingRequests()
    }
  }, [user, loadStats, loadGarages, loadQRCodes, loadAllQRCodes, loadVehicles, loadAuditLogs, loadUsers, loadPendingRequests])

  // Charger les QR codes quand on va sur l'onglet myqrcodes
  useEffect(() => {
    if (activeTab === 'myqrcodes') {
      loadAllQRCodes()
    }
  }, [activeTab, loadAllQRCodes])

  // Fonction pour changer d'onglet
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    const url = tab === 'overview' ? pathname : `${pathname}?tab=${tab}`
    router.replace(url)
  }, [pathname, router])

  // Actions sur les garages
  const handleValidateGarage = async (garageId: string) => {
    const response = await fetch('/api/superadmin/garages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'validate', garageId }),
    })
    if (response.ok) {
      loadGarages()
      loadStats()
    }
  }

  const handleRejectGarage = async (garageId: string, reason: string) => {
    const response = await fetch('/api/superadmin/garages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'reject', garageId, reason }),
    })
    if (response.ok) {
      loadGarages()
      loadStats()
    }
  }

  const handleSuspendGarage = async (garageId: string) => {
    const response = await fetch('/api/superadmin/garages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'suspend', garageId }),
    })
    if (response.ok) {
      loadGarages()
    }
  }

  const handleReactivateGarage = async (garageId: string) => {
    const response = await fetch('/api/superadmin/garages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'reactivate', garageId }),
    })
    if (response.ok) {
      loadGarages()
    }
  }

  // Ajouter un garage
  const handleAddGarage = async (garageData: GarageFormData) => {
    const response = await fetch('/api/superadmin/garages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        action: 'create',
        ...garageData 
      }),
    })
    if (response.ok) {
      loadGarages()
      loadStats()
    } else {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la création')
    }
  }

  // Ajouter un utilisateur
  const handleAddUser = async (userData: UserFormData) => {
    const response = await fetch('/api/superadmin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        action: 'create',
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        password: userData.generatedPassword,
      }),
    })
    if (response.ok) {
      loadUsers()
      loadStats()
    } else {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la création')
    }
  }

  // Actions sur les QR codes
  const handleGenerateQR = async (count: number, type: 'garage' | 'particulier', garageId?: string): Promise<QRCodeLot> => {
    const response = await fetch('/api/superadmin/qrcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'generate', count, type, garageId }),
    })
    const data = await response.json()
    loadQRCodes()
    loadAllQRCodes()
    return data.lot
  }

  const handleAssignQR = async (lotId: string, garageId: string) => {
    await fetch('/api/superadmin/qrcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'assign', lotId, garageId }),
    })
    loadQRCodes()
    loadAllQRCodes()
  }

  const handleExportPDF = async (lotIdOrCodeId: string) => {
    // Cette fonction est maintenant gérée directement par les composants QRCodeCard et QRCodeGenerator
    // qui utilisent la librairie qrcode-pdf.ts
    console.log('Export PDF pour:', lotIdOrCodeId)
  }

  // Voir les détails d'un véhicule
  const handleViewVehicle = async (vehicleId: string) => {
    const response = await fetch(`/api/superadmin/vehicles?id=${vehicleId}`, { credentials: 'include' })
    if (response.ok) {
      const data = await response.json()
      setSelectedVehicle(data.vehicle)
      setVehicleDialogOpen(true)
    }
  }

  // Voir les détails d'un garage
  const handleViewGarage = (garageId: string) => {
    // Les détails sont affichés dans un dialog dans le composant GarageCard
    console.log('Voir garage:', garageId)
  }

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    const response = await fetch('/api/superadmin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'delete', userId }),
    })
    if (response.ok) {
      loadUsers()
      loadStats()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la suppression')
    }
  }

  // Suspendre un utilisateur
  const handleSuspendUser = async (userId: string) => {
    const response = await fetch('/api/superadmin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'toggleApproval', userId }),
    })
    if (response.ok) {
      loadUsers()
      loadStats()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la suspension')
    }
  }

  // Réactiver un utilisateur
  const handleReactivateUser = async (userId: string) => {
    const response = await fetch('/api/superadmin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'toggleApproval', userId }),
    })
    if (response.ok) {
      loadUsers()
      loadStats()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la réactivation')
    }
  }

  // Réinitialiser le mot de passe d'un utilisateur
  const handleResetUserPassword = async (userId: string) => {
    // Générer un nouveau mot de passe
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '!1'
    
    const response = await fetch('/api/superadmin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'resetPassword', userId, userData: { password: newPassword } }),
    })
    if (response.ok) {
      // Afficher le nouveau mot de passe à l'admin
      alert(`Nouveau mot de passe généré: ${newPassword}\n\nVeuillez le communiquer à l'utilisateur.`)
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la réinitialisation')
    }
  }

  // Supprimer un QR code
  const handleDeleteQR = async (qrId: string) => {
    const response = await fetch(`/api/superadmin/qrcodes?id=${qrId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (response.ok) {
      loadQRCodes()
      loadAllQRCodes()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la suppression')
    }
  }

  // Supprimer un garage
  const handleDeleteGarage = async (garageId: string) => {
    const response = await fetch('/api/superadmin/garages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'delete', garageId }),
    })
    if (response.ok) {
      loadGarages()
      loadStats()
    }
  }

  // Spinner pendant le chargement initial
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#8B5CF6] rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#EC4899] animate-pulse" />
            <span className="text-[#94A3B8] font-medium">Chargement...</span>
          </div>
        </div>
      </div>
    )
  }

  // Convertir les données pour les cartes
  const userCardData: UserCardData[] = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    isApproved: u.isApproved,
    subscriptionStatus: u.subscriptionStatus,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    _count: u._count,
    garage: u.garage,
  }))

  const garageCardData: GarageCardData[] = garages.map(g => ({
    id: g.id,
    businessName: g.businessName,
    ownerName: g.ownerName,
    email: g.email,
    phone: g.phone,
    city: g.city,
    address: g.address,
    status: g.status,
    documentsComplete: g.documentsComplete,
    submittedAt: g.submittedAt,
    rating: g.rating,
    totalClients: g.totalClients,
    totalRevenue: g.totalRevenue,
    latitude: g.latitude,
    longitude: g.longitude,
  }))

  const vehicleCardData: VehicleCardData[] = vehicles.map(v => ({
    id: v.id,
    plateNumber: v.plateNumber,
    brand: v.brand,
    model: v.model,
    year: v.year,
    owner: v.owner,
    ownerEmail: v.ownerEmail,
    ownerPhone: v.ownerPhone,
    healthScore: v.healthScore,
    mileage: v.mileage,
    qrCode: v.qrCode,
    qrType: v.qrType,
    createdAt: v.createdAt,
    ctStatus: v.ctStatus,
    ctExpiryDate: v.ctExpiryDate,
  }))

  const qrCodeCardData: QRCodeCardData[] = qrCodes.map(qr => ({
    id: qr.id,
    code: qr.code,
    lotId: qr.lotId,
    type: qr.type,
    status: qr.status,
    assignedGarageId: qr.assignedGarageId,
    assignedGarageName: qr.assignedGarageName,
    activatedByName: qr.activatedByName,
    activatedByEmail: qr.activatedByEmail,
    activatedByPhone: qr.activatedByPhone,
    vehicleId: qr.vehicleId,
    vehiclePlateNumber: qr.vehiclePlateNumber,
    createdAt: qr.createdAt,
    activatedAt: qr.activatedAt,
  }))

  // Filtrer les garages
  const filteredGarages = garageCardData.filter(g => 
    garageFilter === 'all' || g.status === garageFilter
  ).filter(g =>
    searchQuery ? 
    g.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  )

  // Filtrer les utilisateurs
  const filteredUsers = userCardData.filter(u => 
    usersFilter === 'all' || u.role === usersFilter
  ).filter(u =>
    searchQuery ?
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  )

  // Filtrer les véhicules
  const filteredVehicles = vehicleCardData.filter(v => 
    searchQuery ? v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) : true
  )

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#1E1B4B]/30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#8B5CF6]/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Sidebar */}
      <SuperAdminSidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={pendingRequestsStats.total || 0}
        onLogout={logout}
        userName={user?.name || 'Admin'}
        userEmail={user?.email || 'admin@okar.com'}
      />

      {/* Contenu principal */}
      <main className="ml-64 min-h-screen relative z-10">
        {/* Header avec effet glass lumineux */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/70 border-b border-white/5">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {activeTab === 'overview' && 'Vue d\'ensemble'}
                {activeTab === 'requests' && 'Demandes d\'Inscription'}
                {activeTab === 'users' && 'Gestion des Utilisateurs'}
                {activeTab === 'garages' && 'Gestion des Garages'}
                {activeTab === 'qrcodes' && 'Génération de QR Codes'}
                {activeTab === 'myqrcodes' && 'Mes QR Codes'}
                {activeTab === 'map' && 'Carte Interactive'}
                {activeTab === 'vehicles' && 'Véhicules'}
                {activeTab === 'audit' && 'Logs d\'Audit'}
                {activeTab === 'settings' && 'Paramètres'}
              </h1>
              <p className="text-[#64748B] text-sm mt-1">
                Bienvenue, <span className="text-[#94A3B8]">{user.name || 'Admin'}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadStats()
                  loadGarages()
                  loadQRCodes()
                  loadAllQRCodes()
                  loadVehicles()
                  loadAuditLogs()
                }}
                className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5 hover:border-[#8B5CF6]/50 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <div className="p-8">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Véhicules"
                  value={stats?.vehicles.total || 0}
                  subtitle={`${stats?.vehicles.thisMonth || 0} ce mois`}
                  trend={stats?.vehicles.growth ? { value: stats.vehicles.growth, isPositive: stats.vehicles.growth > 0 } : undefined}
                  icon="🚗"
                  variant="blue"
                />
                <StatCard
                  title="Garages Actifs"
                  value={stats?.garages.active || 0}
                  subtitle={`${stats?.garages.pending || 0} en attente`}
                  icon="🔧"
                  variant="pink"
                />
                <StatCard
                  title="QR Codes Actifs"
                  value={stats?.qrCodes.active || 0}
                  subtitle={`${stats?.qrCodes.stock || 0} en stock`}
                  icon="📱"
                  variant="purple"
                />
                <StatCard
                  title="Revenus Totaux"
                  value={`${((stats?.revenue.total || 0) / 1000000).toFixed(1)}M`}
                  subtitle="FCFA"
                  icon="💰"
                  variant="orange"
                />
              </div>

              {/* Grille de cartes garages en attente - VERRE DÉPOLI */}
              <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg shadow-black/20 overflow-hidden">
                <CardHeader className="border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg font-semibold">
                      Garages en Attente
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTabChange('garages')}
                      className="text-[#94A3B8] hover:text-white hover:bg-white/5"
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoadingGarages ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {garageCardData
                        .filter(g => g.status === 'pending')
                        .slice(0, 4)
                        .map(garage => (
                          <GarageCard
                            key={garage.id}
                            garage={garage}
                            onValidate={handleValidateGarage}
                            onReject={handleRejectGarage}
                            onViewDetails={handleViewGarage}
                            onDelete={handleDeleteGarage}
                          />
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grille de cartes véhicules récents - VERRE DÉPOLI */}
              <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg shadow-black/20 overflow-hidden">
                <CardHeader className="border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg font-semibold">
                      Derniers Véhicules
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTabChange('vehicles')}
                      className="text-[#94A3B8] hover:text-white hover:bg-white/5"
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vehicleCardData.slice(0, 4).map(vehicle => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onViewHistory={handleViewVehicle}
                        onViewAudit={handleViewVehicle}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Demandes d'Inscription - Grille de cartes */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Stats des demandes - VERRE DÉPOLI */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center border border-[#F59E0B]/20">
                        <UserPlus className="h-5 w-5 text-[#FBBF24]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{pendingRequestsStats.total}</p>
                        <p className="text-xs text-[#64748B]">Total en attente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#06B6D4]/20 rounded-lg flex items-center justify-center border border-[#06B6D4]/20">
                        <Users className="h-5 w-5 text-[#22D3EE]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{pendingRequestsStats.drivers}</p>
                        <p className="text-xs text-[#94A3B8]">Propriétaires</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center border border-[#8B5CF6]/20">
                        <Users className="h-5 w-5 text-[#A78BFA]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{pendingRequestsStats.garages}</p>
                        <p className="text-xs text-[#64748B]">Garages</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Liste des demandes */}
              {isLoadingRequests ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg shadow-black/20">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#10B981]/20">
                      <Users className="h-8 w-8 text-[#34D399]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Aucune demande en attente</h3>
                    <p className="text-[#64748B]">Toutes les demandes d'inscription ont été traitées.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onValidate={handleValidateRequest}
                      onReject={handleRejectRequest}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gestion Garages - Grille de cartes */}
          {activeTab === 'garages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['all', 'pending', 'approved', 'suspended'].map((filter) => (
                    <Button
                      key={filter}
                      variant={garageFilter === filter ? 'default' : 'outline'}
                      onClick={() => setGarageFilter(filter as any)}
                      className={garageFilter === filter 
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg shadow-[#8B5CF6]/20 hover:from-[#7C3AED] hover:to-[#DB2777]' 
                        : 'border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5'
                      }
                    >
                      {filter === 'all' ? 'Tous' :
                       filter === 'pending' ? 'En attente' :
                       filter === 'approved' ? 'Approuvés' : 'Suspendus'}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 bg-[#1E293B] border-[#334155] text-white placeholder:text-[#64748B] focus:border-[#8B5CF6]/50 focus:ring-[#8B5CF6]/20"
                    />
                  </div>
                  <Button
                    onClick={() => setAddGarageDialogOpen(true)}
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white shadow-lg shadow-[#8B5CF6]/20 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un garage
                  </Button>
                </div>
              </div>

              {isLoadingGarages ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredGarages.map(garage => (
                    <GarageCard
                      key={garage.id}
                      garage={garage}
                      onValidate={handleValidateGarage}
                      onReject={handleRejectGarage}
                      onSuspend={handleSuspendGarage}
                      onReactivate={handleReactivateGarage}
                      onViewDetails={handleViewGarage}
                      onDelete={handleDeleteGarage}
                    />
                  ))}
                </div>
              )}

              {filteredGarages.length === 0 && !isLoadingGarages && (
                <div className="text-center py-12">
                  <p className="text-[#64748B]">Aucun garage trouvé</p>
                </div>
              )}
            </div>
          )}

          {/* QR Codes - Génération */}
          {activeTab === 'qrcodes' && (
            <QRCodeGenerator
              onGenerate={handleGenerateQR}
              onAssign={handleAssignQR}
              onExportPDF={handleExportPDF}
              garages={garages.filter(g => g.status === 'approved').map(g => ({
                id: g.id,
                businessName: g.businessName,
                city: g.city,
              }))}
              recentLots={qrLots}
              stockStats={qrStockStats}
            />
          )}

          {/* Mes QR Codes - Grille de cartes */}
          {activeTab === 'myqrcodes' && (
            <div className="space-y-6">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Rechercher par code, lot, client ou plaque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#1E293B] border-[#334155] text-white placeholder:text-[#64748B] focus:border-[#8B5CF6]/50 h-12 rounded-xl"
                />
              </div>

              {isLoadingQRCodes ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {qrCodeCardData
                    .filter(qr => 
                      searchQuery ? 
                      qr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      qr.lotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      qr.activatedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      qr.vehiclePlateNumber?.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                    )
                    .map(qrCode => (
                      <QRCodeCard
                        key={qrCode.id}
                        qrCode={qrCode}
                        onExportPDF={handleExportPDF}
                        onViewVehicle={handleViewVehicle}
                      />
                    ))}
                </div>
              )}

              {qrCodeCardData.length === 0 && !isLoadingQRCodes && (
                <div className="text-center py-12">
                  <p className="text-[#64748B]">Aucun QR code trouvé</p>
                </div>
              )}
            </div>
          )}

          {/* Carte */}
          {activeTab === 'map' && (
            <InteractiveMap
              markers={mapMarkers}
              onMarkerClick={(marker) => {
                console.log('Marker clicked:', marker)
              }}
            />
          )}

          {/* Véhicules - Grille de cartes */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Tous les Véhicules</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                  <Input
                    placeholder="Rechercher par plaque..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 bg-[#1E293B] border-[#334155] text-white placeholder:text-[#64748B] focus:border-[#8B5CF6]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onViewHistory={handleViewVehicle}
                    onViewAudit={handleViewVehicle}
                  />
                ))}
              </div>

              {filteredVehicles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#64748B]">Aucun véhicule trouvé</p>
                </div>
              )}
            </div>
          )}

          {/* Audit - Grille de cartes */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Stats rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{auditLogs.filter(l => l.action.includes('VALIDATED')).length}</p>
                        <p className="text-xs text-slate-400">Validations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{auditLogs.filter(l => l.action.includes('REJECTED') || l.action.includes('DELETED')).length}</p>
                        <p className="text-xs text-slate-400">Rejets/Suppressions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{auditLogs.filter(l => l.action.includes('GENERATED')).length}</p>
                        <p className="text-xs text-slate-400">Générations QR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{auditLogs.length}</p>
                        <p className="text-xs text-slate-400">Total Actions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Grille de logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {auditLogs.slice(0, 30).map((log) => (
                  <Card key={log.id} className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:border-white/20 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            log.action.includes('VALIDATED') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                            log.action.includes('REJECTED') || log.action.includes('DELETED') ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                            log.action.includes('GENERATED') ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' :
                            log.action.includes('CREATED') ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' :
                            'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">{log.action}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {log.entityType}: <span className="font-mono text-slate-300">{log.entityId.substring(0, 8)}...</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <p className="text-slate-300 text-xs font-medium">{log.user?.name || 'Système'}</p>
                        <p className="text-slate-500 text-xs">
                          {new Date(log.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {auditLogs.length === 0 && (
                <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-400">Aucun log d'audit disponible</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Utilisateurs - Grille de cartes */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Stats utilisateurs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#1E293B] rounded-xl border border-[#334155] shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#06B6D4]/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#06B6D4]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{usersStats.driver || 0}</p>
                        <p className="text-xs text-[#64748B]">Conducteurs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1E293B] rounded-xl border border-[#334155] shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#10B981]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{usersStats.garage_certified || 0}</p>
                        <p className="text-xs text-[#64748B]">Garages Certifiés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1E293B] rounded-xl border border-[#334155] shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#F59E0B]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{usersStats.garage_pending || 0}</p>
                        <p className="text-xs text-[#64748B]">En attente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1E293B] rounded-xl border border-[#334155] shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{usersStats.superadmin || 0}</p>
                        <p className="text-xs text-[#64748B]">Super Admins</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtres et recherche */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['all', 'driver', 'garage_certified', 'garage_pending', 'superadmin'].map((filter) => (
                    <Button
                      key={filter}
                      variant={usersFilter === filter ? 'default' : 'outline'}
                      onClick={() => setUsersFilter(filter as any)}
                      className={usersFilter === filter 
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg shadow-[#8B5CF6]/20' 
                        : 'border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5'
                      }
                    >
                      {filter === 'all' ? 'Tous' :
                       filter === 'driver' ? 'Conducteurs' :
                       filter === 'garage_certified' ? 'Certifiés' :
                       filter === 'garage_pending' ? 'En attente' : 'Admins'}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 bg-[#1E293B] border-[#334155] text-white placeholder:text-[#64748B] focus:border-[#8B5CF6]/50"
                    />
                  </div>
                  <Button
                    onClick={() => setAddUserDialogOpen(true)}
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white shadow-lg shadow-[#8B5CF6]/20 rounded-xl"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un utilisateur
                  </Button>
                </div>
              </div>

              {/* Grille de cartes utilisateurs */}
              {isLoadingUsers ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUsers.map(userData => (
                    <UserCard
                      key={userData.id}
                      user={userData}
                      onSuspend={handleSuspendUser}
                      onReactivate={handleReactivateUser}
                      onResetPassword={handleResetUserPassword}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </div>
              )}

              {filteredUsers.length === 0 && !isLoadingUsers && (
                <div className="text-center py-12">
                  <p className="text-[#64748B]">Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <SettingsPanel />
          )}
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1E293B] border-[#334155] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Audit Véhicule</DialogTitle>
          </DialogHeader>
          {selectedVehicle && <VehicleAuditView vehicle={selectedVehicle} />}
        </DialogContent>
      </Dialog>

      <AddGarageDialog
        open={addGarageDialogOpen}
        onOpenChange={setAddGarageDialogOpen}
        onAdd={handleAddGarage}
      />

      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onAdd={handleAddUser}
      />
    </div>
  )
}

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#8B5CF6] rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="text-[#94A3B8] font-medium">Chargement...</span>
        </div>
      </div>
    }>
      <SuperAdminDashboardContent />
    </Suspense>
  )
}
