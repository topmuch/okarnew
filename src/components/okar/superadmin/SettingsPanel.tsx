/**
 * OKAR - Settings Panel Component
 * 
 * Design "Dark Luxury" avec effets glassmorphism
 * Formulaire de paramétrage de l'application
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Globe,
  Mail,
  Server,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface SettingsData {
  site_name: string
  site_address: string
  site_logo_url: string
  email_host: string
  email_port: string
  email_user: string
  email_password: string
}

interface SettingsPanelProps {
  onSave?: () => void
}

export function SettingsPanel({ onSave }: SettingsPanelProps) {
  const [settings, setSettings] = useState<SettingsData>({
    site_name: '',
    site_address: '',
    site_logo_url: '',
    email_host: '',
    email_port: '',
    email_user: '',
    email_password: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Charger les paramètres
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/superadmin/settings', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Sauvegarder les paramètres
  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/superadmin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        setSaveStatus('success')
        onSave?.()
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  // Mettre à jour un champ
  const updateField = (key: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaveStatus('idle')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-okar-pink-500/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-okar-pink-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="text-okar-text-muted">Chargement des paramètres...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <Card className="bg-okar-dark-card/50 backdrop-blur-md border-white/5 shadow-luxury rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/20">
              <Globe className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <CardTitle className="text-okar-text-primary text-lg">Informations Générales</CardTitle>
              <CardDescription className="text-okar-text-muted">
                Configuration de base du site
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm">Nom du site</Label>
              <Input
                value={settings.site_name}
                onChange={(e) => updateField('site_name', e.target.value)}
                placeholder="OKAR"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm">Adresse</Label>
              <Input
                value={settings.site_address}
                onChange={(e) => updateField('site_address', e.target.value)}
                placeholder="Dakar, Sénégal"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-okar-text-secondary text-sm">URL du logo (SEO)</Label>
            <Input
              value={settings.site_logo_url}
              onChange={(e) => updateField('site_logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50"
            />
            <p className="text-okar-text-muted text-xs">
              URL publique du logo pour les métadonnées SEO et partage social
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Email SMTP */}
      <Card className="bg-okar-dark-card/50 backdrop-blur-md border-white/5 shadow-luxury rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/20">
              <Mail className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <CardTitle className="text-okar-text-primary text-lg">Configuration Email SMTP</CardTitle>
              <CardDescription className="text-okar-text-muted">
                Paramètres du serveur d'envoi d'emails
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm flex items-center gap-2">
                <Server className="h-3.5 w-3.5" />
                Serveur SMTP
              </Label>
              <Input
                value={settings.email_host}
                onChange={(e) => updateField('email_host', e.target.value)}
                placeholder="smtp.example.com"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm">Port</Label>
              <Input
                value={settings.email_port}
                onChange={(e) => updateField('email_port', e.target.value)}
                placeholder="587"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm">Utilisateur</Label>
              <Input
                value={settings.email_user}
                onChange={(e) => updateField('email_user', e.target.value)}
                placeholder="user@example.com"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-okar-text-secondary text-sm flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Mot de passe
              </Label>
              <Input
                type="password"
                value={settings.email_password}
                onChange={(e) => updateField('email_password', e.target.value)}
                placeholder="••••••••"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-okar-pink-500/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex items-center justify-between p-4 bg-okar-dark-card/30 backdrop-blur-md rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Paramètres sauvegardés avec succès</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Erreur lors de la sauvegarde</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-okar-pink-600 to-okar-pink-700 hover:from-okar-pink-700 hover:to-okar-pink-800 text-white shadow-lg shadow-okar-pink-600/20 rounded-xl px-8"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default SettingsPanel
