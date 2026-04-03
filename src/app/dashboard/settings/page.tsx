'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, Building2, Bell, Shield, Palette } from 'lucide-react'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Configurez votre espace CleanCheck</p>
      </div>

      {/* Company Info */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Informations entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom de l&apos;entreprise</Label>
              <Input defaultValue="CleanPro Services" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="contact@cleanpro.fr" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input defaultValue="+33 1 00 00 00 00" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input defaultValue="Paris" className="rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Intervention en retard', description: 'Notifier quand une intervention dépasse l\'heure prévue', defaultChecked: true },
            { label: 'Nouveau score client', description: 'Notifier quand un client laisse un avis', defaultChecked: true },
            { label: 'Rapport quotidien', description: 'Recevoir un résumé quotidien par email', defaultChecked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mot de passe actuel</Label>
            <Input type="password" placeholder="••••••••" className="rounded-xl" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <Input type="password" placeholder="••••••••" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Confirmer le mot de passe</Label>
              <Input type="password" placeholder="••••••••" className="rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm min-w-32"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enregistrement...</>
          ) : saved ? (
            <><Save className="h-4 w-4 mr-2" />Enregistré !</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />Enregistrer</>
          )}
        </Button>
      </div>
    </div>
  )
}
