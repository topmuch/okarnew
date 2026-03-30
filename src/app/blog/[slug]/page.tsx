/**
 * OKAR - Page Article de Blog
 * 
 * URL: /blog/[slug]
 * 
 * Affiche un article de blog complet.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Tag,
  User,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { BackToHomeButton } from '@/components/okar/BackToHomeButton'

// Types
interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  viewCount: number
  metaTitle: string | null
  metaDescription: string | null
  author: {
    name: string | null
  }
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string
}

// Catégories avec labels français
const CATEGORY_LABELS: Record<string, string> = {
  conseils: 'Conseils',
  actualites: 'Actualités',
  guides: 'Guides',
  temoignages: 'Témoignages',
}

// Couleurs par catégorie
const CATEGORY_COLORS: Record<string, string> = {
  conseils: 'bg-blue-100 text-blue-700',
  actualites: 'bg-amber-100 text-amber-700',
  guides: 'bg-emerald-100 text-emerald-700',
  temoignages: 'bg-purple-100 text-purple-700',
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/public/blog/${slug}`)
        const data = await response.json()

        if (data.success) {
          setPost(data.post)
          setRelatedPosts(data.relatedPosts || [])
        } else {
          setError(data.error || 'Article non trouvé')
        }
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur lors du chargement de l\'article')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  // Partager l'article
  const shareArticle = (platform: 'facebook' | 'twitter' | 'copy') => {
    if (!post) return

    const url = window.location.href
    const title = post.title

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        // Toast notification could be added here
        break
    }
    setShowShareMenu(false)
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Renderer simple pour le contenu Markdown
  const renderContent = (content: string) => {
    // Conversion basique Markdown -> HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-12 mb-6">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-rose-600 hover:underline" target="_blank" rel="noopener">$1</a>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-6 text-gray-600">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 text-gray-600">$2</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
      // Line breaks
      .replace(/\n/g, '<br/>')

    return `<div class="prose prose-lg max-w-none"><p class="text-gray-600 leading-relaxed mb-4">${html}</p></div>`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 rounded-full animate-spin border-t-rose-500 mx-auto" />
          <p className="mt-4 text-gray-500">Chargement de l'article...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Article non trouvé</h1>
          <p className="text-gray-500 mb-6">{error || 'Cet article n\'existe pas ou a été supprimé.'}</p>
          <Link href="/blog">
            <button className="px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors">
              Retour au blog
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Accueil
            </Link>
            <Link href="/blog" className="text-rose-600 font-medium">
              Blog
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/blog" className="text-gray-500 hover:text-gray-700">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux articles
        </Link>

        {/* Article Header */}
        <article>
          {/* Category */}
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 ${
            CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'
          }`}>
            {CATEGORY_LABELS[post.category] || post.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author.name || 'OKAR'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min de lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount} vues</span>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative rounded-2xl overflow-hidden mb-8 aspect-video">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-gray-100 mb-8">
              <Tag className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center justify-between py-6 border-t border-b border-gray-100 mb-12">
            <span className="font-medium text-gray-700">Partager cet article</span>
            <div className="relative">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-48 z-10">
                  <button 
                    onClick={() => shareArticle('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Facebook
                  </button>
                  <button 
                    onClick={() => shareArticle('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <Twitter className="w-4 h-4 text-sky-500" />
                    Twitter
                  </button>
                  <button 
                    onClick={() => shareArticle('copy')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                    Copier le lien
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles connexes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {relatedPost.coverImage ? (
                      <img
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(relatedPost.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to blog */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tous les articles
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} OKAR - Passeport Numérique Automobile au Sénégal
          </p>
        </div>
      </footer>
    </div>
  )
}
