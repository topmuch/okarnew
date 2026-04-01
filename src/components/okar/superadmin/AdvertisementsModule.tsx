/**
 * OKAR - Advertisements Module
 * Superadmin interface for managing advertisements
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Link2,
  Eye,
  EyeOff,
  TrendingUp,
  Calendar,
  Loader2,
  MousePointer,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Advertisement {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  position: string
  isActive: boolean
  priority: number
  startDate?: Date
  endDate?: Date
  clickCount: number
  createdAt: Date
  updatedAt: Date
}

const POSITIONS = [
  { value: 'garage_dashboard_top', label: 'Dashboard Garage - Haut' },
  { value: 'garage_dashboard_side', label: 'Dashboard Garage - Côté' },
  { value: 'driver_dashboard_top', label: 'Dashboard Conducteur - Haut' },
  { value: 'landing_page_banner', label: 'Page d\'accueil - Bannière' },
]

export function AdvertisementsModule() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'garage_dashboard_top',
    priority: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/superadmin/advertisements')
      const data = await res.json()
      if (data.success) {
        setAds(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement publicités:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingAd(null)
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'garage_dashboard_top',
      priority: 0,
      isActive: true,
      startDate: '',
      endDate: ''
    })
    setDialogOpen(true)
  }

  const openEditDialog = (ad: Advertisement) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      position: ad.position,
      priority: ad.priority,
      isActive: ad.isActive,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : ''
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl || !formData.position) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const url = '/api/superadmin/advertisements'
      const method = editingAd ? 'PUT' : 'POST'
      const body = editingAd 
        ? { id: editingAd.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: editingAd ? 'Publicité mise à jour' : 'Publicité créée',
          description: editingAd 
            ? 'La publicité a été mise à jour avec succès'
            : 'La publicité a été créée avec succès',
        })
        setDialogOpen(false)
        fetchAds()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      const res = await fetch('/api/superadmin/advertisements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ad.id,
          isActive: !ad.isActive
        })
      })

      const data = await res.json()
      if (data.success) {
        setAds(ads.map(a => a.id === ad.id ? { ...a, isActive: !a.isActive } : a))
        toast({
          title: ad.isActive ? 'Publicité désactivée' : 'Publicité activée',
          description: `La publicité a été ${ad.isActive ? 'désactivée' : 'activée'}`,
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/superadmin/advertisements?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (data.success) {
        setAds(ads.filter(a => a.id !== id))
        setDeleteConfirm(null)
        toast({
          title: 'Publicité supprimée',
          description: 'La publicité a été supprimée avec succès',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la publicité',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPositionLabel = (position: string) => {
    const found = POSITIONS.find(p => p.value === position)
    return found?.label || position
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-pink-400" />
            Publicités
          </h2>
          <p className="text-[#94A3B8] mt-1">
            Gérez les publicités affichées dans les dashboards
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle publicité
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {ads.filter(a => a.isActive).length}
                </p>
                <p className="text-sm text-[#94A3B8]">Publicités actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <MousePointer className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {ads.reduce((sum, a) => sum + a.clickCount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-[#94A3B8]">Total clics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-okar-dark-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{ads.length}</p>
                <p className="text-sm text-[#94A3B8]">Total publicités</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Toutes les publicités</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune publicité créée</p>
              <Button
                onClick={openCreateDialog}
                variant="outline"
                className="mt-4 border-white/10 text-[#94A3B8]"
              >
                Créer une publicité
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="flex items-center gap-4 p-4 bg-okar-dark-800/30 rounded-xl border border-white/5 hover:bg-okar-dark-800/50 transition-colors"
                >
                  {/* Image */}
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">{ad.title}</h3>
                      <Badge className={ad.isActive 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#94A3B8] truncate mt-1">{ad.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                      <span>{getPositionLabel(ad.position)}</span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        {ad.clickCount} clics
                      </span>
                      <span>Créé le {formatDate(ad.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(ad)}
                      className={ad.isActive
                        ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        : 'border-gray-500/30 text-gray-400 hover:bg-gray-500/10'
                      }
                    >
                      {ad.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(ad)}
                      className="border-white/10 text-[#94A3B8] hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(ad.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-okar-dark-card border-white/10 text-okar-text-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-pink-400" />
              {editingAd ? 'Modifier la publicité' : 'Nouvelle publicité'}
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              {editingAd 
                ? 'Modifiez les informations de la publicité'
                : 'Créez une nouvelle publicité à afficher dans les dashboards'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Titre *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la publicité"
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description courte de la publicité"
                rows={2}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary">URL de l'image *</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
              {formData.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Lien (URL de destination)</Label>
              <Input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://..."
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Position *</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-okar-dark-800 border-white/10">
                  {POSITIONS.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value} className="text-white hover:bg-white/5">
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-okar-text-secondary">Priorité</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
                <p className="text-xs text-[#64748B]">Plus élevé = affiché en premier</p>
              </div>
              <div className="space-y-2">
                <Label className="text-okar-text-secondary">Statut</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <span className="text-sm text-[#94A3B8]">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-okar-text-secondary">Date de début</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-okar-text-secondary">Date de fin</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1 border-white/10 text-okar-text-secondary"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Megaphone className="h-4 w-4 mr-2" />
              )}
              {editingAd ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-okar-dark-card border-white/10 text-okar-text-primary">
          <DialogHeader>
            <DialogTitle className="text-red-400">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Êtes-vous sûr de vouloir supprimer cette publicité ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 border-white/10 text-okar-text-secondary"
            >
              Annuler
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdvertisementsModule
