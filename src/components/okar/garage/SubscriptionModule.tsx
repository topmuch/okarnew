/**
 * OKAR - Subscription Module
 * Module de gestion des abonnements pour les garages
 * - Affichage du plan actuel
 * - Fonctionnalités et limites
 * - Mise à niveau et renouvellement
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CreditCard,
  Check,
  Crown,
  Star,
  Zap,
  Loader2,
  Calendar,
  TrendingUp,
  Users,
  QrCode,
  FileText,
  Phone,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionData {
  plan: string
  status: string
  expiry: Date | string | null
}

interface GarageSettings {
  id: string
  businessName: string
  subscription: SubscriptionData
  totalClients: number
  totalRevenue: number
  createdAt: Date | string
}

interface PlanFeature {
  name: string
  included: boolean
  limit?: string
}

interface Plan {
  id: string
  name: string
  price: number
  priceDisplay: string
  description: string
  icon: typeof Star
  color: string
  bgGradient: string
  features: PlanFeature[]
  recommended?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceDisplay: 'Gratuit',
    description: 'Pour découvrir OKAR',
    icon: Star,
    color: 'text-gray-400',
    bgGradient: 'from-gray-500/10 to-gray-600/5',
    features: [
      { name: '50 QR Codes', included: true },
      { name: 'Carnet d\'entretien numérique', included: true },
      { name: 'Gestion clients (50 max)', included: true },
      { name: 'Support par email', included: true },
      { name: 'Statistiques basiques', included: false },
      { name: 'Export PDF', included: false },
      { name: 'QR Codes illimités', included: false },
      { name: 'Support prioritaire', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 25000,
    priceDisplay: '25 000 FCFA/mois',
    description: 'Pour les garages en croissance',
    icon: Zap,
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/10 to-pink-500/5',
    recommended: true,
    features: [
      { name: '500 QR Codes', included: true },
      { name: 'Carnet d\'entretien numérique', included: true },
      { name: 'Gestion clients (500 max)', included: true },
      { name: 'Support WhatsApp prioritaire', included: true },
      { name: 'Statistiques avancées', included: true },
      { name: 'Export PDF & Excel', included: true },
      { name: 'QR Codes illimités', included: false },
      { name: 'Account manager dédié', included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 75000,
    priceDisplay: '75 000 FCFA/mois',
    description: 'Pour les professionnels exigents',
    icon: Crown,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-indigo-500/5',
    features: [
      { name: 'QR Codes illimités', included: true },
      { name: 'Carnet d\'entretien numérique', included: true },
      { name: 'Clients illimités', included: true },
      { name: 'Support prioritaire 24/7', included: true },
      { name: 'Statistiques avancées + IA', included: true },
      { name: 'Export PDF & Excel', included: true },
      { name: 'API & Intégrations', included: true },
      { name: 'Account manager dédié', included: true },
    ]
  }
]

export function SubscriptionModule() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<GarageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgradeDialog, setUpgradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/garage/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setUpgradeDialog(true)
  }

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !settings) return

    setProcessing(true)
    try {
      const res = await fetch('/api/garage/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: settings.id,
          plan: selectedPlan.id
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Abonnement mis à jour',
          description: `Votre abonnement ${selectedPlan.name} est maintenant actif`,
        })
        setUpgradeDialog(false)
        fetchSettings()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'abonnement',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Non définie'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const currentPlan = PLANS.find(p => p.id === settings?.subscription?.plan) || PLANS[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff6201]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-[#ff6201]" />
          Abonnement
        </h2>
        <p className="text-[#94A3B8] mt-1">Gérez votre abonnement et vos options</p>
      </div>

      {/* Plan actuel */}
      <Card className={`bg-gradient-to-br ${currentPlan.bgGradient} border border-white/10 rounded-2xl`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                currentPlan.id === 'free' ? 'bg-gray-500/20' :
                currentPlan.id === 'premium' ? 'bg-orange-500/20' : 'bg-purple-500/20'
              }`}>
                <currentPlan.icon className={`h-7 w-7 ${currentPlan.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{currentPlan.name}</h3>
                  {currentPlan.recommended && (
                    <Badge className="bg-orange-500 text-white text-xs">Recommandé</Badge>
                  )}
                </div>
                <p className="text-[#94A3B8]">{currentPlan.priceDisplay}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${
                settings?.subscription?.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : settings?.subscription?.status === 'suspended'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {settings?.subscription?.status === 'active' ? 'Actif' : 
                 settings?.subscription?.status === 'suspended' ? 'Suspendu' : 'Expiré'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-1">
                <Calendar className="h-4 w-4" />
                Expiration
              </div>
              <p className="text-white font-medium">{formatDate(settings?.subscription?.expiry)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-1">
                <Users className="h-4 w-4" />
                Clients
              </div>
              <p className="text-white font-medium">{settings?.totalClients || 0}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Revenus
              </div>
              <p className="text-white font-medium">{(settings?.totalRevenue || 0).toLocaleString()} FCFA</p>
            </div>
          </div>

          {settings?.subscription?.plan !== 'pro' && (
            <Button
              onClick={() => handleSelectPlan(PLANS.find(p => p.id === 'premium') || PLANS[1])}
              className="mt-6 bg-gradient-to-r from-[#ff6201] to-pink-500 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Passer à Premium
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Comparaison des plans */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Comparer les plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = settings?.subscription?.plan === plan.id
            return (
              <Card 
                key={plan.id}
                className={`bg-slate-800/40 backdrop-blur-md rounded-2xl border ${
                  plan.recommended ? 'border-[#ff6201]' : 'border-white/10'
                } ${isCurrentPlan ? 'ring-2 ring-[#ff6201]' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <plan.icon className={`h-5 w-5 ${plan.color}`} />
                      <CardTitle className="text-white">{plan.name}</CardTitle>
                    </div>
                    {plan.recommended && (
                      <Badge className="bg-[#ff6201] text-white text-xs">Populaire</Badge>
                    )}
                  </div>
                  <CardDescription className="text-[#94A3B8]">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-white">{plan.priceDisplay}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-600" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-white' : 'text-[#64748B]'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button 
                        variant="outline" 
                        className="w-full border-white/10 text-[#94A3B8]"
                        disabled
                      >
                        Plan actuel
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full ${
                          plan.recommended 
                            ? 'bg-gradient-to-r from-[#ff6201] to-pink-500 text-white' 
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {plan.id === 'free' && settings?.subscription?.plan !== 'free' ? 'Passer à Gratuit' : 'Choisir'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Historique et factures */}
      <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#ff6201]" />
            Historique
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Vos derniers paiements et factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), amount: 25000, plan: 'Premium', status: 'paid' },
              { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), amount: 25000, plan: 'Premium', status: 'paid' },
              { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), amount: 0, plan: 'Gratuit', status: 'free' },
            ].map((invoice, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#ff6201]/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#ff6201]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{invoice.plan} - {invoice.date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                    <p className="text-[#64748B] text-sm">
                      {invoice.amount > 0 ? `${invoice.amount.toLocaleString()} FCFA` : 'Gratuit'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {invoice.status === 'paid' ? 'Payé' : 'Gratuit'}
                  </Badge>
                  {invoice.amount > 0 && (
                    <Button variant="ghost" size="sm" className="text-[#94A3B8]">
                      Télécharger
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact support */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Phone className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Besoin d'aide ?</p>
              <p className="text-[#94A3B8] text-sm">Notre équipe est disponible pour vous accompagner</p>
            </div>
            <Button
              onClick={() => window.open('tel:+221784858226')}
              variant="outline"
              className="border-blue-500/30 text-blue-400"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contacter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Upgrade */}
      <Dialog open={upgradeDialog} onOpenChange={setUpgradeDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ff6201]" />
              Confirmer la mise à niveau
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Vous êtes sur le point de passer au plan {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#94A3B8]">Plan</span>
                <span className="text-white font-medium">{selectedPlan?.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#94A3B8]">Prix</span>
                <span className="text-white font-medium">{selectedPlan?.priceDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Validité</span>
                <span className="text-white font-medium">1 an</span>
              </div>
            </div>

            <div className="bg-[#ff6201]/10 border border-[#ff6201]/20 rounded-xl p-4">
              <p className="text-sm text-[#94A3B8]">
                <span className="text-[#ff6201] font-medium">Note:</span> Le paiement sera effectué via Orange Money ou Wave. Vous recevrez une confirmation par SMS.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-[#94A3B8]"
                onClick={() => setUpgradeDialog(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#ff6201] to-pink-500 text-white"
                onClick={handleConfirmUpgrade}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SubscriptionModule
