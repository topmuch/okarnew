'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Shield,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Building2,
  ClipboardCheck,
  Loader2,
  Send,
  AlertCircle,
  Play,
  CheckSquare,
  Camera,
  MapPin,
  Clock,
} from 'lucide-react'

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
  notes: string
  photoUrl: string | null
}

interface InterventionData {
  id: string
  companyName: string
  clientName: string
  agentName: string
  scheduledDate: string
  status: 'pending' | 'in_progress' | 'completed'
  checklist: ChecklistItem[]
  qrToken: string
}

const demoIntervention: InterventionData = {
  id: 'INT-001',
  companyName: 'CleanPro Services',
  clientName: 'Bureau Martin & Associés',
  agentName: 'Sophie Laurent',
  scheduledDate: '15 Janvier 2025 - 09:00',
  status: 'pending',
  qrToken: 'tk_abc123',
  checklist: [
    { id: 'c1', label: 'Dépoussiérer les bureaux', completed: false, notes: '', photoUrl: null },
    { id: 'c2', label: 'Nettoyer les écrans', completed: false, notes: '', photoUrl: null },
    { id: 'c3', label: 'Vider les poubelles', completed: false, notes: '', photoUrl: null },
    { id: 'c4', label: 'Passer l\'aspirateur sur tous les sols', completed: false, notes: '', photoUrl: null },
    { id: 'c5', label: 'Nettoyer les vitres intérieures', completed: false, notes: '', photoUrl: null },
    { id: 'c6', label: 'Ranger et nettoyer la cuisine', completed: false, notes: '', photoUrl: null },
    { id: 'c7', label: 'Nettoyer et désinfecter les sanitaires', completed: false, notes: '', photoUrl: null },
    { id: 'c8', label: 'Vérifier le matériel de nettoyage', completed: false, notes: '', photoUrl: null },
  ],
}

export default function ScanPage() {
  const params = useParams()
  const [intervention, setIntervention] = useState<InterventionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [starting, setStarting] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState('')

  useState(() => {
    setTimeout(() => {
      setIntervention(demoIntervention)
      setLoading(false)
    }, 600)
  })

  const handleStart = async () => {
    setStarting(true)
    setError('')
    try {
      const res = await fetch(`/api/interventions/${intervention?.id}/scan-start`, { method: 'POST' })
      if (res.ok) {
        setStarted(true)
        setIntervention((prev) => prev ? { ...prev, status: 'in_progress' } : prev)
      } else {
        setError('Impossible de démarrer l\'intervention.')
      }
    } catch {
      // Demo fallback
      setStarted(true)
      setIntervention((prev) => prev ? { ...prev, status: 'in_progress' } : prev)
    } finally {
      setStarting(false)
    }
  }

  const handleFinish = async () => {
    setFinishing(true)
    setError('')
    try {
      const res = await fetch(`/api/interventions/${intervention?.id}/scan-end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: intervention?.checklist.map((item) => ({
            id: item.id,
            label: item.label,
            completed: item.completed,
            notes: item.notes,
          })),
        }),
      })
      if (res.ok) {
        setFinished(true)
      }
    } catch {
      // Demo fallback
      setFinished(true)
    } finally {
      setFinishing(false)
    }
  }

  const toggleItem = (id: string) => {
    if (!intervention) return
    setIntervention({
      ...intervention,
      checklist: intervention.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    })
  }

  const updateNotes = (id: string, notes: string) => {
    if (!intervention) return
    setIntervention({
      ...intervention,
      checklist: intervention.checklist.map((item) =>
        item.id === id ? { ...item, notes } : item
      ),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-4 py-8 space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!intervention) return null

  const completedCount = intervention.checklist.filter((i) => i.completed).length

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Intervention terminée !</h1>
          <p className="text-gray-500">
            Merci {intervention.agentName} ! Votre intervention a été enregistrée avec succès.
          </p>
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-sm text-emerald-700 font-medium">
              {completedCount}/{intervention.checklist.length} tâches terminées
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Propulsé par <span className="font-semibold text-emerald-600">CleanCheck</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <span className="font-bold text-lg">CleanCheck</span>
          <span className="ml-auto text-xs text-emerald-100">{intervention.qrToken}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-8">
        {/* Intervention Info */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <h1 className="text-base font-bold text-gray-900 mb-3">Détails de la mission</h1>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-500 w-16 shrink-0">Client:</span>
                <span className="font-medium text-gray-900 truncate">{intervention.clientName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-500 w-16 shrink-0">Date:</span>
                <span className="font-medium text-gray-900">{intervention.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-500 w-16 shrink-0">Agent:</span>
                <span className="font-medium text-gray-900">{intervention.agentName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Start Button */}
        {!started && (
          <Button
            onClick={handleStart}
            disabled={starting}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-200/50"
          >
            {starting ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" />Démarrage...</>
            ) : (
              <><Play className="h-5 w-5 mr-2" />Commencer l&apos;intervention</>
            )}
          </Button>
        )}

        {/* Checklist */}
        {started && (
          <>
            {/* Progress */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progression</span>
                <span className="text-sm font-bold text-emerald-600">{completedCount}/{intervention.checklist.length}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / intervention.checklist.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                Checklist
              </h2>
              {intervention.checklist.map((item, index) => (
                <Card key={item.id} className={`border-0 shadow-sm rounded-xl transition-all ${item.completed ? 'bg-emerald-50/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="mt-0.5 shrink-0"
                      >
                        {item.completed ? (
                          <CheckCircle className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.completed ? 'text-gray-900' : 'text-gray-700'}`}>
                          {index + 1}. {item.label}
                        </p>

                        {/* Expand notes/photo when checked */}
                        {item.completed && (
                          <div className="mt-3 space-y-2">
                            <Input
                              placeholder="Ajouter une note..."
                              value={item.notes}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="h-9 rounded-lg text-sm"
                            />
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs border-dashed">
                              <Camera className="h-3.5 w-3.5 mr-1.5" />
                              Ajouter une photo
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Finish Button */}
            <Button
              onClick={handleFinish}
              disabled={finishing}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-200/50"
            >
              {finishing ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" />Finalisation...</>
              ) : (
                <><CheckSquare className="h-5 w-5 mr-2" />Terminer l&apos;intervention</>
              )}
            </Button>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pt-4">
          Propulsé par <span className="font-semibold text-emerald-600">CleanCheck</span>
        </p>
      </div>
    </div>
  )
}
