/**
 * OKAR - API Superadmin Blog Posts
 * 
 * GET /api/superadmin/blog - Liste tous les articles
 * POST /api/superadmin/blog - Crée un nouvel article
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Liste tous les articles (avec filtres)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const posts = await db.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // drafts first
        { createdAt: 'desc' }
      ]
    })

    // Stats
    const stats = await db.blogPost.groupBy({
      by: ['status'],
      _count: true
    })

    const statsObj = {
      total: posts.length,
      draft: stats.find(s => s.status === 'draft')?._count || 0,
      published: stats.find(s => s.status === 'published')?._count || 0,
      archived: stats.find(s => s.status === 'archived')?._count || 0,
    }

    return NextResponse.json({
      success: true,
      posts,
      stats: statsObj
    })

  } catch (error) {
    console.error('Erreur récupération articles:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      status = 'draft',
      authorId,
      publishedAt,
      metaTitle,
      metaDescription,
      readingTime,
    } = body

    // Log pour debug
    console.log('Blog POST request:', { 
      title, 
      slug, 
      category, 
      authorId, 
      contentLength: content?.length,
      hasExcerpt: !!excerpt 
    })

    // Validation détaillée
    const missingFields = []
    if (!title?.trim()) missingFields.push('titre')
    if (!slug?.trim()) missingFields.push('slug')
    if (!content?.trim()) missingFields.push('contenu')
    if (!category) missingFields.push('catégorie')
    if (!authorId) missingFields.push('auteur (authorId)')

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields)
      return NextResponse.json(
        { success: false, error: `Champs manquants: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Vérifier que l'auteur existe
    const author = await db.user.findUnique({
      where: { id: authorId }
    })

    if (!author) {
      console.log('Author not found:', authorId)
      return NextResponse.json(
        { success: false, error: 'Auteur non trouvé. Veuillez vous reconnecter.' },
        { status: 400 }
      )
    }

    // Vérifier que le slug est unique
    const existingPost = await db.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Un article avec ce slug existe déjà' },
        { status: 400 }
      )
    }

    // Calculer le temps de lecture si non fourni (~200 mots/minute)
    const calculatedReadingTime = readingTime || Math.max(1, Math.ceil(content.split(/\s+/).length / 200))

    // Préparer l'excerpt
    const finalExcerpt = excerpt?.trim() || content.slice(0, 160) + '...'

    // Créer l'article
    const post = await db.blogPost.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        excerpt: finalExcerpt,
        coverImage: coverImage?.trim() || null,
        category,
        tags: tags && Array.isArray(tags) ? JSON.stringify(tags) : null,
        status,
        authorId,
        publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        readingTime: calculatedReadingTime,
        metaTitle: metaTitle?.trim() || title.trim(),
        metaDescription: metaDescription?.trim() || finalExcerpt,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Log d'audit (non-bloquant)
    try {
      await db.auditLog.create({
        data: {
          action: 'BLOG_POST_CREATED',
          entityType: 'blog_post',
          entityId: post.id,
          details: JSON.stringify({
            title: post.title,
            slug: post.slug,
            status: post.status,
          }),
        },
      })
    } catch (auditError) {
      console.log('Audit log error (non-critical):', auditError)
    }

    console.log('Blog post created successfully:', post.id)

    return NextResponse.json({
      success: true,
      post
    })

  } catch (error: any) {
    console.error('Erreur création article:', error)
    
    // Erreur Prisma spécifique - table n'existe pas
    if (error.code === 'P2021') {
      return NextResponse.json(
        { success: false, error: 'Table BlogPost non trouvée. Veuillez exécuter la migration de la base de données.' },
        { status: 500 }
      )
    }
    
    // Erreur de contrainte unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Un article avec ce slug existe déjà.' },
        { status: 400 }
      )
    }
    
    // Erreur de clé étrangère
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Auteur non trouvé dans la base de données.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}
