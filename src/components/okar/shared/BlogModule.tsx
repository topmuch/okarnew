/**
 * OKAR - Blog Module (Shared)
 * Module d'affichage du blog pour les dashboards
 * - Affiche les articles publiés
 * - Supporte les catégories
 * - Design responsive
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BookOpen,
  Clock,
  ArrowRight,
  Calendar,
  User,
  Eye,
  ChevronRight,
  Loader2,
  Tag,
  ExternalLink,
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  category: string
  tags: string[] | null
  publishedAt: Date | string
  readingTime: number
  viewCount: number
  author: {
    name: string | null
  }
}

interface Category {
  name: string
  count: number
}

interface BlogModuleProps {
  variant?: 'light' | 'dark'
  maxPosts?: number
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  conseils: { label: 'Conseils', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  actualites: { label: 'Actualités', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  guides: { label: 'Guides', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  temoignages: { label: 'Témoignages', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
}

export function BlogModule({ variant = 'dark', maxPosts = 6 }: BlogModuleProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const url = selectedCategory !== 'all' 
        ? `/api/public/blog?category=${selectedCategory}&limit=${maxPosts}`
        : `/api/public/blog?limit=${maxPosts}`
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        setPosts(data.posts)
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (error) {
      console.error('Erreur chargement articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getCategoryConfig = (category: string) => {
    return CATEGORY_CONFIG[category] || { label: category, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  }

  const isDark = variant === 'dark'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-gray-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-gray-500'
  const cardBg = isDark ? 'bg-slate-800/40 backdrop-blur-md' : 'bg-white'
  const cardBorder = isDark ? 'border-white/10' : 'border-gray-200'

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}>
            <BookOpen className="h-6 w-6 text-[#ff6201]" />
            Blog
          </h2>
          <p className={`${textSecondary} mt-1`}>Conseils, actualités et guides automobiles</p>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' 
            ? 'bg-[#ff6201] text-white' 
            : isDark ? 'border-white/10 text-[#94A3B8]' : 'border-gray-200 text-gray-600'
          }
        >
          Tous
        </Button>
        {categories.map((cat) => {
          const config = getCategoryConfig(cat.name)
          return (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
              className={selectedCategory === cat.name 
                ? 'bg-[#ff6201] text-white' 
                : isDark ? 'border-white/10 text-[#94A3B8]' : 'border-gray-200 text-gray-600'
              }
            >
              {config.label}
              <Badge className="ml-2 bg-white/20 text-white text-xs">{cat.count}</Badge>
            </Button>
          )
        })}
      </div>

      {/* Liste des articles */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6201]" />
        </div>
      ) : posts.length === 0 ? (
        <Card className={`${cardBg} rounded-2xl border ${cardBorder}`}>
          <CardContent className="py-12 text-center">
            <BookOpen className={`h-12 w-12 ${textMuted} mx-auto mb-4`} />
            <p className={textSecondary}>Aucun article disponible</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const categoryConfig = getCategoryConfig(post.category)
            return (
              <Card 
                key={post.id}
                className={`${cardBg} rounded-2xl border ${cardBorder} overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group`}
                onClick={() => setSelectedPost(post)}
              >
                {/* Image de couverture */}
                {post.coverImage && (
                  <div className="relative h-40 bg-gray-100">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className={`absolute top-3 left-3 ${categoryConfig.color}`}>
                      {categoryConfig.label}
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-4">
                  {!post.coverImage && (
                    <Badge className={`mb-3 ${categoryConfig.color}`}>
                      {categoryConfig.label}
                    </Badge>
                  )}
                  
                  <h3 className={`font-semibold ${textPrimary} mb-2 line-clamp-2 group-hover:text-[#ff6201] transition-colors`}>
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className={`${textSecondary} text-sm mb-3 line-clamp-2`}>
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className={`flex items-center justify-between text-xs ${textMuted}`}>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} min
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#ff6201] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Voir plus */}
      {posts.length >= maxPosts && (
        <div className="text-center">
          <Button 
            variant="outline"
            className={isDark ? 'border-white/10 text-[#94A3B8]' : 'border-gray-200 text-gray-600'}
            onClick={() => window.open('/blog', '_blank')}
          >
            Voir tous les articles
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Dialog Article */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'} text-white max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl`}>
          {selectedPost && (
            <>
              {selectedPost.coverImage && (
                <div className="relative h-56 -mt-6 -mx-6 mb-4">
                  <img 
                    src={selectedPost.coverImage} 
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getCategoryConfig(selectedPost.category).color}>
                    {getCategoryConfig(selectedPost.category).label}
                  </Badge>
                </div>
                <DialogTitle className={`text-xl ${textPrimary}`}>
                  {selectedPost.title}
                </DialogTitle>
                <DialogDescription className={textSecondary}>
                  <div className="flex items-center gap-4 mt-2">
                    {selectedPost.author.name && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {selectedPost.author.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedPost.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedPost.readingTime} min de lecture
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedPost.viewCount} vues
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {selectedPost.excerpt && (
                  <p className={`${textSecondary} text-lg leading-relaxed mb-4`}>
                    {selectedPost.excerpt}
                  </p>
                )}

                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Tag className={`h-4 w-4 ${textMuted}`} />
                    {selectedPost.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className={isDark ? 'border-white/10 text-[#94A3B8]' : 'border-gray-200 text-gray-600'}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-white/10">
                  <Button
                    className="bg-gradient-to-r from-[#ff6201] to-pink-500 text-white"
                    onClick={() => window.open(`/blog/${selectedPost.slug}`, '_blank')}
                  >
                    Lire l'article complet
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BlogModule
