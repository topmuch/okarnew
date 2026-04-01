/**
 * OKAR - Formulaire d'Intervention Structuré
 * 
 * Types: Entretien Courant, Grosse Mécanique, Carrosserie/Accident
 * Champs dynamiques selon le type
 * Signature numérique
 * Intégration Smart Oil Wizard pour vidanges
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Wrench,
  Droplets,
  Settings,
  Car,
  Camera,
  Upload,
  CheckCircle2,
  Clock,
  FileText,
  PenTool,
  Loader2,
  AlertTriangle,
  Shield,
  Trash2,
  Plus,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { SmartOilWizard, OilChangeData } from './SmartOilWizard'
import { getClassificationSummary, VehicleData } from '@/lib/vehicleClassifier'
import { toast } from 'sonner'

interface InterventionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: {
    id: string
    plateNumber: string
    brand: string
    model: string
    mileage: number
    year?: number | null
  }
  garageId?: string
  onInterventionCreated?: (intervention: any) => void
}

type InterventionType = 'oil_change' | 'maintenance' | 'major_repair' | 'accident' | 'inspection'
type Step = 'type' | 'details' | 'oil_wizard' | 'signature' | 'complete'

interface FormData {
  type: InterventionType | ''
  mileage: string
  description: string
  cost: string
  // Vidange spécifique
  oilViscosity: string
  oilBrand: string
  oilQuantity: string
  filterChanged: boolean
  // Grosse méca spécifique
  affectedPart: string
  partCondition: 'new' | 'used' | ''
  parts: { name: string; quantity: number; price: number }[]
  // Commun
  photos: string[]
  invoiceUrl: string
}

const INTERVENTION_TYPES = [
  { 
    value: 'oil_change', 
    label: 'Vidange', 
    icon: Droplets, 
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    description: 'Changement d\'huile et filtre - Assistant intelligent disponible'
  },
  { 
    value: 'maintenance', 
    label: 'Entretien Courant', 
    icon: Wrench, 
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    description: 'Plaquettes, filtres, bougies...'
  },
  { 
    value: 'major_repair', 
    label: 'Grosse Mécanique', 
    icon: Settings, 
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    description: 'Moteur, boîte, suspension...'
  },
  { 
    value: 'accident', 
    label: 'Carrosserie / Accident', 
    icon: AlertTriangle, 
    color: 'text-rose-400',
    bg: 'bg-rose-500/20',
    description: 'Réparation après sinistre'
  },
  { 
    value: 'inspection', 
    label: 'Contrôle Technique', 
    icon: Shield, 
    color: 'text-violet-400',
    bg: 'bg-violet-500/20',
    description: 'Diagnostic et inspection'
  },
]

const OIL_VISCOSITIES = ['5W-30', '5W-40', '10W-40', '15W-40', '0W-20', '0W-30']

const AFFECTED_PARTS = [
  'Moteur',
  'Boîte de vitesses',
  'Embrayage',
  'Freins (avant)',
  'Freins (arrière)',
  'Suspension',
  'Direction',
  'Système de refroidissement',
  'Échappement',
  'Électrique',
  'Climatisation',
]

export function InterventionFormModal({ 
  open, 
  onOpenChange, 
  vehicle,
  garageId = 'demo-garage-id',
  onInterventionCreated 
}: InterventionFormModalProps) {
  const [step, setStep] = useState<Step>('type')
  const [formData, setFormData] = useState<FormData>({
    type: '',
    mileage: vehicle?.mileage?.toString() || '',
    description: '',
    cost: '',
    oilViscosity: '',
    oilBrand: '',
    oilQuantity: '',
    filterChanged: false,
    affectedPart: '',
    partCondition: '',
    parts: [],
    photos: [],
    invoiceUrl: '',
  })
  
  const [signature, setSignature] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [oilWizardData, setOilWizardData] = useState<OilChangeData | null>(null)
  const [useOilWizard, setUseOilWizard] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setStep('type')
        setFormData({
          type: '',
          mileage: vehicle?.mileage?.toString() || '',
          description: '',
          cost: '',
          oilViscosity: '',
          oilBrand: '',
          oilQuantity: '',
          filterChanged: false,
          affectedPart: '',
          partCondition: '',
          parts: [],
          photos: [],
          invoiceUrl: '',
        })
        setSignature(null)
        setOilWizardData(null)
        setUseOilWizard(true)
      })
    }
  }, [open, vehicle])

  // Signature canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || step !== 'signature') return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.strokeStyle = '#ec4899'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      }
    }
    
    const start = (e: MouseEvent | TouchEvent) => {
      setIsDrawing(true)
      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
    
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      const pos = getPos(e)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
    
    const stop = () => {
      if (isDrawing) {
        setIsDrawing(false)
        setSignature(canvas.toDataURL())
      }
    }
    
    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stop)
    canvas.addEventListener('mouseleave', stop)
    canvas.addEventListener('touchstart', start)
    canvas.addEventListener('touchmove', draw)
    canvas.addEventListener('touchend', stop)
    
    return () => {
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stop)
      canvas.removeEventListener('mouseleave', stop)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stop)
    }
  }, [isDrawing, step])

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  const addPart = () => {
    setFormData({
      ...formData,
      parts: [...formData.parts, { name: '', quantity: 1, price: 0 }]
    })
  }

  const updatePart = (index: number, field: 'name' | 'quantity' | 'price', value: string | number) => {
    const newParts = [...formData.parts]
    newParts[index] = { ...newParts[index], [field]: value }
    setFormData({ ...formData, parts: newParts })
  }

  const removePart = (index: number) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_, i) => i !== index)
    })
  }

  // Handle Oil Wizard validation
  const handleOilWizardValidate = (data: OilChangeData) => {
    setOilWizardData(data)
    // Auto-fill form data from wizard
    setFormData(prev => ({
      ...prev,
      oilViscosity: data.selectedOil.viscosity,
      oilBrand: data.selectedOil.brands[0] || '',
      oilQuantity: data.quantity.toString(),
      filterChanged: data.selectedFilters.length > 0,
      cost: data.estimatedPrice.toString(),
      description: `Vidange ${data.categoryInfo.shortLabel} - ${data.selectedOil.viscosity} (${data.quantity}L)\n${data.notes}`
    }))
    setStep('signature')
  }

  // Submit intervention
  const handleSubmit = async () => {
    if (!vehicle?.id) {
      toast.error('Véhicule non spécifié')
      return
    }

    setSubmitting(true)
    
    try {
      const interventionData = {
        garageId,
        vehicleId: vehicle.id,
        type: formData.type,
        title: getInterventionTitle(formData.type),
        description: formData.description,
        mileage: parseInt(formData.mileage),
        cost: parseFloat(formData.cost),
        oilType: formData.type === 'oil_change' ? formData.oilViscosity : null,
        oilQuantity: formData.type === 'oil_change' ? parseFloat(formData.oilQuantity) : null,
        parts: formData.parts.length > 0 ? formData.parts : null,
        photos: formData.photos.length > 0 ? formData.photos : null,
        invoiceUrl: formData.invoiceUrl || null,
        signature,
        oilWizardData: oilWizardData ? {
          category: oilWizardData.category,
          oilId: oilWizardData.selectedOil.id,
          quantity: oilWizardData.quantity,
          filters: oilWizardData.selectedFilters,
          additionalChecks: oilWizardData.additionalChecks,
          estimatedPrice: oilWizardData.estimatedPrice
        } : null
      }

      const response = await fetch('/api/garage/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interventionData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Intervention enregistrée avec succès')
        
        // Send WhatsApp notification if phone is available
        const ownerPhone = vehicle.ownerPhone || localStorage.getItem('lastScannedPhone')
        if (ownerPhone && formData.type === 'oil_change') {
          const message = generateWhatsAppMessage(vehicle, formData)
          // Open WhatsApp with pre-filled message
          window.open(`https://wa.me/${ownerPhone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
        }
        
        onInterventionCreated?.(result.data)
        setStep('complete')
      } else {
        toast.error(result.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'enregistrement de l\'intervention')
    } finally {
      setSubmitting(false)
    }
  }

  // Generate WhatsApp message
  const generateWhatsAppMessage = (vehicle: any, data: FormData) => {
    let message = `🚗 *INTERVENTION ENREGISTRÉE*\n\n`
    message += `Véhicule: ${vehicle.plateNumber}\n`
    message += `${vehicle.brand} ${vehicle.model}\n\n`
    message += `📝 *${getInterventionTitle(data.type)}*\n`
    message += `Kilométrage: ${parseInt(data.mileage).toLocaleString()} km\n`
    
    if (data.type === 'oil_change') {
      message += `\n🛢️ Huile: ${data.oilViscosity}\n`
      message += `Quantité: ${data.oilQuantity}L\n`
      if (data.filterChanged) {
        message += `✅ Filtre à huile changé\n`
      }
    }
    
    message += `\n💰 Coût: ${parseInt(data.cost).toLocaleString()} FCFA\n`
    message += `\n✅ Intervention certifiée par OKAR\n`
    message += `Garage: ${localStorage.getItem('garageName') || 'Garage OKAR'}`
    
    return message
  }

  const getInterventionTitle = (type: string): string => {
    const titles: Record<string, string> = {
      oil_change: 'Vidange moteur',
      maintenance: 'Entretien courant',
      major_repair: 'Réparation majeure',
      accident: 'Réparation carrosserie',
      inspection: 'Contrôle technique',
      tire_change: 'Changement de pneus',
      battery: 'Remplacement batterie'
    }
    return titles[type] || 'Intervention'
  }

  const selectedType = INTERVENTION_TYPES.find(t => t.value === formData.type)

  // Get vehicle data for oil wizard
  const vehicleDataForWizard: VehicleData | null = vehicle ? {
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    mileage: parseInt(formData.mileage) || vehicle.mileage,
    plateNumber: vehicle.plateNumber,
  } : null

  // Render step content
  const renderStepContent = () => {
    // Step 1: Type selection
    if (step === 'type') {
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-okar-text-secondary font-medium">Type d'intervention</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INTERVENTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as InterventionType })}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    formData.type === type.value
                      ? 'border-pink-500/50 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                      : 'border-white/10 bg-okar-dark-800/30 hover:bg-okar-dark-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${type.bg} rounded-lg flex items-center justify-center`}>
                      <type.icon className={`h-5 w-5 ${type.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-okar-text-primary">{type.label}</p>
                      <p className="text-xs text-okar-text-muted">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-okar-text-muted text-xs">Kilométrage actuel *</Label>
              <Input
                type="number"
                placeholder="125000"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-muted text-xs">Coût estimé (FCFA)</Label>
              <Input
                type="number"
                placeholder="45000"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-white/10 text-okar-text-secondary">
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (formData.type === 'oil_change' && useOilWizard && vehicleDataForWizard) {
                  setStep('oil_wizard')
                } else {
                  setStep('details')
                }
              }}
              disabled={!formData.type || !formData.mileage}
              className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700"
            >
              Continuer
            </Button>
          </div>
        </div>
      )
    }

    // Step 2: Oil Wizard (for oil_change only)
    if (step === 'oil_wizard' && vehicleDataForWizard) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-okar-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Assistant Vidange Intelligent
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('details')}
              className="text-okar-text-muted"
            >
              Mode manuel
            </Button>
          </div>
          
          <SmartOilWizard
            vehicle={vehicleDataForWizard}
            onValidate={handleOilWizardValidate}
            onCancel={() => setStep('type')}
          />
        </div>
      )
    }

    // Step 3: Details
    if (step === 'details') {
      return (
        <div className="space-y-6">
          {/* Oil change specific */}
          {formData.type === 'oil_change' && (
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-medium">
                  <Droplets className="h-4 w-4" />
                  Détails Vidange
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-okar-text-muted text-xs">Viscosité</Label>
                    <Select value={formData.oilViscosity} onValueChange={(v) => setFormData({ ...formData, oilViscosity: v })}>
                      <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-okar-dark-card border-white/10">
                        {OIL_VISCOSITIES.map((v) => (
                          <SelectItem key={v} value={v} className="text-okar-text-primary">{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-okar-text-muted text-xs">Marque d'huile</Label>
                    <Input
                      placeholder="Total, Shell..."
                      value={formData.oilBrand}
                      onChange={(e) => setFormData({ ...formData, oilBrand: e.target.value })}
                      className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-okar-text-muted text-xs">Quantité (litres)</Label>
                    <Input
                      type="number"
                      placeholder="4.5"
                      value={formData.oilQuantity}
                      onChange={(e) => setFormData({ ...formData, oilQuantity: e.target.value })}
                      className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-okar-dark-800/30 rounded-lg">
                    <Label className="text-okar-text-secondary">Filtre à huile changé</Label>
                    <Switch
                      checked={formData.filterChanged}
                      onCheckedChange={(checked) => setFormData({ ...formData, filterChanged: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Major repair specific */}
          {(formData.type === 'major_repair' || formData.type === 'maintenance') && (
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-orange-400 font-medium">
                  <Settings className="h-4 w-4" />
                  Détails Réparation
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-okar-text-muted text-xs">Organe touché</Label>
                    <Select value={formData.affectedPart} onValueChange={(v) => setFormData({ ...formData, affectedPart: v })}>
                      <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-okar-dark-card border-white/10">
                        {AFFECTED_PARTS.map((part) => (
                          <SelectItem key={part} value={part} className="text-okar-text-primary">{part}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-okar-text-muted text-xs">État des pièces</Label>
                    <Select value={formData.partCondition} onValueChange={(v) => setFormData({ ...formData, partCondition: v as 'new' | 'used' })}>
                      <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-okar-dark-card border-white/10">
                        <SelectItem value="new" className="text-okar-text-primary">Neuf</SelectItem>
                        <SelectItem value="used" className="text-okar-text-primary">Occasion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Parts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-okar-text-muted text-xs">Pièces utilisées</Label>
                    <Button variant="outline" size="sm" onClick={addPart} className="h-7 text-xs border-white/10 text-okar-text-secondary">
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {formData.parts.length > 0 && (
                    <div className="space-y-2">
                      {formData.parts.map((part, index) => (
                        <div key={index} className="flex gap-2 items-center p-2 bg-okar-dark-800/30 rounded-lg">
                          <Input
                            placeholder="Nom de la pièce"
                            value={part.name}
                            onChange={(e) => updatePart(index, 'name', e.target.value)}
                            className="flex-1 h-8 bg-okar-dark-800/50 border-white/10 text-okar-text-primary text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Qté"
                            value={part.quantity}
                            onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value))}
                            className="w-16 h-8 bg-okar-dark-800/50 border-white/10 text-okar-text-primary text-sm"
                          />
                          <Button variant="ghost" size="sm" onClick={() => removePart(index)} className="h-8 text-rose-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-okar-text-muted text-xs">Description / Notes</Label>
            <Textarea
              placeholder="Décrivez l'intervention effectuée..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary min-h-24"
            />
          </div>

          {/* Cost */}
          <div className="space-y-2">
            <Label className="text-okar-text-muted text-xs">Coût total (FCFA) *</Label>
            <Input
              type="number"
              placeholder="45000"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('type')} className="flex-1 border-white/10 text-okar-text-secondary">
              Retour
            </Button>
            <Button
              onClick={() => setStep('signature')}
              disabled={!formData.cost}
              className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700"
            >
              Continuer
            </Button>
          </div>
        </div>
      )
    }

    // Step 4: Signature
    if (step === 'signature') {
      return (
        <div className="space-y-6">
          {/* Récapitulatif */}
          <Card className="bg-okar-dark-800/30 border-white/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-okar-text-muted">Type:</span>
                <span className="text-okar-text-primary font-medium">{selectedType?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-okar-text-muted">Kilométrage:</span>
                <span className="text-okar-text-primary">{parseInt(formData.mileage).toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-okar-text-muted">Coût:</span>
                <span className="text-okar-text-primary font-bold">{parseInt(formData.cost).toLocaleString()} FCFA</span>
              </div>
            </CardContent>
          </Card>

          {/* Signature */}
          <div className="space-y-3">
            <Label className="text-okar-text-muted text-xs flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Signature du mécanicien
            </Label>
            <div className="relative border border-white/10 rounded-xl overflow-hidden bg-okar-dark-800/30">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full touch-none cursor-crosshair"
              />
              {!signature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-okar-text-muted text-sm">Signez ici</span>
                </div>
              )}
            </div>
            {signature && (
              <Button variant="ghost" size="sm" onClick={clearSignature} className="text-okar-text-muted">
                <Trash2 className="h-3 w-3 mr-1" />
                Effacer la signature
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(formData.type === 'oil_change' && oilWizardData ? 'oil_wizard' : 'details')} className="flex-1 border-white/10 text-okar-text-secondary">
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!signature || submitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enregistrer l'intervention
                </>
              )}
            </Button>
          </div>
        </div>
      )
    }

    // Step 5: Complete
    if (step === 'complete') {
      return (
        <div className="space-y-6 text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-okar-text-primary">Intervention enregistrée !</h3>
            <p className="text-okar-text-muted mt-2">
              L'intervention a été ajoutée au carnet d'entretien du véhicule.
            </p>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-pink-600 to-pink-700"
          >
            Fermer
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-okar-dark-card border-white/10 text-okar-text-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-pink-400" />
            Nouvelle Intervention
          </DialogTitle>
          <DialogDescription className="text-okar-text-muted">
            {vehicle ? (
              <span>
                Véhicule: <span className="text-okar-text-primary font-medium">{vehicle.plateNumber}</span> - {vehicle.brand} {vehicle.model}
              </span>
            ) : (
              'Remplissez les informations de l\'intervention'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 px-2">
          {['type', 'details', 'oil_wizard', 'signature', 'complete'].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ['type', 'details', 'signature', 'complete'].includes(s) && 
                ['type', 'details', 'signature', 'complete'].indexOf(s) <= ['type', 'details', 'signature', 'complete'].indexOf(step)
                  ? 'bg-pink-500'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="py-4">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InterventionFormModal
