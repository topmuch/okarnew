/**
 * OKAR - API Publique Blog Post (Single by Slug)
 * 
 * GET /api/public/blog/[slug] - Récupère un article publié par son slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await db.blogPost.findFirst({
      where: {
        slug,
        status: 'published',
        publishedAt: { lte: new Date() }
      },
      include: {
        author: {
          select: {
            name: true,
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Incrémenter le compteur de vues
    await db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    // Récupérer les articles connexes (même catégorie)
    const relatedPosts = await db.blogPost.findMany({
      where: {
        status: 'published',
        category: post.category,
        id: { not: post.id },
        publishedAt: { lte: new Date() }
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      },
      relatedPosts
    })

  } catch (error) {
    console.error('Erreur récupération article:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    )
  }
}
