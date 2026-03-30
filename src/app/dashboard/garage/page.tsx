/**
 * OKAR - Dashboard Garage "Clean Focus"
 * 
 * Design orienté productivité pour outils B2B à haute fréquence
 * - Hiérarchie visuelle stricte
 * - Actions prioritaires immédiatement visibles
 * - Palette épurée (couleurs réservées aux états)
 * - Performance maximale
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { GarageSidebar } from '@/components/okar/garage/GarageSidebar'
import { BusinessModule } from '@/components/okar/garage/BusinessModule'
import { StockQRModule } from '@/components/okar/garage/StockQRModule'
import { ChantiersModule } from '@/components/okar/garage/ChantiersModule'
import { ClientsModule } from '@/components/okar/garage/ClientsModule'
import { SettingsModule } from '@/components/okar/garage/SettingsModule'
import { QRScannerModal } from '@/components/okar/garage/QRScannerModal'
import { InterventionFormModal } from '@/components/okar/garage/InterventionFormModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  QrCode,
  Wrench,
  Users,
  Bell,
  Car,
  ScanLine,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  ChevronRight,
  Package,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GaragePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [interventionOpen, setInterventionOpen] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return

    if (!isAuthenticated || !user) {
      window.location.href = '/login'
      return
    }

    const validRoles = ['garage_certified', 'garage_pending']
    if (!validRoles.includes(user.role)) {
      const dashboardRoutes: Record<string, string> = {
        superadmin: '/dashboard/superadmin',
        driver: '/dashboard/driver',
      }
      window.location.href = dashboardRoutes[user.role] || '/'
      return
    }
  }, [mounted, isLoading, isAuthenticated, user])

  // Écran de chargement
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#334155] border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748B]">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <p className="text-[#64748B]">Redirection...</p>
      </div>
    )
  }

  const validRoles = ['garage_certified', 'garage_pending']
  if (!validRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <p className="text-[#64748B]">Redirection...</p>
      </div>
    )
  }

  // Garage en attente
  if (user.role === 'garage_pending' && !user.isApproved) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1E293B] border-[#334155]">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-[#F59E0B]" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Compte en attente</h1>
            <p className="text-[#94A3B8]">
              Votre compte garage est en attente de validation par un administrateur.
            </p>
            <Badge className="mt-4 bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20">
              En cours de vérification
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render le module actif
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview user={user} onOpenScanner={() => setScannerOpen(true)} onOpenIntervention={() => setInterventionOpen(true)} />
      case 'business':
        return <BusinessModule />
      case 'stock':
        return <StockQRModule onOpenScanner={() => setScannerOpen(true)} />
      case 'chantiers':
        return <ChantiersModule onOpenIntervention={() => setInterventionOpen(true)} />
      case 'clients':
        return <ClientsModule />
      case 'settings':
        return <SettingsModule />
      default:
        return <DashboardOverview user={user} onOpenScanner={() => setScannerOpen(true)} onOpenIntervention={() => setInterventionOpen(true)} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <GarageSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header Compact */}
        <header className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur-sm border-b border-[#1E293B]">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: Title + Date */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {getTabTitle(activeTab)}
                </h1>
                <p className="text-[#64748B] text-xs">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short'
                  })}
                </p>
              </div>
            </div>
            
            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon"
                className="relative text-[#64748B] hover:text-white hover:bg-[#1E293B] h-9 w-9"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
              </Button>

              {/* Quick Scan Button */}
              <Button
                onClick={() => setScannerOpen(true)}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-9 px-4"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Scanner
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {renderActiveModule()}
        </div>
      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal 
        open={scannerOpen} 
        onOpenChange={setScannerOpen} 
      />

      {/* Intervention Form Modal */}
      <InterventionFormModal
        open={interventionOpen}
        onOpenChange={setInterventionOpen}
      />
    </div>
  )
}

