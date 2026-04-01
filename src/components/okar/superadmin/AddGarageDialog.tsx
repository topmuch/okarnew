/**
 * OKAR - AddGarageDialog Component
 * 
 * Design "Dark Luxury" avec effets glassmorphism
 * Dialogue pour ajouter un nouveau garage avec génération automatique
 * des identifiants de connexion (email temporaire et mot de passe)
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Key,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

interface AddGarageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (garageData: GarageFormData) => Promise<void>
}

export interface GarageFormData {
  businessName: string
  ownerName: string
  email: string
  phone: string
  city: string
  address: string
  generatedPassword: string
}

// Liste des villes du Sénégal
const SENEGAL_CITIES = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor',
  'Rufisque', 'Touba', 'Mbour', 'Diourbel', 'Tambacounda',
  'Kolda', 'Louga', 'Fatick', 'Sédhiou', 'Kaffrine',
  'Matam', 'Kédougou', 'Podor', 'Richard-Toll', 'Dagana'
]

// Fonction pour générer un mot de passe sécurisé
function generateSecurePassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, x => chars[x % chars.length]).join('')
}

// Fonction pour générer un email temporaire
function generateTempEmail(businessName: string): string {
  const cleanName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15)
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `${cleanName}_${randomSuffix}@garage.okar.sn`
}

export function AddGarageDialog({ open, onOpenChange, onAdd }: AddGarageDialogProps) {
  const [formData, setFormData] = useState<GarageFormData>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    generatedPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)

  // Générer les identifiants
  const generateCredentials = () => {
    const email = formData.businessName 
      ? generateTempEmail(formData.businessName)
      : ''
    const password = generateSecurePassword()
    setFormData(prev => ({
      ...prev,
      email,
      generatedPassword: password,
    }))
    setShowCredentials(true)
  }

  // Régénérer le mot de passe
  const regeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setFormData(prev => ({
      ...prev,
      generatedPassword: newPassword,
    }))
  }

  // Copier dans le presse-papier
  const copyToClipboard = async (text: string, type: 'password' | 'email') => {
    await navigator.clipboard.writeText(text)
    if (type === 'password') {
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 2000)
    } else {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    }
  }

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!formData.businessName || !formData.ownerName || !formData.generatedPassword) {
      return
    }
    setIsLoading(true)
    try {
      await onAdd(formData)
      // Reset le formulaire
      setFormData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        generatedPassword: '',
      })
      setShowCredentials(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg text-okar-text-primary max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-okar-text-primary flex items-center gap-3 text-xl font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-okar-pink-500 to-okar-pink-700 flex items-center justify-center shadow-okar-pink">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            Ajouter un Garage
          </DialogTitle>
          <DialogDescription className="text-okar-text-muted pt-2">
            Créez un nouveau garage partenaire. Les identifiants de connexion seront générés automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations du garage */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-okar-text-primary flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-okar-pink-500/10 flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-okar-pink-400" />
              </div>
              Informations du Garage
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-okar-text-secondary text-sm font-medium">Nom commercial *</Label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Ex: Garage Auto Plus"
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50 focus:ring-okar-pink-500/20 h-11 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-secondary text-sm font-medium">Ville *</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                >
                  <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary h-11 rounded-xl focus:ring-okar-pink-500/20">
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent className="bg-okar-dark-card/95 backdrop-blur-xl border-white/10 shadow-luxury-lg">
                    {SENEGAL_CITIES.map((city) => (
                      <SelectItem key={city} value={city} className="text-okar-text-primary hover:bg-white/5 focus:bg-white/5">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm font-medium">Adresse complète</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ex: Quartier Médina, Rue 10 x 11"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50 focus:ring-okar-pink-500/20 h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Informations du propriétaire */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-okar-text-primary flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-blue-400" />
              </div>
              Informations du Propriétaire
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-okar-text-secondary text-sm font-medium">Nom complet *</Label>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="Ex: Mamadou Diop"
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50 focus:ring-okar-pink-500/20 h-11 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-secondary text-sm font-medium">Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: 77 123 45 67"
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50 focus:ring-okar-pink-500/20 h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Bouton générer les identifiants */}
          {!showCredentials && (
            <Button
              onClick={generateCredentials}
              disabled={!formData.businessName || !formData.ownerName}
              className="w-full bg-gradient-to-r from-okar-pink-600 to-okar-pink-700 hover:from-okar-pink-700 hover:to-okar-pink-800 text-white shadow-lg shadow-okar-pink-500/20 h-12 rounded-xl font-semibold"
            >
              <Key className="h-4 w-4 mr-2" />
              Générer les identifiants de connexion
            </Button>
          )}

          {/* Identifiants générés */}
          {showCredentials && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-okar-text-primary flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                Identifiants de Connexion Générés
              </h3>
              
              <Card className="bg-okar-dark-800/30 border-white/5 p-5 rounded-2xl">
                <div className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-okar-text-muted text-xs font-medium">Email de connexion</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-okar-dark-800/50 rounded-xl px-4 py-3 font-mono text-emerald-400 text-sm border border-emerald-500/20">
                        {formData.email}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(formData.email, 'email')}
                        className="border-white/10 text-okar-text-muted hover:text-white hover:bg-white/5 h-10 w-10 rounded-xl"
                      >
                        {emailCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-2">
                    <Label className="text-okar-text-muted text-xs font-medium">Mot de passe temporaire</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-okar-dark-800/50 rounded-xl px-4 py-3 font-mono text-amber-400 text-sm border border-amber-500/20">
                        {formData.generatedPassword}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={regeneratePassword}
                        className="border-white/10 text-okar-text-muted hover:text-white hover:bg-white/5 h-10 w-10 rounded-xl"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(formData.generatedPassword, 'password')}
                        className="border-white/10 text-okar-text-muted hover:text-white hover:bg-white/5 h-10 w-10 rounded-xl"
                      >
                        {passwordCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-amber-400 mt-0.5" />
                      <p className="text-amber-300/80 text-sm leading-relaxed">
                        <span className="font-medium text-amber-300">Important :</span> Ces identifiants doivent être transmis au garage de manière sécurisée. 
                        Le mot de passe devra être changé lors de la première connexion.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-4 border-t border-white/5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 text-okar-text-secondary hover:text-white hover:bg-white/5 h-11 px-6 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !showCredentials || !formData.city}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-600/20 h-11 px-6 rounded-xl font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4 mr-2" />
                Créer le Garage
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddGarageDialog
