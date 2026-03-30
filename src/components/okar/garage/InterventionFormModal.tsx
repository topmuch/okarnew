/**
 * OKAR - Formulaire d'Intervention Structuré
 * 
 * Types: Entretien Courant, Grosse Mécanique, Carrosserie/Accident
 * Champs dynamiques selon le type
 * Signature numérique
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Sparkles,
  AlertTriangle,
  Shield,
  Zap,
  Trash2,
  Plus,
} from 'lucide-react'

interface InterventionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: {
    id: string
    plateNumber: string
    brand: string
    model: string
    mileage: number
  }
}

type InterventionType = 'oil_change' | 'maintenance' | 'major_repair' | 'accident' | 'inspection'

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
    description: 'Changement d\'huile et filtre'
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

export function InterventionFormModal({ open, onOpenChange, vehicle }: InterventionFormModalProps) {
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      // Utiliser requestAnimationFrame pour éviter le warning ESLint
      requestAnimationFrame(() => {
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
      })
    }
  }, [open, vehicle])

  // Signature canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
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
  }, [isDrawing])

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

  const handleSubmit = async () => {
    setSubmitting(true)
    
    // TODO: Envoyer à l'API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Intervention:', { ...formData, signature })
    
    setSubmitting(false)
    onOpenChange(false)
  }

  const selectedType = INTERVENTION_TYPES.find(t => t.value === formData.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-okar-dark-card border-white/10 text-okar-text-primary">
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

        <div className="space-y-6 py-4">
          {/* Sélecteur de type */}
          <div className="space-y-3">
            <Label className="text-okar-text-secondary font-medium">Type d'intervention</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTERVENTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as InterventionType })}
                  className={`p-4 rounded-xl border transition-all ${
                    formData.type === type.value
                      ? 'border-pink-500/50 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                      : 'border-white/10 bg-okar-dark-800/30 hover:bg-okar-dark-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 ${type.bg} rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <p className="font-medium text-okar-text-primary text-sm">{type.label}</p>
                  <p className="text-xs text-okar-text-muted mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Champs communs */}
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
              <Label className="text-okar-text-muted text-xs">Coût total (FCFA) *</Label>
              <Input
                type="number"
                placeholder="45000"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>
          </div>

          {/* Champs spécifiques: Vidange */}
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

          {/* Champs spécifiques: Grosse Méca */}
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

                {/* Pièces utilisées */}
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

          {/* Champs spécifiques: Accident */}
          {formData.type === 'accident' && (
            <Card className="bg-rose-500/5 border-rose-500/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Détails Accident
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  <p className="text-rose-300 text-sm">
                    ⚠️ Les photos sont obligatoires pour les interventions liées à un accident.
                  </p>
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

          {/* Photos */}
          <div className="space-y-2">
            <Label className="text-okar-text-muted text-xs">Photos (optionnel)</Label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-okar-text-muted hover:border-pink-500/30 transition-colors cursor-pointer"
                >
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-xs">{i === 1 ? 'Photo' : `Photo ${i}`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Facture */}
          <div className="space-y-2">
            <Label className="text-okar-text-muted text-xs">Facture / Justificatif</Label>
            <Button variant="outline" className="w-full h-12 border-dashed border-white/10 text-okar-text-muted hover:text-okar-text-primary">
              <Upload className="h-4 w-4 mr-2" />
              Télécharger une facture
            </Button>
          </div>

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
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 text-okar-text-secondary">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.type || !formData.mileage || !formData.cost || !signature || submitting}
            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
