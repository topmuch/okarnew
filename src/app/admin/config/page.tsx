'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Save,
  Target,
  QrCode,
  Mail,
  MessageSquare,
  HardDrive,
  Globe,
  Flag,
  Check,
} from 'lucide-react'

interface ConfigSection {
  key: string
  label: string
  icon: React.ReactNode
  configs: ConfigItem[]
}

interface ConfigItem {
  key: string
  label: string
  type: 'number' | 'text' | 'toggle' | 'json'
  value: string | number | boolean
  description?: string
}

interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
}

const demoConfigSections: ConfigSection[] = [
  {
    key: 'scoring',
    label: 'Scoring',
    icon: <Target className="h-5 w-5" />,
    configs: [
      { key: 'score_weights_punctuality', label: 'Poids ponctualité (%)', type: 'number', value: 25, description: 'Impact de la ponctualité sur le score global' },
      { key: 'score_weights_completion', label: 'Poids complétion (%)', type: 'number', value: 30, description: 'Impact du taux de complétion des checklists' },
      { key: 'score_weights_rating', label: 'Poids note client (%)', type: 'number', value: 25, description: 'Impact de la satisfaction client' },
      { key: 'score_weights_regularity', label: 'Poids régularité (%)', type: 'number', value: 10, description: 'Impact de la régularité des interventions' },
      { key: 'score_weights_reactivity', label: 'Poids réactivité (%)', type: 'number', value: 10, description: 'Impact du temps de réponse' },
      { key: 'score_min_interventions', label: 'Nombre min. interventions pour scoring', type: 'number', value: 5 },
    ],
  },
  {
    key: 'qrcode',
    label: 'QR Code',
    icon: <QrCode className="h-5 w-5" />,
    configs: [
      { key: 'qr_expiry_hours', label: 'Durée de validité QR (heures)', type: 'number', value: 24, description: 'Durée avant expiration du code QR' },
      { key: 'qr_pin_length', label: 'Longueur du code PIN', type: 'number', value: 6 },
      { key: 'qr_auto_complete', label: 'Auto-complétion après scan', type: 'toggle', value: true },
      { key: 'qr_require_photo', label: 'Photo obligatoire', type: 'toggle', value: false },
    ],
  },
  {
    key: 'email',
    label: 'Email',
    icon: <Mail className="h-5 w-5" />,
    configs: [
      { key: 'email_from_address', label: 'Adresse d&apos;expédition', type: 'text', value: 'noreply@cleancheck.fr' },
      { key: 'email_from_name', label: 'Nom d&apos;expédition', type: 'text', value: 'CleanCheck' },
      { key: 'email_rating_reminder', label: 'Rappel de notation activé', type: 'toggle', value: true },
      { key: 'email_rating_reminder_hours', label: 'Délai rappel notation (heures)', type: 'number', value: 48 },
      { key: 'email_templates_json', label: 'Templates (JSON)', type: 'json', value: JSON.stringify({ welcome: { subject: 'Bienvenue sur CleanCheck' }, reminder: { subject: 'N\'oubliez pas de noter' } }, null, 2) },
    ],
  },
  {
    key: 'sms',
    label: 'SMS',
    icon: <MessageSquare className="h-5 w-5" />,
    configs: [
      { key: 'sms_enabled', label: 'SMS activé', type: 'toggle', value: false },
      { key: 'sms_provider', label: 'Fournisseur SMS', type: 'text', value: 'twilio' },
      { key: 'sms_from_number', label: 'Numéro d\'expédition', type: 'text', value: '+33612345678' },
    ],
  },
  {
    key: 'storage',
    label: 'Stockage',
    icon: <HardDrive className="h-5 w-5" />,
    configs: [
      { key: 'storage_provider', label: 'Fournisseur', type: 'text', value: 'local' },
      { key: 'storage_max_file_size_mb', label: 'Taille max fichier (Mo)', type: 'number', value: 10 },
      { key: 'storage_allowed_types', label: 'Types autorisés', type: 'json', value: JSON.stringify(['image/jpeg', 'image/png', 'image/webp']) },
      { key: 'storage_auto_compress', label: 'Auto-compression images', type: 'toggle', value: true },
    ],
  },
  {
    key: 'general',
    label: 'Général',
    icon: <Globe className="h-5 w-5" />,
    configs: [
      { key: 'app_name', label: 'Nom de l\'application', type: 'text', value: 'CleanCheck' },
      { key: 'app_url', label: 'URL de l\'application', type: 'text', value: 'https://cleancheck.fr' },
      { key: 'default_language', label: 'Langue par défaut', type: 'text', value: 'fr' },
      { key: 'timezone', label: 'Fuseau horaire', type: 'text', value: 'Europe/Paris' },
      { key: 'maintenance_mode', label: 'Mode maintenance', type: 'toggle', value: false },
    ],
  },
]

