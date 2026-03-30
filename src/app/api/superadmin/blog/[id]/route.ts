/**
 * OKAR - API Superadmin Blog Post (Single)
 * 
 * GET /api/superadmin/blog/[id] - Récupère un article
 * PUT /api/superadmin/blog/[id] - Met à jour un article
 * DELETE /api/superadmin/blog/[id] - Supprime un article
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Récupère un article par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await db.blogPost.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      post
    })

  } catch (error) {
    console.error('Erreur récupération article:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    )
  }
}

// PUT - Met à jour un article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      status,
      publishedAt,
      metaTitle,
      metaDescription,
      readingTime,
    } = body

    // Vérifier que l'article existe
    const existingPost = await db.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Calculer le temps de lecture si non fourni
    const calculatedReadingTime = readingTime || Math.max(1, Math.ceil(content.split(/\s+/).length / 200))

    // Préparer les données de mise à jour
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (content !== undefined) {
      updateData.content = content
      updateData.readingTime = calculatedReadingTime
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription

    // Gérer le changement de statut
    if (status !== undefined) {
      updateData.status = status
      
      // Si on publie pour la première fois
      if (status === 'published' && existingPost.status !== 'published') {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date()
      }
    }

    // Mettre à jour l'article
    const post = await db.blogPost.update({
      where: { id },
      data: updateData,
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

    // Log d'audit
    await db.auditLog.create({
      data: {
        action: 'BLOG_POST_UPDATED',
        entityType: 'blog_post',
        entityId: post.id,
        details: JSON.stringify({
          title: post.title,
          slug: post.slug,
          status: post.status,
        }),
      }
    })

    return NextResponse.json({
      success: true,
      post
    })

  } catch (error) {
    console.error('Erreur mise à jour article:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    )
  }
}

// DELETE - Supprime un article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier que l'article existe
    const existingPost = await db.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'article
    await db.blogPost.delete({
      where: { id }
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        action: 'BLOG_POST_DELETED',
        entityType: 'blog_post',
        entityId: id,
        details: JSON.stringify({
          title: existingPost.title,
          slug: existingPost.slug,
        }),
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Article supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression article:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    )
  }
}
