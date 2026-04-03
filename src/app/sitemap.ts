import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shopqr.pro'
  const now = new Date()

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cgu`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Pages dynamiques : Articles de Blog
  try {
    const blogPosts = await db.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    staticPages.push(...blogPages)
  } catch (error) {
    // En cas d'erreur DB, on continue sans les pages dynamiques
    console.warn('Sitemap: Impossible de charger les articles de blog', error)
  }

  // Pages dynamiques : Profils Garages publics certifiés
  try {
    const garages = await db.garage.findMany({
      where: { isVerified: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const garagePages: MetadataRoute.Sitemap = garages.map((garage) => ({
      url: `${baseUrl}/garage/${garage.id}`,
      lastModified: garage.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    staticPages.push(...garagePages)
  } catch (error) {
    console.warn('Sitemap: Impossible de charger les garages', error)
  }

  return staticPages
}