const demoFeatureFlags: FeatureFlag[] = [
  { key: 'qr_v2', name: 'QR Code V2', description: 'Nouveau format de QR code avec signature cryptographique', enabled: true },
  { key: 'ai_scoring', name: 'IA Scoring', description: 'Utilisation de l\'IA pour l\'analyse des scores qualité', enabled: false },
  { key: 'multi_company', name: 'Multi-sociétés', description: 'Permettre à un agent d\'appartenir à plusieurs sociétés', enabled: true },
  { key: 'client_portal', name: 'Portail Client', description: 'Accès client pour suivre les interventions en temps réel', enabled: true },
  { key: 'bulk_import', name: 'Import en masse', description: 'Importation CSV des clients et interventions', enabled: false },
  { key: 'api_v2', name: 'API V2', description: 'Nouvelle version de l\'API avec endpoints RESTful', enabled: true },
  { key: 'dark_mode', name: 'Mode sombre', description: 'Thème sombre pour le dashboard', enabled: false },
  { key: 'realtime_notifications', name: 'Notifications temps réel', description: 'Notifications push et WebSocket en temps réel', enabled: true },
]

export default function ConfigPage() {
  const [configSections, setConfigSections] = useState<ConfigSection[]>([])
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configRes, flagsRes] = await Promise.allSettled([
          fetch('/api/admin/config'),
          fetch('/api/admin/feature-flags'),
        ])

        if (configRes.status === 'fulfilled' && configRes.value.ok) {
          setConfigSections(await configRes.value.json())
        } else {
          setConfigSections(demoConfigSections)
        }

        if (flagsRes.status === 'fulfilled' && flagsRes.value.ok) {
          setFeatureFlags(await flagsRes.value.json())
        } else {
          setFeatureFlags(demoFeatureFlags)
        }
      } catch {
        setConfigSections(demoConfigSections)
        setFeatureFlags(demoFeatureFlags)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  function updateConfig(sectionKey: string, configKey: string, value: string | number | boolean) {
    setConfigSections((prev) =>
      prev.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              configs: section.configs.map((c) => (c.key === configKey ? { ...c, value } : c)),
            }
          : section
      )
    )
  }

  async function saveSection(sectionKey: string) {
    setSaving(sectionKey)
    try {
      await new Promise((r) => setTimeout(r, 800))
      setSavedSections((prev) => new Set(prev).add(sectionKey))
      setTimeout(() => {
        setSavedSections((prev) => {
          const next = new Set(prev)
          next.delete(sectionKey)
          return next
        })
      }, 2000)
    } finally {
      setSaving(null)
    }
  }

  function toggleFlag(key: string) {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration Système</h1>
        <p className="text-gray-500 text-sm mt-1">Gérer les paramètres de la plateforme</p>
      </div>

      <Tabs defaultValue="scoring" className="space-y-4">
        <TabsList className="bg-gray-100 flex-wrap h-auto gap-1">
          {configSections.map((section) => (
            <TabsTrigger
              key={section.key}
              value={section.key}
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs"
            >
              {section.icon}
              <span className="ml-1.5 hidden sm:inline">{section.label}</span>
            </TabsTrigger>
          ))}
          <TabsTrigger value="flags" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs">
            <Flag className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Feature Flags</span>
          </TabsTrigger>
        </TabsList>

        {configSections.map((section) => (
          <TabsContent key={section.key} value={section.key}>
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {section.icon}
                    {section.label}
                  </CardTitle>
                  <Button
                    className={`text-sm font-semibold shadow-sm ${
                      savedSections.has(section.key)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                    onClick={() => saveSection(section.key)}
                    disabled={saving === section.key}
                  >
                    {saving === section.key ? (
                      <>Sauvegarde...</>
                    ) : savedSections.has(section.key) ? (
                      <><Check className="h-4 w-4 mr-1" /> Sauvé</>
                    ) : (
                      <><Save className="h-4 w-4 mr-1" /> Sauvegarder</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.configs.map((config, index) => (
                  <div key={config.key}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-1">
                        <Label className="text-sm font-medium text-gray-700">{config.label}</Label>
                        {config.description && (
                          <p className="text-xs text-gray-500">{config.description}</p>
                        )}
                      </div>
                      <div className="w-full sm:w-64 shrink-0">
                        {config.type === 'number' && (
                          <Input
                            type="number"
                            value={String(config.value)}
                            onChange={(e) => updateConfig(section.key, config.key, Number(e.target.value))}
                            className="text-right"
                          />
                        )}
                        {config.type === 'text' && (
                          <Input
                            value={String(config.value)}
                            onChange={(e) => updateConfig(section.key, config.key, e.target.value)}
                          />
                        )}
                        {config.type === 'toggle' && (
                          <div className="flex items-center justify-end">
                            <Switch
                              checked={Boolean(config.value)}
                              onCheckedChange={(checked) => updateConfig(section.key, config.key, checked)}
                            />
                          </div>
                        )}
                        {config.type === 'json' && (
                          <Textarea
                            value={String(config.value)}
                            onChange={(e) => updateConfig(section.key, config.key, e.target.value)}
                            className="font-mono text-xs min-h-[100px]"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="flags">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Flag className="h-5 w-5 text-violet-500" />
                Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featureFlags.map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{flag.name}</p>
                      <Badge variant="secondary" className="font-mono text-xs bg-gray-100 text-gray-500">
                        {flag.key}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{flag.description}</p>
                  </div>
                  <div className="shrink-0 ml-4">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => toggleFlag(flag.key)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
