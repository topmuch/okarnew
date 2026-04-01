/**
 * OKAR - AddUserDialog Component
 * 
 * Dialogue pour créer un nouvel utilisateur (conducteur, garage ou superadmin)
 * 
 * FIXES:
 * - Ajout option pour créer son propre mot de passe
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
  User,
  Mail,
  Phone,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Key,
  Shield,
  Car,
  Wrench,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (userData: UserFormData) => Promise<void>
}

export interface UserFormData {
  name: string
  email: string
  phone: string
  role: 'driver' | 'garage_certified' | 'garage_pending' | 'superadmin'
  generatedPassword: string
}

// Rôles disponibles
const USER_ROLES = [
  { value: 'driver', label: 'Conducteur', icon: Car, color: 'text-blue-400' },
  { value: 'garage_certified', label: 'Garage Certifié', icon: Wrench, color: 'text-emerald-400' },
  { value: 'garage_pending', label: 'Garage (En attente)', icon: Wrench, color: 'text-amber-400' },
  { value: 'superadmin', label: 'SuperAdmin', icon: Shield, color: 'text-rose-400' },
]

// Fonction pour générer un mot de passe sécurisé
function generateSecurePassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, x => chars[x % chars.length]).join('')
}

export function AddUserDialog({ open, onOpenChange, onAdd }: AddUserDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'driver',
    generatedPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [passwordMode, setPasswordMode] = useState<'generate' | 'custom'>('generate')
  const [showPassword, setShowPassword] = useState(false)

  // Générer le mot de passe
  const generatePassword = () => {
    const password = generateSecurePassword()
    setFormData(prev => ({
      ...prev,
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
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setPasswordCopied(true)
    setTimeout(() => setPasswordCopied(false), 2000)
  }

  // Valider le mot de passe personnalisé
  const validatePassword = (password: string) => {
    if (password.length < 8) return { valid: false, message: 'Minimum 8 caractères' }
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Au moins une majuscule' }
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Au moins une minuscule' }
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Au moins un chiffre' }
    return { valid: true, message: 'Mot de passe fort' }
  }

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!formData.email || !formData.generatedPassword) {
      return
    }
    // Valider le mot de passe si personnalisé
    if (passwordMode === 'custom') {
      const validation = validatePassword(formData.generatedPassword)
      if (!validation.valid) {
        return
      }
    }
    setIsLoading(true)
    try {
      await onAdd(formData)
      // Reset le formulaire
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'driver',
        generatedPassword: '',
      })
      setShowCredentials(false)
      setPasswordMode('generate')
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRole = USER_ROLES.find(r => r.value === formData.role)
  const passwordValidation = formData.generatedPassword ? validatePassword(formData.generatedPassword) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E293B]/95 backdrop-blur-xl border-[#334155] shadow-2xl text-white max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3 text-xl font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
              <User className="h-5 w-5 text-white" />
            </div>
            Créer un Utilisateur
          </DialogTitle>
          <DialogDescription className="text-[#94A3B8] pt-2">
            Créez un nouveau compte utilisateur avec mot de passe généré ou personnalisé.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations utilisateur */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#CBD5E1] text-sm font-medium">Nom complet</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Amadou Diouf"
                className="bg-[#0F172A]/50 border-[#334155] text-white placeholder:text-[#64748B] focus:border-[#8B5CF6]/50 focus:ring-[#8B5CF6]/20 h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#CBD5E1] text-sm font-medium">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  className="pl-10 bg-[#0F172A]/50 border-[#334155] text-white placeholder:text-[#64748B] focus:border-[#8B5CF6]/50 focus:ring-[#8B5CF6]/20 h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#CBD5E1] text-sm font-medium">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="77 123 45 67"
                  className="pl-10 bg-[#0F172A]/50 border-[#334155] text-white placeholder:text-[#64748B] focus:border-[#8B5CF6]/50 focus:ring-[#8B5CF6]/20 h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#CBD5E1] text-sm font-medium">Rôle *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
              >
                <SelectTrigger className="bg-[#0F172A]/50 border-[#334155] text-white h-11 rounded-xl focus:ring-[#8B5CF6]/20">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B]/95 backdrop-blur-xl border-[#334155] shadow-xl">
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="text-white hover:bg-white/5 focus:bg-white/5">
                      <div className="flex items-center gap-2">
                        <role.icon className={`h-4 w-4 ${role.color}`} />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole && (
                <Badge className={`mt-2 ${selectedRole.color} bg-current/10 border-current/20`}>
                  <selectedRole.icon className="h-3 w-3 mr-1" />
                  {selectedRole.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Mode de mot de passe */}
          <div className="space-y-3">
            <Label className="text-[#CBD5E1] text-sm font-medium">Mode de mot de passe</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setPasswordMode('generate')
                  setFormData(prev => ({ ...prev, generatedPassword: '' }))
                  setShowCredentials(false)
                }}
                className={cn(
                  'p-3 rounded-xl border text-sm font-medium transition-all',
                  passwordMode === 'generate'
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#A78BFA]'
                    : 'bg-[#0F172A]/50 border-[#334155] text-[#94A3B8] hover:border-[#475569]'
                )}
              >
                <Sparkles className="h-4 w-4 mx-auto mb-2" />
                Générer automatiquement
              </button>
              <button
                onClick={() => {
                  setPasswordMode('custom')
                  setFormData(prev => ({ ...prev, generatedPassword: '' }))
                  setShowCredentials(true)
                }}
                className={cn(
                  'p-3 rounded-xl border text-sm font-medium transition-all',
                  passwordMode === 'custom'
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#A78BFA]'
                    : 'bg-[#0F172A]/50 border-[#334155] text-[#94A3B8] hover:border-[#475569]'
                )}
              >
                <Key className="h-4 w-4 mx-auto mb-2" />
                Créer mon mot de passe
              </button>
            </div>
          </div>

          {/* Bouton générer le mot de passe */}
          {passwordMode === 'generate' && !showCredentials && (
            <Button
              onClick={generatePassword}
              disabled={!formData.email}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white shadow-lg shadow-[#8B5CF6]/20 h-12 rounded-xl font-semibold"
            >
              <Key className="h-4 w-4 mr-2" />
              Générer le mot de passe
            </Button>
          )}

          {/* Mot de passe */}
          {showCredentials && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                {passwordMode === 'generate' ? 'Mot de Passe Généré' : 'Mot de Passe Personnalisé'}
              </h3>
              
              <Card className="bg-[#0F172A]/30 border-[#334155]/50 p-4 rounded-2xl">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8] text-xs font-medium">
                    {passwordMode === 'generate' ? 'Mot de passe temporaire' : 'Définir un mot de passe'}
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.generatedPassword}
                        onChange={(e) => passwordMode === 'custom' && setFormData(prev => ({ ...prev, generatedPassword: e.target.value }))}
                        readOnly={passwordMode === 'generate'}
                        placeholder={passwordMode === 'custom' ? 'Entrez votre mot de passe' : ''}
                        className="font-mono text-amber-400 text-sm border-amber-500/20 bg-[#0F172A]/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordMode === 'generate' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={regeneratePassword}
                        className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5 h-10 w-10 rounded-xl"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(formData.generatedPassword)}
                      className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5 h-10 w-10 rounded-xl"
                    >
                      {passwordCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Indicateur de force du mot de passe */}
                  {passwordMode === 'custom' && formData.generatedPassword && passwordValidation && (
                    <div className={cn(
                      'flex items-center gap-2 text-xs mt-2',
                      passwordValidation.valid ? 'text-emerald-400' : 'text-amber-400'
                    )}>
                      {passwordValidation.valid ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span>⚠️</span>
                      )}
                      {passwordValidation.message}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-4 border-t border-[#334155]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#334155] text-[#94A3B8] hover:text-white hover:bg-white/5 h-11 px-6 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !showCredentials || !formData.email || (passwordMode === 'custom' && !passwordValidation?.valid)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-600/20 h-11 px-6 rounded-xl font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Créer l'Utilisateur
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddUserDialog
