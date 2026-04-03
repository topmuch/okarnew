'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Download,
  QrCode,
  AlertCircle,
} from 'lucide-react'

const demoClients = [
  { id: '1', name: 'Bureau Martin & Associés' },
  { id: '2', name: 'Hôtel Riviera' },
  { id: '3', name: 'Clinique Santé+' },
  { id: '4', name: 'Restaurant Le Jardin' },
  { id: '5', name: 'Immeuble Tour Eiffel' },
]

const demoAgents = [
  { id: '1', name: 'Sophie Laurent' },
  { id: '2', name: 'Marc Dupont' },
  { id: '3', name: 'Julie Renard' },
]

const demoTemplates = [
  { id: '1', name: 'Nettoyage Bureau Standard', items: 12 },
  { id: '2', name: 'Nettoyage Hôtel Chambre', items: 18 },
  { id: '3', name: 'Nettoyage Profond', items: 24 },
  { id: '4', name: 'Nettoyage Fin de Chantier', items: 30 },
]

export default function NewInterventionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    clientId: '',
    agentId: '',
    templateId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [createdId, setCreatedId] = useState('')

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.clientId || !form.agentId || !form.templateId || !form.startDate) {
      setError('Veuillez remplir les champs obligatoires.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId,
          agentId: form.agentId,
          templateId: form.templateId,
          scheduledStart: `${form.startDate}T${form.startTime || '08:00'}`,
          scheduledEnd: form.endDate ? `${form.endDate}T${form.endTime || '10:00'}` : null,
          notes: form.notes,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCreatedId(data.id || 'INT-' + Math.random().toString(36).substring(2, 6).toUpperCase())
        setShowQRModal(true)
      } else {
        const data = await res.json()
        setError(data.error || "Une erreur est survenue.")
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/interventions">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle intervention</h1>
          <p className="text-gray-500 text-sm mt-0.5">Créez une intervention et générez un QR Code</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={form.clientId} onValueChange={(v) => updateForm('clientId', v)}>
                <SelectTrigger id="client" className="rounded-xl">
                  <SelectValue placeholder="Sélectionnez un client" />
                </SelectTrigger>
                <SelectContent>
                  {demoClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent */}
            <div className="space-y-2">
              <Label htmlFor="agent">Agent *</Label>
              <Select value={form.agentId} onValueChange={(v) => updateForm('agentId', v)}>
                <SelectTrigger id="agent" className="rounded-xl">
                  <SelectValue placeholder="Sélectionnez un agent" />
                </SelectTrigger>
                <SelectContent>
                  {demoAgents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template */}
            <div className="space-y-2">
              <Label htmlFor="template">Template de checklist *</Label>
              <Select value={form.templateId} onValueChange={(v) => updateForm('templateId', v)}>
                <SelectTrigger id="template" className="rounded-xl">
                  <SelectValue placeholder="Sélectionnez un template" />
                </SelectTrigger>
                <SelectContent>
                  {demoTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.items} tâches)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de début</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateForm('startTime', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateForm('endTime', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Instructions particulières, accès, consignes..."
                value={form.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
                className="min-h-24 rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer l\'intervention'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                Intervention créée !
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              QR Code généré pour l&apos;intervention <strong className="text-gray-900">{createdId}</strong>
            </p>
            <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-emerald-200 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-16 w-16 text-emerald-500 mx-auto" />
                <p className="text-xs text-gray-400 mt-2">QR Code</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Imprimez ce QR Code ou partagez-le avec l&apos;agent assigné.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Télécharger QR
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowQRModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
