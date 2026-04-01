/**
 * OKAR - API Publique Blog Posts
 * 
 * GET /api/public/blog - Liste les articles publiés
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where: any = {
      status: 'published',
      publishedAt: { lte: new Date() }
    }

    if (category && category !== 'all') {
      where.category = category
    }

    // Récupérer les articles publiés
    const posts = await db.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        publishedAt: true,
        readingTime: true,
        viewCount: true,
        author: {
          select: {
            name: true,
          }
        }
      }
    })

    // Compter le total pour pagination
    const total = await db.blogPost.count({ where })

    // Catégories disponibles
    const categories = await db.blogPost.groupBy({
      by: ['category'],
      where: { status: 'published' },
      _count: true,
    })

    return NextResponse.json({
      success: true,
      posts: posts.map(post => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      categories: categories.map(c => ({
        name: c.category,
        count: c._count
      }))
    })

  } catch (error) {
    console.error('Erreur récupération articles publics:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
}
