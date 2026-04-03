'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ListChecks,
  Plus,
  Clock,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  X,
} from 'lucide-react'

interface TemplateItem {
  id: string
  label: string
  category: string
}

interface ChecklistTemplate {
  id: string
  name: string
  items: TemplateItem[]
  estimatedDuration: number
  usageCount: number
}

const demoTemplates: ChecklistTemplate[] = [
  {
    id: '1',
    name: 'Nettoyage Bureau Standard',
    items: [
      { id: 'i1', label: 'Dépoussiérer les bureaux', category: 'Surfaces' },
      { id: 'i2', label: 'Nettoyer les écrans', category: 'Surfaces' },
      { id: 'i3', label: 'Vider les poubelles', category: 'Déchets' },
      { id: 'i4', label: 'Passer l\'aspirateur', category: 'Sols' },
      { id: 'i5', label: 'Nettoyer les vitres', category: 'Vitres' },
      { id: 'i6', label: 'Ranger la cuisine', category: 'Commun' },
    ],
    estimatedDuration: 90,
    usageCount: 47,
  },
  {
    id: '2',
    name: 'Nettoyage Hôtel Chambre',
    items: [
      { id: 'i7', label: 'Changer les draps', category: 'Literie' },
      { id: 'i8', label: 'Nettoyer la salle de bain', category: 'SDB' },
      { id: 'i9', label: 'Passer l\'aspirateur', category: 'Sols' },
      { id: 'i10', label: 'Rempluir les amenities', category: 'Détails' },
    ],
    estimatedDuration: 45,
    usageCount: 120,
  },
  {
    id: '3',
    name: 'Nettoyage Profond',
    items: [
      { id: 'i11', label: 'Nettoyer les fenêtres', category: 'Vitres' },
      { id: 'i12', label: 'Dégraisser la cuisine', category: 'Cuisine' },
      { id: 'i13', label: 'Nettoyer les joints', category: 'SDB' },
      { id: 'i14', label: 'Aspirateur moquette profonde', category: 'Sols' },
      { id: 'i15', label: 'Désinfecter les poignées', category: 'Hygiène' },
    ],
    estimatedDuration: 180,
    usageCount: 15,
  },
  {
    id: '4',
    name: 'Nettoyage Fin de Chantier',
    items: [
      { id: 'i16', label: 'Retirer les débris', category: 'Préparation' },
      { id: 'i17', label: 'Nettoyer les sols', category: 'Sols' },
      { id: 'i18', label: 'Dépoussiérer toutes surfaces', category: 'Surfaces' },
      { id: 'i19', label: 'Nettoyer vitres intérieures', category: 'Vitres' },
    ],
    estimatedDuration: 240,
    usageCount: 8,
  },
]

function CreateTemplateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('')
  const [items, setItems] = useState<TemplateItem[]>([{ id: 'new-1', label: '', category: 'Général' }])
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { id: `new-${Date.now()}`, label: '', category: 'Général' }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const updateItem = (id: string, field: 'label' | 'category', value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const handleSave = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un template de checklist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nom du template</Label>
            <Input
              placeholder="Ex: Nettoyage Bureau Standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Tâches</Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 shrink-0">{index + 1}.</span>
                  <Input
                    placeholder="Description de la tâche"
                    value={item.label}
                    onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                    className="flex-1 h-9 rounded-lg text-sm"
                  />
                  <Input
                    placeholder="Catégorie"
                    value={item.category}
                    onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                    className="w-28 h-9 rounded-lg text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-400 hover:text-red-500 shrink-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-lg border-dashed" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une tâche
            </Button>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {loading ? 'Enregistrement...' : 'Créer le template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ChecklistsPage() {
  const [templates] = useState<ChecklistTemplate[]>(demoTemplates)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}min`
    if (h > 0) return `${h}h`
    return `${m}min`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates de checklists</h1>
          <p className="text-gray-500 text-sm mt-1">{templates.length} template(s)</p>
        </div>
        <CreateTemplateDialog open={false} onOpenChange={() => {}}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer un template
            </Button>
          </DialogTrigger>
        </CreateTemplateDialog>
      </div>

      <div className="space-y-4">
        {templates.map((template) => {
          const isExpanded = expandedId === template.id
          return (
            <Card key={template.id} className="border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <ListChecks className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <ListChecks className="h-3 w-3" />
                          {template.items.length} tâches
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ~{formatDuration(template.estimatedDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                      {template.usageCount} utilisations
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : template.id)}
                      className="text-gray-500"
                    >
                      {isExpanded ? 'Masquer' : 'Détails'}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Tâches du template</p>
                    <div className="space-y-2">
                      {template.items.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-semibold text-emerald-700 shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                          <Badge variant="outline" className="text-xs text-gray-500">{item.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