// Dashboard Overview Component - "Clean Focus"
function DashboardOverview({ 
  user, 
  onOpenScanner,
  onOpenIntervention
}: { 
  user: any
  onOpenScanner: () => void
  onOpenIntervention: () => void
}) {
  const [stats, setStats] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/garage/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data)
        }
      })
    
    // Simuler des alertes
    setAlerts([
      { type: 'warning', message: '3 vidanges à prévoir cette semaine', count: 3 },
      { type: 'urgent', message: '2 CT expirés', count: 2 },
    ])
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return `${amount}`
  }

  const qrPercentage = stats?.qrStock?.percentage || 23.5
  const qrLow = qrPercentage > 80

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: ZONE D'ACTION PRINCIPALE - Les 2 Gros Boutons
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-4">
        {/* Bouton Principal: Scanner */}
        <button
          onClick={onOpenScanner}
          className="group relative bg-[#3B82F6] hover:bg-[#2563EB] rounded-2xl p-8 text-left transition-all duration-150 overflow-hidden min-h-[120px] flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ScanLine className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl">Scanner un Véhicule</p>
            <p className="text-white/70 text-sm mt-1">Action principale • Identifiez instantanément</p>
          </div>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>

        {/* Bouton Secondaire: Nouvelle Intervention */}
        <button
          onClick={onOpenIntervention}
          className="group relative bg-[#1E293B] hover:bg-[#334155] border border-[#334155] hover:border-[#475569] rounded-2xl p-8 text-left transition-all duration-150 overflow-hidden min-h-[120px] flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-[#475569]/50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="h-8 w-8 text-[#94A3B8] group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="text-white font-bold text-xl">Nouvelle Intervention</p>
            <p className="text-[#94A3B8] text-sm mt-1">Enregistrement manuel</p>
          </div>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#475569] group-hover:text-[#94A3B8] group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: KPIs DISCRETS - Ligne compacte
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'CA Mois', value: formatCurrency(stats?.caEstime || 2450000), unit: 'FCFA', icon: TrendingUp },
          { label: 'En cours', value: stats?.enCours || 3, unit: 'chantiers', icon: Wrench },
          { label: 'Clients actifs', value: stats?.clientsOKAR || 156, unit: '', icon: Users },
          { label: 'Stock QR', value: stats?.qrStock?.disponibles || 153, unit: 'disponibles', icon: QrCode, alert: qrLow },
        ].map((kpi, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-[#1E293B] rounded-xl p-4 border",
              kpi.alert ? "border-[#F59E0B]/30" : "border-[#1E293B]"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#64748B] text-xs">{kpi.label}</span>
              <kpi.icon className={cn("h-4 w-4", kpi.alert ? "text-[#F59E0B]" : "text-[#64748B]")} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{kpi.value}</span>
              {kpi.unit && <span className="text-[#64748B] text-xs">{kpi.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: À TRAITER AUJOURD'HUI - Workflow compact
      ═══════════════════════════════════════════════════════════════ */}
      <Card className="bg-[#1E293B] border-[#1E293B]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#64748B]" />
              À Traiter Aujourd'hui
            </h3>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors",
                    alert.type === 'urgent' 
                      ? "bg-[#EF4444]/10 hover:bg-[#EF4444]/15 border border-[#EF4444]/20"
                      : "bg-[#F59E0B]/10 hover:bg-[#F59E0B]/15 border border-[#F59E0B]/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      alert.type === 'urgent' ? "bg-[#EF4444]/20" : "bg-[#F59E0B]/20"
                    )}>
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        alert.type === 'urgent' ? "text-[#F87171]" : "text-[#FBBF24]"
                      )} />
                    </div>
                    <span className="text-[#CBD5E1] text-sm">{alert.message}</span>
                  </div>
                  <Badge className={cn(
                    "border-0 text-xs font-bold",
                    alert.type === 'urgent' 
                      ? "bg-[#EF4444]/20 text-[#F87171]"
                      : "bg-[#F59E0B]/20 text-[#FBBF24]"
                  )}>
                    {alert.count}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-6 text-[#64748B]">
              <CheckCircle className="h-5 w-5 text-[#10B981]" />
              <span>Tout est à jour</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: GESTION CLIENTS & STOCK - Deux colonnes
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-4">
        {/* Derniers Clients */}
        <Card className="bg-[#1E293B] border-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-[#64748B]" />
                Derniers Clients
              </h3>
              <button className="text-xs text-[#64748B] hover:text-white transition-colors">
                Voir tout →
              </button>
            </div>
            
            <div className="space-y-2">
              {[
                { name: 'Mamadou Diop', vehicle: 'Peugeot 208', date: 'Aujourd\'hui' },
                { name: 'Fatou Sow', vehicle: 'Renault Logan', date: 'Hier' },
                { name: 'Ousmane Ba', vehicle: 'Toyota Corolla', date: '2 jours' },
              ].map((client, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0F172A]/50 rounded-xl hover:bg-[#0F172A] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#334155] rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{client.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{client.name}</p>
                      <p className="text-[#64748B] text-xs">{client.vehicle}</p>
                    </div>
                  </div>
                  <span className="text-[#64748B] text-xs">{client.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* État du Stock QR */}
        <Card className="bg-[#1E293B] border-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-[#64748B]" />
                État du Stock QR
              </h3>
            </div>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#64748B]">Utilisés</span>
                  <span className="text-white font-medium">{stats?.qrStock?.utilises || 47} / {stats?.qrStock?.total || 200}</span>
                </div>
                <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      qrLow ? "bg-[#F59E0B]" : "bg-[#3B82F6]"
                    )}
                    style={{ width: `${qrPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F172A]/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{stats?.qrStock?.disponibles || 153}</p>
                  <p className="text-[#64748B] text-xs">Disponibles</p>
                </div>
                <div className="bg-[#0F172A]/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{stats?.qrStock?.actifs || 47}</p>
                  <p className="text-[#64748B] text-xs">Actifs</p>
                </div>
              </div>

              {/* Commander Button */}
              {qrLow && (
                <Button 
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white"
                  size="sm"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Commander des QR Codes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: PUBLICITÉ & GAMIFICATION - Déplacé en bas, discret
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-4">
        {/* Promo discrète */}
        <div className="bg-gradient-to-r from-[#1E293B] to-[#334155]/50 rounded-xl p-4 border border-[#334155]/50 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-[#FBBF24]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Promo Partenaires</p>
            <p className="text-[#64748B] text-xs truncate">-15% sur les pneus chez nos partenaires</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#64748B] shrink-0" />
        </div>

        {/* Badge/Réputation */}
        <div className="bg-[#1E293B] rounded-xl p-4 border border-[#1E293B] flex items-center gap-4">
          <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-lg">🏆</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Top 10% OKAR</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-[#FBBF24] text-xs">★</span>
              ))}
              <span className="text-[#94A3B8] text-xs ml-1">{stats?.note || '4.8'}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// Get tab title
function getTabTitle(tab: string): string {
  const titles: Record<string, string> = {
    dashboard: 'Tableau de Bord',
    business: 'Business & Revenus',
    stock: 'Stock QR Codes',
    chantiers: 'Chantiers',
    clients: 'Clients',
    settings: 'Paramètres',
  }
  return titles[tab] || 'Dashboard'
}
