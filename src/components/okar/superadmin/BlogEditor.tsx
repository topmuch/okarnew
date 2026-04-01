/**
 * OKAR - Blog Editor Component
 * 
 * Éditeur d'articles de blog pour le dashboard Superadmin
 * Support Markdown, aperçu en temps réel, SEO
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Image as ImageIcon,
  Link2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface BlogPostData {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  category: string
  tags: string[]
  status: string
  publishedAt: string | null
  metaTitle: string | null
  metaDescription: string | null
  authorId?: string
}

interface BlogEditorProps {
  post?: BlogPostData | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<BlogPostData>) => Promise<void>
  authorId: string
}

// Catégories disponibles
const CATEGORIES = [
  { value: 'conseils', label: 'Conseils' },
  { value: 'actualites', label: 'Actualités' },
  { value: 'guides', label: 'Guides' },
  { value: 'temoignages', label: 'Témoignages' },
]

export function BlogEditor({
  post,
  isOpen,
  onClose,
  onSave,
  authorId,
}: BlogEditorProps) {
  const [formData, setFormData] = useState<BlogPostData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: 'conseils',
    tags: [],
    status: 'draft',
    publishedAt: null,
    metaTitle: '',
    metaDescription: '',
    authorId,
  })

  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'seo'>('editor')

  // Initialiser le formulaire
  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        tags: post.tags || [],
      })
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        coverImage: '',
        category: 'conseils',
        tags: [],
        status: 'draft',
        publishedAt: null,
        metaTitle: '',
        metaDescription: '',
        authorId,
      })
    }
  }, [post, authorId, isOpen])

  // Générer le slug automatiquement
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets doubles
      .trim()
  }

  // Gérer le changement de titre
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      metaTitle: prev.metaTitle || title.slice(0, 60),
    }))
  }

  // Ajouter un tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  // Supprimer un tag
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  // Insérer du Markdown
  const insertMarkdown = (type: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    let insertion = ''

    switch (type) {
      case 'bold':
        insertion = `**${selectedText || 'texte en gras'}**`
        break
      case 'italic':
        insertion = `*${selectedText || 'texte en italique'}*`
        break
      case 'h2':
        insertion = `\n## ${selectedText || 'Titre 2'}\n`
        break
      case 'h3':
        insertion = `\n### ${selectedText || 'Titre 3'}\n`
        break
      case 'list':
        insertion = `\n- ${selectedText || 'Élément de liste'}\n`
        break
      case 'ordered-list':
        insertion = `\n1. ${selectedText || 'Élément de liste'}\n`
        break
      case 'quote':
        insertion = `\n> ${selectedText || 'Citation'}\n`
        break
      case 'link':
        insertion = `[${selectedText || 'texte du lien'}](url)`
        break
      case 'image':
        insertion = `![${selectedText || 'description'}](url-image)`
        break
    }

    const newContent = formData.content.substring(0, start) + insertion + formData.content.substring(end)
    setFormData(prev => ({ ...prev, content: newContent }))

    // Re-focus le textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insertion.length, start + insertion.length)
    }, 0)
  }

  // Sauvegarder
  const handleSave = async (publish: boolean = false) => {
    // Validation côté client
    if (!formData.title.trim()) {
      toast.error('Le titre est requis')
      return
    }
    if (!formData.slug.trim()) {
      toast.error('Le slug est requis')
      return
    }
    if (!formData.content.trim()) {
      toast.error('Le contenu est requis')
      return
    }
    if (!formData.category) {
      toast.error('La catégorie est requise')
      return
    }
    if (!authorId) {
      toast.error('Erreur: Utilisateur non connecté')
      return
    }

    setIsSaving(true)
    try {
      const dataToSave: Partial<BlogPostData> = {
        ...formData,
        status: publish ? 'published' : formData.status,
        publishedAt: publish && !formData.publishedAt ? new Date().toISOString() : formData.publishedAt,
      }
      await onSave(dataToSave)
      toast.success(publish ? 'Article publié avec succès!' : 'Article enregistré')
      onClose()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  // Render le contenu Markdown en HTML simple
  const renderMarkdown = (content: string) => {
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-8 mb-4">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#ff6201] hover:underline" target="_blank">$1</a>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-[#94A3B8]">$1</li>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#ff6201] pl-4 italic text-[#94A3B8] my-4">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="text-[#94A3B8] leading-relaxed mb-4">')
      .replace(/\n/g, '<br/>')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] bg-slate-900 border-white/10 text-white overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {post ? 'Modifier l\'article' : 'Nouvel article'}
              </DialogTitle>
              <DialogDescription className="text-[#94A3B8]">
                Créez ou modifiez un article de blog
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[#94A3B8] hover:text-white hover:bg-white/5"
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-white/10 flex-shrink-0" />

        {/* Tabs */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant={activeTab === 'editor' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('editor')}
            className={activeTab === 'editor' 
              ? 'bg-[#ff6201] text-white' 
              : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }
          >
            Éditeur
          </Button>
          <Button
            variant={activeTab === 'seo' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('seo')}
            className={activeTab === 'seo' 
              ? 'bg-[#ff6201] text-white' 
              : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }
          >
            SEO
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'editor' ? (
            <div className="space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#94A3B8] text-sm">Titre *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Titre de l'article"
                    className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50"
                  />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-sm">Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-de-l-article"
                    className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50"
                  />
                </div>
              </div>

              {/* Category & Cover Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#94A3B8] text-sm">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-white/5 focus:bg-white/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-sm">Image de couverture</Label>
                  <Input
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://..."
                    className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <Label className="text-[#94A3B8] text-sm">Résumé</Label>
                <Input
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Bref résumé de l'article (160 caractères max)"
                  maxLength={160}
                  className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50"
                />
                <p className="text-xs text-[#64748B] mt-1">{(formData.excerpt || '').length}/160</p>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-[#94A3B8] text-sm">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Ajouter un tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50"
                  />
                  <Button
                    variant="outline"
                    onClick={addTag}
                    className="border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5"
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-white/5 text-[#94A3B8] border-white/10 cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <Label className="text-[#94A3B8] text-sm mb-2 block">Contenu *</Label>
                
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-slate-800 rounded-lg border border-white/10">
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('bold')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('italic')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-8 mx-1 bg-white/10" />
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('h2')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <Heading2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('h3')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <Heading3 className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-8 mx-1 bg-white/10" />
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('list')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('ordered-list')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('quote')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-8 mx-1 bg-white/10" />
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('link')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('image')} className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white hover:bg-white/5">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Editor / Preview Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <textarea
                      id="content-editor"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Écrivez votre article en Markdown..."
                      className="w-full h-80 p-4 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50 focus:outline-none resize-none font-mono text-sm"
                    />
                  </div>
                  <div className="h-80 p-4 bg-slate-800/50 border border-white/10 rounded-lg overflow-y-auto">
                    <div className="prose prose-invert max-w-none">
                      {formData.content ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content) }} />
                      ) : (
                        <p className="text-[#64748B] italic">L'aperçu apparaîtra ici...</p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#64748B] mt-2">
                  {formData.content.split(/\s+/).length} mots • ~{Math.max(1, Math.ceil(formData.content.split(/\s+/).length / 200))} min de lecture
                </p>
              </div>
            </div>
          ) : (
            /* SEO Tab */
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#ff6201] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#94A3B8]">
                  <p className="font-medium text-white mb-1">Optimisation SEO</p>
                  <p>Remplissez ces champs pour améliorer le référencement de votre article sur les moteurs de recherche.</p>
                </div>
              </div>

              <div>
                <Label className="text-[#94A3B8] text-sm">Titre SEO</Label>
                <Input
                  value={formData.metaTitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Titre optimisé pour le SEO (60 caractères max)"
                  maxLength={60}
                  className="bg-slate-800 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50"
                />
                <p className="text-xs text-[#64748B] mt-1">{(formData.metaTitle || '').length}/60 caractères</p>
              </div>

              <div>
                <Label className="text-[#94A3B8] text-sm">Description SEO</Label>
                <textarea
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Description de l'article pour les moteurs de recherche (160 caractères max)"
                  maxLength={160}
                  className="w-full h-24 p-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-[#64748B] focus:border-[#ff6201]/50 focus:outline-none resize-none"
                />
                <p className="text-xs text-[#64748B] mt-1">{(formData.metaDescription || '').length}/160 caractères</p>
              </div>

              {/* Preview Google */}
              <div>
                <Label className="text-[#94A3B8] text-sm mb-2 block">Aperçu Google</Label>
                <div className="bg-white rounded-lg p-4 max-w-xl">
                  <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                    {formData.metaTitle || formData.title || 'Titre de l\'article'}
                  </p>
                  <p className="text-green-700 text-sm truncate">
                    okar.sn/blog/{formData.slug || 'article-slug'}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                    {formData.metaDescription || formData.excerpt || 'Description de l\'article...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-white/10 flex-shrink-0" />

        {/* Footer Actions */}
        <div className="flex items-center justify-between flex-shrink-0 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="bg-[#ff6201] hover:bg-[#ff6201]/90 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {formData.status === 'published' ? 'Mettre à jour' : 'Publier'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BlogEditor
