/**
 * OKAR - Settings Module
 * Module de configuration du garage
 * - Abonnement
 * - Configuration garage
 * - Profil Public
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  Crown,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Car,
  Zap,
  Shield,
  Loader2,
  Save,
} from 'lucide-react'

interface SettingsModuleProps {
  garageId?: string
}

interface GarageSettings {
  id: string
  businessName: string
  address: string
  city: string
  phone: string
  email: string
  contactName: string
  contactPhone: string
  latitude?: number
  longitude?: number
  isActive: boolean
  certificationDate?: Date
  rating: number
  subscription: {
    plan: string
    status: string
    expiry?: Date
  }
  specialties: string[]
  workingHours: Record<string, { open: string; close: string; closed: boolean }>
  publicDescription?: string
  websiteUrl?: string
  photos: string[]
  totalClients: number
  totalRevenue: number
  createdAt: Date
}

const SPECIALTIES_OPTIONS = [
  { value: 'Moteur', icon: Settings, label: 'Mécanique Moteur' },
  { value: 'Carrosserie', icon: Car, label: 'Carrosserie' },
  { value: 'Électricité', icon: Zap, label: 'Électricité Auto' },
  { value: 'Climatisation', icon: Car, label: 'Climatisation' },
  { value: 'Pneus', icon: Car, label: 'Pneumatique' },
  { value: 'Freins', icon: Shield, label: 'Freinage' },
  { value: 'Diagnostic', icon: Zap, label: 'Diagnostic' },
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAYS_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

const PLAN_CONFIG: Record<string, { label: string; price: string; features: string[] }> = {
  free: {
    label: 'Gratuit',
    price: '0 FCFA/mois',
    features: ['10 QR codes', 'Profil basique', 'Support email']
  },
  premium: {
    label: 'Premium',
    price: '25 000 FCFA/mois',
    features: ['100 QR codes', 'Profil enrichi', 'Statistiques', 'Support prioritaire']
  },
  pro: {
    label: 'Pro',
    price: '50 000 FCFA/mois',
    features: ['QR codes illimités', 'Profil premium', 'Analytics avancés', 'API access', 'Support dédié']
  }
}

export function SettingsModule({ garageId }: SettingsModuleProps) {
  const [settings, setSettings] = useState<GarageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('premium')
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    city: '',
    phone: '',
    publicDescription: '',
    websiteUrl: '',
    specialties: [] as string[],
    workingHours: {} as Record<string, { open: string; close: string; closed: boolean }>
  })

  useEffect(() => {
    fetchSettings()
  }, [garageId])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/garage/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
        setFormData({
          businessName: data.data.businessName || '',
          address: data.data.address || '',
          city: data.data.city || '',
          phone: data.data.phone || '',
          publicDescription: data.data.publicDescription || '',
          websiteUrl: data.data.websiteUrl || '',
          specialties: data.data.specialties || [],
          workingHours: data.data.workingHours || getDefaultWorkingHours()
        })
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/garage/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: garageId || 'demo-garage-id',
          ...formData
        })
      })
      const data = await res.json()
      if (data.success) {
        // Success feedback
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRenew = async () => {
    try {
      const res = await fetch('/api/garage/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: garageId || 'demo-garage-id',
          plan: selectedPlan
        })
      })
      const data = await res.json()
      if (data.success) {
        setRenewDialogOpen(false)
        fetchSettings()
      }
    } catch (error) {
      console.error('Erreur renouvellement:', error)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const updateWorkingHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }))
  }

  const getDefaultWorkingHours = () => {
    const hours: Record<string, { open: string; close: string; closed: boolean }> = {}
    DAYS.forEach(day => {
      hours[day] = {
        open: day === 'saturday' ? '09:00' : '08:00',
        close: day === 'saturday' ? '14:00' : day === 'friday' ? '17:00' : '18:00',
        closed: day === 'sunday'
      }
    })
    return hours
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-okar-dark-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Abonnement */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-okar-text-primary">
            <Crown className="h-5 w-5 text-amber-400" />
            Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut actuel */}
          <div className="flex items-center justify-between p-4 bg-okar-dark-800/30 rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                settings?.subscription?.status === 'active' 
                  ? 'bg-emerald-500/20' 
                  : 'bg-rose-500/20'
              }`}>
                {settings?.subscription?.status === 'active' ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-rose-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-okar-text-primary">
                  Plan {PLAN_CONFIG[settings?.subscription?.plan || 'free']?.label}
                </p>
                <Badge className={`${
                  settings?.subscription?.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-rose-500/20 text-rose-300'
                } border-0`}>
                  {settings?.subscription?.status === 'active' ? 'Actif' : 'Expiré'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-okar-text-muted">Date de renouvellement</p>
              <p className="font-medium text-okar-text-secondary">
                {settings?.subscription?.expiry 
                  ? new Date(settings.subscription.expiry).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Non défini'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setRenewDialogOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Renouveler / Changer de plan
          </Button>
        </CardContent>
      </Card>

      {/* Section Configuration Garage */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-okar-text-primary">
            <Settings className="h-5 w-5 text-pink-400" />
            Configuration Garage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Infos de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Nom du garage</Label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Adresse</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Ville</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
          </div>

          {/* Spécialités */}
          <div>
            <Label className="text-okar-text-secondary mb-3 block">Spécialités</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES_OPTIONS.map((spec) => {
                const isSelected = formData.specialties.includes(spec.value)
                return (
                  <button
                    key={spec.value}
                    onClick={() => toggleSpecialty(spec.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                        : 'bg-okar-dark-800/30 text-okar-text-muted border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {spec.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Horaires */}
          <div>
            <Label className="text-okar-text-secondary mb-3 block">Horaires d'ouverture</Label>
            <div className="space-y-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-4 p-3 bg-okar-dark-800/30 rounded-lg border border-white/5"
                >
                  <span className="w-24 text-sm text-okar-text-secondary">{DAYS_LABELS[day]}</span>
                  <Switch
                    checked={!formData.workingHours[day]?.closed}
                    onCheckedChange={(checked) => updateWorkingHours(day, 'closed', !checked)}
                  />
                  {!formData.workingHours[day]?.closed && (
                    <>
                      <Input
                        type="time"
                        value={formData.workingHours[day]?.open || '08:00'}
                        onChange={(e) => updateWorkingHours(day, 'open', e.target.value)}
                        className="w-28 bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                      />
                      <span className="text-okar-text-muted">à</span>
                      <Input
                        type="time"
                        value={formData.workingHours[day]?.close || '18:00'}
                        onChange={(e) => updateWorkingHours(day, 'close', e.target.value)}
                        className="w-28 bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                      />
                    </>
                  )}
                  {formData.workingHours[day]?.closed && (
                    <span className="text-okar-text-muted text-sm">Fermé</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description publique */}
          <div className="space-y-2">
            <Label className="text-okar-text-secondary">Description publique</Label>
            <Textarea
              value={formData.publicDescription}
              onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
              placeholder="Décrivez votre garage, vos services, votre expérience..."
              className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary min-h-24"
            />
          </div>

          {/* Site web */}
          <div className="space-y-2">
            <Label className="text-okar-text-secondary">Site web (optionnel)</Label>
            <Input
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://votre-garage.sn"
              className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
            />
          </div>

          {/* Bouton sauvegarder */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder les modifications
          </Button>
        </CardContent>
      </Card>

      {/* Section Profil Public */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-okar-text-primary">
            <ExternalLink className="h-5 w-5 text-pink-400" />
            Profil Public
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aperçu */}
          <div className="bg-okar-dark-800/30 rounded-xl p-6 border border-white/5">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {settings?.businessName?.charAt(0) || 'G'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-okar-text-primary">{settings?.businessName}</h3>
                <p className="text-okar-text-muted mt-1">{settings?.address}, {settings?.city}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= Math.floor(settings?.rating || 0)
                            ? 'text-amber-400'
                            : 'text-gray-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-1 text-okar-text-secondary font-medium">{settings?.rating}</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-0">Certifié</Badge>
                </div>
                {formData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.specialties.map((spec) => (
                      <Badge key={spec} className="bg-okar-dark-700 text-okar-text-secondary border-0">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lien public */}
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 bg-okar-dark-800/50 rounded-lg border border-white/10">
              <p className="text-sm text-okar-text-muted">Lien de votre vitrine</p>
              <p className="text-okar-text-primary font-mono text-sm">
                okar.sn/garage/{settings?.id || 'demo'}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-white/10 text-okar-text-secondary hover:text-white"
              onClick={() => window.open(`/garage/${settings?.id}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload photos */}
          <div>
            <Label className="text-okar-text-secondary mb-3 block">Photos du garage</Label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-okar-text-muted hover:border-pink-500/30 transition-colors cursor-pointer"
                >
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-xs">Photo {i}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog renouvellement */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="max-w-lg bg-okar-dark-card border-white/10 text-okar-text-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              Choisir un plan
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Sélectionnez le plan qui convient à votre garage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {Object.entries(PLAN_CONFIG).map(([key, plan]) => (
              <button
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedPlan === key
                    ? 'bg-pink-500/20 border border-pink-500/30'
                    : 'bg-okar-dark-800/30 border border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-okar-text-primary">{plan.label}</span>
                  <span className="text-amber-300 font-medium">{plan.price}</span>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-okar-text-muted flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setRenewDialogOpen(false)}
              className="flex-1 border-white/10 text-okar-text-secondary"
            >
              Annuler
            </Button>
            <Button
              onClick={handleRenew}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Souscrire
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SettingsModule
