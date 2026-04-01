/**
 * OKAR - Blog Card Component
 * 
 * Carte pour afficher un article de blog dans le dashboard Superadmin
 * Design: Dark Luxe avec glassmorphism
 */

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Archive,
  Send,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Catégories avec labels français
const CATEGORY_LABELS: Record<string, string> = {
  conseils: 'Conseils',
  actualites: 'Actualités',
  guides: 'Guides',
  temoignages: 'Témoignages',
}

// Couleurs par catégorie
const CATEGORY_COLORS: Record<string, string> = {
  conseils: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  actualites: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  guides: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  temoignages: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// Couleurs par statut
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export interface BlogCardData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  category: string
  tags: string[]
  status: string
  publishedAt: string | null
  viewCount: number
  readingTime: number
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
}

interface BlogCardProps {
  post: BlogCardData
  onEdit: (postId: string) => void
  onDelete: (postId: string) => void
  onStatusChange: (postId: string, status: 'draft' | 'published' | 'archived') => void
  onDuplicate?: (postId: string) => void
}

export function BlogCard({
  post,
  onEdit,
  onDelete,
  onStatusChange,
  onDuplicate,
}: BlogCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non publié'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleDelete = () => {
    onDelete(post.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg shadow-black/20 overflow-hidden hover:border-[#ff6201]/30 transition-all duration-300 group">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={cn('text-xs font-medium border', STATUS_COLORS[post.status])}>
              {STATUS_LABELS[post.status] || post.status}
            </Badge>
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 right-2">
            <Badge className={cn('text-xs font-medium border', CATEGORY_COLORS[post.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
              {CATEGORY_LABELS[post.category] || post.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-[#ff6201] transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-[#94A3B8] line-clamp-2 mb-3">
            {post.excerpt || 'Aucun résumé'}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-[#64748B] mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime} min</span>
            </div>
          </div>

          {/* Author */}
          <div className="text-xs text-[#64748B] mb-3">
            Par <span className="text-[#94A3B8]">{post.author.name || post.author.email}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(post.id)}
                className="h-8 px-3 text-[#94A3B8] hover:text-white hover:bg-white/5"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Éditer
              </Button>
              {post.status === 'published' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                  className="h-8 px-3 text-[#94A3B8] hover:text-white hover:bg-white/5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#64748B] hover:text-white hover:bg-white/5">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-white/10">
                {post.status === 'draft' && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(post.id, 'published')}
                    className="text-green-400 focus:text-green-300 focus:bg-white/5"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publier
                  </DropdownMenuItem>
                )}
                {post.status === 'published' && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(post.id, 'archived')}
                    className="text-amber-400 focus:text-amber-300 focus:bg-white/5"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archiver
                  </DropdownMenuItem>
                )}
                {post.status === 'archived' && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(post.id, 'published')}
                    className="text-green-400 focus:text-green-300 focus:bg-white/5"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Republier
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem
                    onClick={() => onDuplicate(post.id)}
                    className="text-[#94A3B8] focus:text-white focus:bg-white/5"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Dupliquer
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-400 focus:text-red-300 focus:bg-white/5"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Supprimer l'article ?</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Êtes-vous sûr de vouloir supprimer "{post.title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BlogCard
